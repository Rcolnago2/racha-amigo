import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle, Clock, Eye, ShieldCheck, Plus, ArrowLeft,
  Trash2, Upload, Loader2,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ADMIN_PASSWORD = "queijo2025";

interface Rateio {
  id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  unit_type: string;
  total_quantity: number;
  price_per_unit: number;
  admin_fee_percent: number;
  pix_key: string;
  pix_merchant_name: string;
  status: string;
  created_at: string;
  slug: string;
  visibility: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  percent: number;
  value_brl: number;
  weight_kg: number;
  payment_confirmed: boolean;
  receipt_url: string | null;
  rateio_id: string | null;
}

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [rateios, setRateios] = useState<Rateio[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [view, setView] = useState<"list" | "create" | "detail" | "edit">("list");
  const [selectedRateio, setSelectedRateio] = useState<Rateio | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    title: "", description: "", unit_type: "kg",
    total_quantity: "5", price_per_unit: "90",
    admin_fee_percent: "5", pix_key: "rcolnago+magie@gmail.com",
    pix_merchant_name: "COMPRA COLETIVA",
    slug: "", visibility: "public",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
    else toast({ title: "Senha incorreta", variant: "destructive" });
  };

  useEffect(() => {
    if (!authenticated) return;
    loadData();
  }, [authenticated]);

  const loadData = async () => {
    const [rRes, pRes] = await Promise.all([
      supabase.from("rateios").select("*").order("created_at", { ascending: false }),
      supabase.from("participants").select("*").order("created_at", { ascending: true }),
    ]);
    if (rRes.data) setRateios(rRes.data);
    if (pRes.data) setParticipants(pRes.data);
  };

  const createRateio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast({ title: "Informe o título", variant: "destructive" }); return; }
    setSaving(true);

    try {
      let photo_url: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("rateio-photos").upload(path, photoFile);
        if (upErr) throw upErr;
        photo_url = supabase.storage.from("rateio-photos").getPublicUrl(path).data.publicUrl;
      }

      const slug = form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { error } = await supabase.from("rateios").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        photo_url,
        unit_type: form.unit_type,
        total_quantity: Number(form.total_quantity),
        price_per_unit: Number(form.price_per_unit),
        admin_fee_percent: Number(form.admin_fee_percent),
        pix_key: form.pix_key.trim(),
        pix_merchant_name: form.pix_merchant_name.trim(),
        slug,
        visibility: form.visibility,
      });
      if (error) throw error;

      toast({ title: "Rateio criado! ✅" });
      setForm({
        title: "", description: "", unit_type: "kg",
        total_quantity: "5", price_per_unit: "90",
        admin_fee_percent: "5", pix_key: "rcolnago+magie@gmail.com",
        pix_merchant_name: "COMPRA COLETIVA",
        slug: "", visibility: "public",
      });
      setPhotoFile(null);
      await loadData();
      setView("list");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao criar rateio", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmPayment = async (id: string) => {
    const { error } = await supabase.from("participants").update({ payment_confirmed: true }).eq("id", id);
    if (error) { toast({ title: "Erro ao confirmar", variant: "destructive" }); return; }
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, payment_confirmed: true } : p)));
    toast({ title: "Pagamento confirmado! ✅" });
  };

  const deleteRateio = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este rateio e todos os participantes?")) return;
    await supabase.from("rateios").delete().eq("id", id);
    await loadData();
    if (selectedRateio?.id === id) setView("list");
    toast({ title: "Rateio excluído" });
  };

  const startEdit = (r: Rateio) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      description: r.description || "",
      unit_type: r.unit_type,
      total_quantity: String(r.total_quantity),
      price_per_unit: String(r.price_per_unit),
      admin_fee_percent: String(r.admin_fee_percent),
      pix_key: r.pix_key,
      pix_merchant_name: r.pix_merchant_name,
      slug: r.slug,
      visibility: r.visibility,
    });
    setPhotoFile(null);
    setView("edit");
  };

  const updateRateio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !form.title.trim()) { toast({ title: "Informe o título", variant: "destructive" }); return; }
    setSaving(true);

    try {
      let photo_url: string | undefined = undefined;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("rateio-photos").upload(path, photoFile);
        if (upErr) throw upErr;
        photo_url = supabase.storage.from("rateio-photos").getPublicUrl(path).data.publicUrl;
      }

      const slug = form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const updateData = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        unit_type: form.unit_type,
        total_quantity: Number(form.total_quantity),
        price_per_unit: Number(form.price_per_unit),
        admin_fee_percent: Number(form.admin_fee_percent),
        pix_key: form.pix_key.trim(),
        pix_merchant_name: form.pix_merchant_name.trim(),
        slug,
        visibility: form.visibility,
        ...(photo_url ? { photo_url } : {}),
      };

      const { error } = await supabase.from("rateios").update(updateData).eq("id", editingId);
      if (error) throw error;

      toast({ title: "Rateio atualizado! ✅" });
      await loadData();
      setView("list");
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao atualizar rateio", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-card border border-border rounded-xl p-8 shadow-lg w-full max-w-sm space-y-4">
          <div className="text-center">
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2" />
            <h1 className="text-xl font-heading font-bold text-foreground">Área do Administrador</h1>
            <p className="text-sm text-muted-foreground">Digite a senha para acessar</p>
          </div>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="bg-background" />
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </div>
    );
  }

  // CREATE VIEW
  if (view === "create") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-heading font-bold text-foreground">Novo Rateio</h1>
          </div>
        </header>
        <main className="container max-w-3xl mx-auto px-4 py-8">
          <form onSubmit={createRateio} className="bg-card border border-border rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Título *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Queijo Canastra Artesanal" className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Descrição</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes do produto..." className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Foto do produto</label>
              <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Unidade</label>
                <Select value={form.unit_type} onValueChange={(v) => setForm({ ...form, unit_type: v })}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="litro">Litro (L)</SelectItem>
                    <SelectItem value="unidade">Unidade (un)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Quantidade total</label>
                <Input type="number" step="0.1" min="0.1" value={form.total_quantity} onChange={(e) => setForm({ ...form, total_quantity: e.target.value })} className="bg-background" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Preço por unidade (R$)</label>
                <Input type="number" step="0.01" min="0" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Taxa admin (%)</label>
                <Input type="number" step="1" min="0" max="100" value={form.admin_fee_percent} onChange={(e) => setForm({ ...form, admin_fee_percent: e.target.value })} className="bg-background" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Chave PIX</label>
              <Input value={form.pix_key} onChange={(e) => setForm({ ...form, pix_key: e.target.value })} placeholder="email@exemplo.com" className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nome do beneficiário PIX</label>
              <Input value={form.pix_merchant_name} onChange={(e) => setForm({ ...form, pix_merchant_name: e.target.value })} placeholder="COMPRA COLETIVA" className="bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Slug (URL)</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="ex: queijo-canastra" className="bg-background" />
                <p className="text-xs text-muted-foreground">Se vazio, será gerado pelo título</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Visibilidade</label>
                <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="secret">Secreto (só com link)</SelectItem>
                    <SelectItem value="hidden">Oculto (não aparece)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Total estimado</p>
              <p className="text-xl font-heading font-bold text-foreground">
                R$ {(Number(form.total_quantity) * Number(form.price_per_unit) * (1 + Number(form.admin_fee_percent) / 100)).toFixed(2).replace(".", ",")}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Criando..." : "Criar Rateio"}
            </Button>
          </form>
        </main>
      </div>
    );
  }

  // DETAIL VIEW
  if (view === "detail" && selectedRateio) {
    const rateioParticipants = participants.filter((p) => p.rateio_id === selectedRateio.id);
    const unitLabel = selectedRateio.unit_type === "kg" ? "kg" : selectedRateio.unit_type === "litro" ? "L" : "un";
    const subtotal = selectedRateio.total_quantity * selectedRateio.price_per_unit;
    const total = subtotal * (1 + selectedRateio.admin_fee_percent / 100);
    const totalConfirmed = rateioParticipants.filter((p) => p.payment_confirmed).length;
    const totalWithReceipt = rateioParticipants.filter((p) => p.receipt_url).length;
    const usedPercent = rateioParticipants.reduce((s, p) => s + p.percent, 0);

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-heading font-bold text-foreground truncate">{selectedRateio.title}</h1>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-heading font-bold text-foreground">{rateioParticipants.length}</p>
              <p className="text-xs text-muted-foreground">Participantes</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-heading font-bold text-foreground">{usedPercent}%</p>
              <p className="text-xs text-muted-foreground">Reservado</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-heading font-bold text-primary">{totalWithReceipt}</p>
              <p className="text-xs text-muted-foreground">Com comprovante</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-heading font-bold text-success">{totalConfirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmados</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground space-y-1">
            <p><strong className="text-foreground">Unidade:</strong> {unitLabel} · <strong className="text-foreground">Total:</strong> {selectedRateio.total_quantity} {unitLabel}</p>
            <p><strong className="text-foreground">R$/{unitLabel}:</strong> {Number(selectedRateio.price_per_unit).toFixed(2).replace(".", ",")} · <strong className="text-foreground">Taxa:</strong> {selectedRateio.admin_fee_percent}%</p>
            <p><strong className="text-foreground">Total:</strong> R$ {total.toFixed(2).replace(".", ",")}</p>
            <p><strong className="text-foreground">Chave PIX:</strong> {selectedRateio.pix_key}</p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-heading font-semibold text-foreground">Participantes</h2>
            </div>
            <div className="divide-y divide-border">
              {rateioParticipants.map((p) => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.email} · {p.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.percent}% · R$ {Number(p.value_brl).toFixed(2).replace(".", ",")} · {Number(p.weight_kg).toFixed(2).replace(".", ",")} {unitLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.payment_confirmed ? (
                        <span className="flex items-center gap-1 text-success text-sm font-medium">
                          <CheckCircle className="w-4 h-4" /> Confirmado
                        </span>
                      ) : p.receipt_url ? (
                        <div className="flex items-center gap-2">
                          <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-sm hover:underline">
                            <Eye className="w-4 h-4" /> Ver
                          </a>
                          <Button size="sm" onClick={() => confirmPayment(p.id)}>Confirmar PIX</Button>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" /> Aguardando
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {rateioParticipants.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">Nenhum participante ainda.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-heading font-bold text-foreground">Painel Admin</h1>
          </div>
          <Button size="sm" onClick={() => setView("create")} className="gap-1.5">
            <Plus className="w-4 h-4" /> Novo Rateio
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-4">
        {rateios.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
            <p className="text-muted-foreground">Nenhum rateio criado ainda.</p>
            <Button onClick={() => setView("create")} className="gap-1.5">
              <Plus className="w-4 h-4" /> Criar primeiro rateio
            </Button>
          </div>
        ) : (
          rateios.map((r) => {
            const rParts = participants.filter((p) => p.rateio_id === r.id);
            const confirmed = rParts.filter((p) => p.payment_confirmed).length;
            const withReceipt = rParts.filter((p) => p.receipt_url).length;
            const usedPct = rParts.reduce((s, p) => s + p.percent, 0);
            const unitLabel = r.unit_type === "kg" ? "kg" : r.unit_type === "litro" ? "L" : "un";

            return (
              <div key={r.id} className="bg-card border border-border rounded-xl shadow-md overflow-hidden">
                <div className="flex">
                  {r.photo_url && (
                    <div className="w-24 h-24 shrink-0">
                      <img src={r.photo_url} alt={r.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading font-bold text-foreground">{r.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          /{r.slug} · {r.total_quantity} {unitLabel} · PIX: {r.pix_key}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.visibility === "public" ? "bg-primary/20 text-primary" : r.visibility === "secret" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                          {r.visibility === "public" ? "Público" : r.visibility === "secret" ? "Secreto" : "Oculto"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "open" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                          {r.status === "open" ? "Aberto" : r.status === "closed" ? "Fechado" : "Finalizado"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{rParts.length} participantes</span>
                      <span>{usedPct}% reservado</span>
                      <span>{withReceipt} comprovantes</span>
                      <span>{confirmed} confirmados</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedRateio(r); setView("detail"); }}>
                        Ver detalhes
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteRateio(r.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Admin;

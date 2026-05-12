import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Info, Heart, Loader2, CheckCircle, MapPin, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Rateio {
  id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  unit_type: string;
  total_quantity: number;
  price_per_unit: number;
  admin_fee_percent: number;
  status: string;
  created_at: string;
  slug: string;
  visibility: string;
}

const Index = () => {
  const [rateios, setRateios] = useState<Rateio[]>([]);
  const [interestRateio, setInterestRateio] = useState<Rateio | null>(null);
  const [interestForm, setInterestForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rateios")
        .select("*")
        .eq("status", "open")
        .in("visibility", ["public", "secret"])
        .order("created_at", { ascending: false });
      if (data) setRateios(data);
    };
    load();
  }, []);

  const submitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestRateio) return;
    if (!interestForm.name.trim() || !interestForm.email.includes("@") || interestForm.phone.length < 10) {
      toast({ title: "Preencha todos os campos corretamente", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("rateio_interests").insert({
        rateio_id: interestRateio.id,
        name: interestForm.name.trim(),
        email: interestForm.email.trim(),
        phone: interestForm.phone.trim(),
      });
      if (error) throw error;
      setSubmitted(true);
      setInterestForm({ name: "", email: "", phone: "" });
    } catch {
      toast({ title: "Erro ao enviar interesse", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-10 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Portal Corporativo Rodoviário</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-slate-600">Terceira Ponte</span>
            <span className="text-sm font-medium text-slate-600">Acessos Vitória</span>
            <span className="text-sm font-medium text-slate-600">Acessos VV</span>
            <span className="text-sm font-medium text-slate-600">Rodosol</span>
          </nav>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900">Oportunidades e Rateios</h2>
          <p className="text-lg text-slate-500 max-w-2xl">Gerencie e participe de rateios logísticos e operacionais na região metropolitana.</p>
        </div>

        {rateios.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">Nenhum rateio aberto no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rateios.map((r) => {
              const subtotal = r.total_quantity * r.price_per_unit;
              const total = subtotal * (1 + r.admin_fee_percent / 100);
              const unitLabel = r.unit_type === "kg" ? "kg" : r.unit_type === "litro" ? "L" : "un";
              const isSecret = r.visibility === "secret";

              if (isSecret) {
                return (
                  <div
                    key={r.id}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col group"
                  >
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      {r.photo_url ? (
                        <img src={r.photo_url} alt={r.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Building2 className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                          Exclusivo
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{r.title}</h3>
                        {r.description && (
                          <p className="text-sm text-slate-500 line-clamp-2">{r.description}</p>
                        )}
                      </div>
                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between text-sm py-3 border-y border-slate-50">
                          <span className="text-slate-500">Volume Total</span>
                          <span className="font-semibold text-slate-900">{r.total_quantity} {unitLabel}</span>
                        </div>
                        <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-600 leading-tight">
                            Este rateio requer autorização prévia do promotor. Solicite acesso abaixo.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full h-10 text-sm font-semibold border-slate-200 hover:bg-slate-50"
                          onClick={() => { setInterestRateio(r); setSubmitted(false); }}
                        >
                          Manifestar Interesse
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={r.id}
                  to={`/r/${r.slug}`}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    {r.photo_url ? (
                      <img src={r.photo_url} alt={r.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Building2 className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        Aberto
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight group-hover:text-primary transition-colors">{r.title}</h3>
                      {r.description && (
                        <p className="text-sm text-slate-500 line-clamp-2">{r.description}</p>
                      )}
                    </div>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-sm pb-3 border-b border-slate-50">
                        <span className="text-slate-500">Valor Estimado</span>
                        <span className="font-bold text-slate-900 text-base">R$ {total.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>ES · Terceira Ponte</span>
                        </div>
                        <span>{r.total_quantity} {unitLabel}</span>
                      </div>
                      <Button className="w-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90">
                        Acessar Detalhes
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Interest Modal */}
      <Dialog open={!!interestRateio} onOpenChange={() => setInterestRateio(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-center">
              {submitted ? "Interesse enviado! 🎉" : `Interesse: ${interestRateio?.title}`}
            </DialogTitle>
          </DialogHeader>
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <p className="text-sm text-muted-foreground">
                Seu interesse foi registrado. O promotor do rateio vai analisar e entrar em contato se você for aprovado.
              </p>
              <Button onClick={() => setInterestRateio(null)} className="w-full">Fechar</Button>
            </div>
          ) : (
            <form onSubmit={submitInterest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Seu nome</label>
                <Input value={interestForm.name} onChange={(e) => setInterestForm({ ...interestForm, name: e.target.value })} placeholder="Ex: Maria" className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" value={interestForm.email} onChange={(e) => setInterestForm({ ...interestForm, email: e.target.value })} placeholder="maria@email.com" className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Telefone</label>
                <Input type="tel" value={interestForm.phone} onChange={(e) => setInterestForm({ ...interestForm, phone: e.target.value })} placeholder="(11) 99999-9999" className="bg-background" />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...</> : "Enviar interesse"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

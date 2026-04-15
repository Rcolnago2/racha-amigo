import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Eye, ShieldCheck } from "lucide-react";

const ADMIN_PASSWORD = "queijo2025";

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
  created_at: string;
}

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      toast({ title: "Senha incorreta", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    loadParticipants();
  }, [authenticated]);

  const loadParticipants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setParticipants(data);
    setLoading(false);
  };

  const confirmPayment = async (id: string) => {
    const { error } = await supabase
      .from("participants")
      .update({ payment_confirmed: true })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao confirmar", variant: "destructive" });
      return;
    }

    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, payment_confirmed: true } : p))
    );
    toast({ title: "Pagamento confirmado! ✅" });
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
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="bg-background"
          />
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </div>
    );
  }

  const totalConfirmed = participants.filter((p) => p.payment_confirmed).length;
  const totalWithReceipt = participants.filter((p) => p.receipt_url).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-heading font-bold text-foreground">Painel Admin</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalConfirmed}/{participants.length} confirmados
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-foreground">{participants.length}</p>
            <p className="text-xs text-muted-foreground">Participantes</p>
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

        <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-heading font-semibold text-foreground">Participantes</h2>
          </div>
          <div className="divide-y divide-border">
            {participants.map((p) => (
              <div key={p.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.email} · {p.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {p.percent}% · R$ {Number(p.value_brl).toFixed(2).replace(".", ",")} · {Number(p.weight_kg).toFixed(2).replace(".", ",")} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.payment_confirmed ? (
                      <span className="flex items-center gap-1 text-success text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Confirmado
                      </span>
                    ) : p.receipt_url ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={p.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary text-sm hover:underline"
                        >
                          <Eye className="w-4 h-4" /> Ver comprovante
                        </a>
                        <Button size="sm" onClick={() => confirmPayment(p.id)}>
                          Confirmar PIX
                        </Button>
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
            {participants.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum participante registrado ainda.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Info, Heart, Loader2, CheckCircle, MapPinned } from "lucide-react";
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
      if (data) {
        const allowedRateios = [
          "terceira ponte",
          "acessos terceira ponte vitoria",
          "acessos terceira ponte vv",
          "rodosol",
        ];
        const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        setRateios(data.filter((rateio) => allowedRateios.includes(normalize(rateio.title))));
      }
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
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-heading font-bold uppercase tracking-[0.16em] text-foreground">Mobilidade ES</h1>
              <p className="text-xs text-muted-foreground">Informações viárias corporativas</p>
            </div>
          </div>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:block">Painel de acessos</span>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-5 py-12 space-y-9">
        <div className="max-w-2xl space-y-3 border-l-4 border-primary pl-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Operações em destaque</p>
          <h2 className="text-3xl font-heading font-bold tracking-tight text-foreground md:text-4xl">Terceira Ponte e acessos</h2>
          <p className="text-muted-foreground">Consulte as condições e informações das oportunidades disponíveis.</p>
        </div>

        {rateios.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">Nenhum rateio aberto no momento.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {rateios.map((r) => {
              const subtotal = r.total_quantity * r.price_per_unit;
              const total = subtotal * (1 + r.admin_fee_percent / 100);
              const unitLabel = r.unit_type === "kg" ? "kg" : r.unit_type === "litro" ? "L" : "un";
              const isSecret = r.visibility === "secret";

              if (isSecret) {
                return (
                  <div
                    key={r.id}
                    className="bg-card border border-border rounded-md overflow-hidden shadow-sm"
                  >
                    <div className="flex">
                      {r.photo_url && (
                        <div className="w-36 h-40 shrink-0">
                          <img src={r.photo_url} alt={r.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                       <div className="flex-1 p-5">
                        <div className="min-w-0">
                           <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Acesso exclusivo</p>
                           <h3 className="font-heading font-bold text-foreground text-xl leading-tight">{r.title}</h3>
                          {r.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{r.total_quantity} {unitLabel}</span>
                            <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4 space-y-3">
                       <div className="flex items-start gap-2 bg-secondary rounded-md p-3 border border-border">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Rateio exclusivo — você precisa conhecer o promotor para acessar. Demonstre interesse abaixo e aguarde aprovação.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => { setInterestRateio(r); setSubmitted(false); }}
                      >
                        <Heart className="w-4 h-4" /> Tenho interesse
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={r.id}
                  to={`/r/${r.slug}`}
                  className="group block bg-card border border-border rounded-md overflow-hidden shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                >
                  <div className="flex">
                    {r.photo_url && (
                       <div className="w-36 h-40 shrink-0">
                        <img src={r.photo_url} alt={r.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                     <div className="flex-1 p-5 flex items-center justify-between">
                      <div className="min-w-0">
                         <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Disponível</p>
                         <h3 className="font-heading font-bold text-foreground text-xl leading-tight">{r.title}</h3>
                        {r.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{r.total_quantity} {unitLabel}</span>
                          <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                        </div>
                      </div>
                       <ArrowUpRight className="w-5 h-5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

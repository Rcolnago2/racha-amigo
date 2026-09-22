import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Heart,
  Info,
  Loader2,
  LockKeyhole,
  PackageCheck,
  Share2,
  ShoppingCart,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import logoImage from "@/assets/rateio-amigo-logo.webp";

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const Index = () => {
  const [rateios, setRateios] = useState<Rateio[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    };
    load();
  }, []);

  const openInterest = (rateio: Rateio) => {
    setInterestRateio(rateio);
    setSubmitted(false);
  };

  const submitInterest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!interestRateio) return;
    if (!interestForm.name.trim() || !interestForm.email.includes("@") || interestForm.phone.replace(/\D/g, "").length < 10) {
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
      toast({ title: "Não foi possível enviar seu interesse", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8">
          <a href="#inicio" aria-label="Rateio Amigo — início" className="flex items-center">
            <img src={logoImage} alt="Rateio Amigo" className="h-16 w-auto object-contain" />
          </a>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Navegação principal">
            <a href="#como-funciona" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Como funciona</a>
            <a href="#modalidades" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Modalidades</a>
            <a href="#rateios" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Rateios abertos</a>
          </nav>
          <Button asChild size="sm">
            <Link to="/admin">Criar rateio</Link>
          </Button>
        </div>
      </header>

      <main>
        <section id="inicio" className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.15fr_0.85fr] md:items-center md:px-8 md:py-20">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold uppercase text-secondary-foreground">
                <Users className="h-4 w-4" /> Comprar junto vale mais
              </span>
              <h1 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl md:text-6xl">
                O jeito inteligente de comprar em grupo
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Organize uma compra coletiva, divida quantidade e valor com clareza e acompanhe a participação de cada pessoa em um só lugar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-7 text-base">
                  <Link to="/admin">Criar novo rateio <ArrowRight /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                  <a href="#rateios">Ver rateios abertos</a>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -left-5 top-12 h-24 w-3 rounded-full bg-accent" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-lg border border-border bg-background p-7 shadow-xl">
                <img src={logoImage} alt="Rateio Amigo — juntos, você compra mais" className="mx-auto w-full max-w-xs object-contain" />
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-5 text-center">
                  <div><p className="text-xl font-bold text-foreground">1</p><p className="text-xs text-muted-foreground">produto</p></div>
                  <div><p className="text-xl font-bold text-primary">1</p><p className="text-xs text-muted-foreground">grupo</p></div>
                  <div><p className="text-xl font-bold text-accent">100%</p><p className="text-xs text-muted-foreground">organizado</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-sm font-bold uppercase text-primary">Simples do início ao fim</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Todo mundo sabe quanto compra e quanto paga</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2">
            <article className="rounded-lg border border-border bg-card p-7 md:col-span-3 md:row-span-2">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15 text-accent"><ShoppingCart /></div>
              <p className="text-sm font-bold text-accent">01</p>
              <h3 className="mt-2 text-2xl font-bold text-foreground">Cadastre a compra</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">Informe o produto, a quantidade total, o valor por unidade e a taxa de administração.</p>
            </article>
            <article className="rounded-lg border border-border bg-card p-7 md:col-span-3">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"><Share2 /></div>
                <div><p className="text-sm font-bold text-primary">02</p><h3 className="mt-1 text-xl font-bold text-foreground">Compartilhe e reúna</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Envie o link certo para amigos ou abra a oportunidade para novas pessoas.</p></div>
              </div>
            </article>
            <article className="rounded-lg border border-border bg-foreground p-7 md:col-span-3">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background/15 text-background"><PackageCheck /></div>
                <div><p className="text-sm font-bold text-accent">03</p><h3 className="mt-1 text-xl font-bold text-background">Confirme e finalize</h3><p className="mt-2 text-sm leading-relaxed text-background/70">Cada participante escolhe sua parte, paga via PIX e envia o comprovante.</p></div>
              </div>
            </article>
          </div>
        </section>

        <section id="modalidades" className="bg-foreground py-16 text-background md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="mb-2 text-sm font-bold uppercase text-accent">Você escolhe quem participa</p>
              <h2 className="text-3xl font-bold md:text-4xl">Três formas de organizar seu rateio</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-lg border border-background/15 bg-background/5 p-7">
                <LockKeyhole className="mb-8 h-7 w-7 text-accent" />
                <h3 className="text-2xl font-bold">Rateio secreto</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/70">As condições aparecem na vitrine, mas o acesso depende do promotor. Quem se interessar envia seus dados para análise.</p>
              </article>
              <article className="rounded-lg border border-primary/50 bg-primary/10 p-7">
                <Users className="mb-8 h-7 w-7 text-primary" />
                <h3 className="text-2xl font-bold">Entre amigos</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/70">Não aparece na lista pública. O grupo participa usando o endereço exato compartilhado pelo promotor.</p>
              </article>
              <article className="rounded-lg border border-background/15 bg-background/5 p-7">
                <Eye className="mb-8 h-7 w-7 text-background" />
                <h3 className="text-2xl font-bold">Rateio público</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/70">Fica visível na página e qualquer pessoa pode abrir, conhecer as condições e reservar sua parte.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="rateios" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase text-primary">Oportunidades atuais</p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Rateios abertos</h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">Confira as condições e encontre uma compra que faça sentido para você.</p>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center rounded-lg border border-border bg-card"><Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Carregando rateios" /></div>
          ) : rateios.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
              <ShoppingCart className="mx-auto h-9 w-9 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-bold text-foreground">Nenhum rateio aberto no momento</h3>
              <p className="mt-2 text-sm text-muted-foreground">Volte em breve ou crie uma nova compra coletiva.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rateios.map((rateio) => {
                const total = rateio.total_quantity * rateio.price_per_unit * (1 + rateio.admin_fee_percent / 100);
                const unitLabel = rateio.unit_type === "kg" ? "kg" : rateio.unit_type === "litro" ? "L" : "un";
                const isSecret = rateio.visibility === "secret";
                return (
                  <article key={rateio.id} className="flex min-h-[390px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative h-44 bg-secondary">
                      {rateio.photo_url ? <img src={rateio.photo_url} alt={rateio.title} className="h-full w-full object-cover" /> : <ShoppingCart className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground/50" />}
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-xs font-bold text-foreground shadow-sm">
                        {isSecret ? <><EyeOff className="h-3.5 w-3.5 text-accent" /> Exclusivo</> : <><Eye className="h-3.5 w-3.5 text-primary" /> Público</>}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-bold text-foreground">{rateio.title}</h3>
                      {rateio.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{rateio.description}</p>}
                      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4">
                        <div><p className="text-xs text-muted-foreground">Quantidade</p><p className="font-bold text-foreground">{rateio.total_quantity} {unitLabel}</p></div>
                        <div><p className="text-xs text-muted-foreground">Total com taxa</p><p className="font-bold text-primary">{formatCurrency(total)}</p></div>
                      </div>
                      <div className="mt-auto pt-5">
                        {isSecret ? (
                          <Button variant="outline" className="w-full" onClick={() => openInterest(rateio)}><Heart /> Tenho interesse</Button>
                        ) : (
                          <Button asChild className="w-full"><Link to={`/r/${rateio.slug}`}>Ver condições <ArrowRight /></Link></Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-12 text-center md:flex-row md:px-8 md:text-left">
            <div><h2 className="text-2xl font-bold text-foreground">Tem uma boa compra para dividir?</h2><p className="mt-2 text-muted-foreground">Crie o rateio, compartilhe e acompanhe tudo em um só lugar.</p></div>
            <Button asChild size="lg"><Link to="/admin">Começar um rateio <ArrowRight /></Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row md:px-8">
          <img src={logoImage} alt="Rateio Amigo" className="h-14 w-auto object-contain" />
          <div className="flex items-center gap-6 text-xs text-muted-foreground"><span>Juntos, você compra mais</span><Link to="/admin" className="transition-colors hover:text-foreground">Acesso do promotor</Link></div>
        </div>
      </footer>

      <Dialog open={Boolean(interestRateio)} onOpenChange={(open) => !open && setInterestRateio(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{submitted ? "Interesse enviado" : `Interesse em ${interestRateio?.title ?? "rateio"}`}</DialogTitle>
          </DialogHeader>
          {submitted ? (
            <div className="py-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">O promotor recebeu seus dados e poderá aprovar ou recusar sua participação.</p>
              <Button onClick={() => setInterestRateio(null)} className="mt-6 w-full">Fechar</Button>
            </div>
          ) : (
            <form onSubmit={submitInterest} className="space-y-4">
              <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/50 p-3"><Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><p className="text-xs leading-relaxed text-muted-foreground">Este rateio exige a aprovação do promotor. Seus dados não aparecem na página pública.</p></div>
              <div className="space-y-1.5"><label htmlFor="interest-name" className="text-sm font-medium">Seu nome</label><Input id="interest-name" value={interestForm.name} onChange={(event) => setInterestForm({ ...interestForm, name: event.target.value })} placeholder="Ex: Maria" /></div>
              <div className="space-y-1.5"><label htmlFor="interest-email" className="text-sm font-medium">E-mail</label><Input id="interest-email" type="email" value={interestForm.email} onChange={(event) => setInterestForm({ ...interestForm, email: event.target.value })} placeholder="maria@email.com" /></div>
              <div className="space-y-1.5"><label htmlFor="interest-phone" className="text-sm font-medium">Telefone</label><Input id="interest-phone" type="tel" value={interestForm.phone} onChange={(event) => setInterestForm({ ...interestForm, phone: event.target.value })} placeholder="(11) 99999-9999" /></div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? <><Loader2 className="animate-spin" /> Enviando</> : "Enviar interesse"}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
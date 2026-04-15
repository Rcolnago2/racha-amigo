import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Info } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🧀</span>
          <h1 className="text-xl font-heading font-bold text-foreground">Compra Coletiva</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-heading font-bold text-foreground">Rateios Abertos</h2>
          <p className="text-muted-foreground">Escolha um rateio para participar</p>
        </div>

        {rateios.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">Nenhum rateio aberto no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rateios.map((r) => {
              const subtotal = r.total_quantity * r.price_per_unit;
              const total = subtotal * (1 + r.admin_fee_percent / 100);
              const unitLabel = r.unit_type === "kg" ? "kg" : r.unit_type === "litro" ? "L" : "un";
              const isSecret = r.visibility === "secret";

              if (isSecret) {
                return (
                  <div
                    key={r.id}
                    className="bg-card border border-border rounded-xl shadow-md overflow-hidden opacity-75"
                  >
                    <div className="flex items-center p-4 gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-foreground text-lg">Rateio Exclusivo</h3>
                        <p className="text-sm text-muted-foreground">
                          Você precisa conhecer o promotor desse rateio para acessar essa oportunidade e pedir o link exato.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={r.id}
                  to={`/r/${r.slug}`}
                  className="block bg-card border border-border rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex">
                    {r.photo_url && (
                      <div className="w-32 h-32 shrink-0">
                        <img src={r.photo_url} alt={r.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-foreground text-lg truncate">{r.title}</h3>
                        {r.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{r.total_quantity} {unitLabel}</span>
                          <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
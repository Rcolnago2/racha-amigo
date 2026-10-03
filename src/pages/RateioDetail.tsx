import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import ParticipantForm from "@/components/ParticipantForm";
import ParticipantList from "@/components/ParticipantList";
import type { Participant } from "@/components/ParticipantList";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
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
  pix_key: string;
  pix_merchant_name: string;
  status: string;
  slug: string;
  visibility: string;
}

const RateioDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [rateio, setRateio] = useState<Rateio | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      // Try slug first, then fallback to id
      let rateioRes = await supabase.from("rateios").select("*").eq("slug", slug).maybeSingle();
      if (!rateioRes.data) {
        rateioRes = await supabase.from("rateios").select("*").eq("id", slug).maybeSingle();
      }
      if (rateioRes.data) {
        setRateio(rateioRes.data);
        const { data: partData } = await supabase.rpc("get_public_participants", {
          _rateio_id: rateioRes.data.id,
        });
        if (partData) setParticipants(partData.map((p) => ({ ...p, name: "" })));
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!rateio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Rateio não encontrado.</p>
          <Link to="/" className="text-primary hover:underline">Voltar</Link>
        </div>
      </div>
    );
  }

  const subtotal = rateio.total_quantity * rateio.price_per_unit;
  const adminFee = subtotal * (rateio.admin_fee_percent / 100);
  const totalPrice = subtotal + adminFee;
  const usedPercent = participants.reduce((s, p) => s + p.percent, 0);
  const remainingPercent = 100 - usedPercent;
  const unitLabel = rateio.unit_type === "kg" ? "kg" : rateio.unit_type === "litro" ? "L" : "un";

  const addParticipant = (participant: Participant) => {
    setParticipants((prev) => [...prev, participant]);
  };

  const removeParticipant = async (pid: string) => {
    await supabase.from("participants").delete().eq("id", pid);
    setParticipants((prev) => prev.filter((p) => p.id !== pid));
  };

  const handleReceiptUploaded = (pid: string, url: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === pid ? { ...p, receipt_url: url } : p))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src={logoImage} alt="Rateio Amigo" className="h-11 w-auto object-contain" />
          <h1 className="text-xl font-heading font-bold text-foreground truncate">{rateio.title}</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        <ProductCard
          name={rateio.title}
          description={rateio.description || ""}
          totalPrice={totalPrice}
          totalWeight={rateio.total_quantity}
          remainingPercent={remainingPercent}
          pricePerKg={rateio.price_per_unit}
          adminFeePercent={rateio.admin_fee_percent}
          adminFee={adminFee}
          unitLabel={unitLabel}
          photoUrl={rateio.photo_url}
        />

        {rateio.status === "open" && remainingPercent > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <ParticipantForm
              rateioId={rateio.id}
              remainingPercent={remainingPercent}
              totalPrice={totalPrice}
              totalWeight={rateio.total_quantity}
              unitLabel={unitLabel}
              pixKey={rateio.pix_key}
              pixMerchantName={rateio.pix_merchant_name}
              onAdd={addParticipant}
            />
            <ParticipantList
              participants={participants}
              totalPrice={totalPrice}
              totalWeight={rateio.total_quantity}
              unitLabel={unitLabel}
              onRemove={removeParticipant}
              onReceiptUploaded={handleReceiptUploaded}
            />
          </div>
        ) : (
          <ParticipantList
            participants={participants}
            totalPrice={totalPrice}
            totalWeight={rateio.total_quantity}
            unitLabel={unitLabel}
            onRemove={removeParticipant}
            onReceiptUploaded={handleReceiptUploaded}
          />
        )}
      </main>
    </div>
  );
};

export default RateioDetail;

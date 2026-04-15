import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import ParticipantForm from "@/components/ParticipantForm";
import ParticipantList, { type Participant } from "@/components/ParticipantList";
import ProductSettings from "@/components/ProductSettings";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalWeight, setTotalWeight] = useState(5);
  const [pricePerKg, setPricePerKg] = useState(90);
  const [adminFeePercent, setAdminFeePercent] = useState(5);

  const subtotal = totalWeight * pricePerKg;
  const adminFee = subtotal * (adminFeePercent / 100);
  const totalPrice = subtotal + adminFee;

  const usedPercent = participants.reduce((s, p) => s + p.percent, 0);
  const remainingPercent = 100 - usedPercent;

  // Load participants from database on mount
  useEffect(() => {
    const loadParticipants = async () => {
      const { data } = await supabase
        .from("participants")
        .select("id, name, email, phone, percent")
        .order("created_at", { ascending: true });
      if (data) setParticipants(data);
    };
    loadParticipants();
  }, []);

  const addParticipant = (participant: Participant) => {
    setParticipants((prev) => [...prev, participant]);
  };

  const removeParticipant = async (id: string) => {
    await supabase.from("participants").delete().eq("id", id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🧀</span>
          <h1 className="text-xl font-heading font-bold text-foreground">Compra Coletiva</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        <ProductSettings
          totalWeight={totalWeight}
          pricePerKg={pricePerKg}
          adminFeePercent={adminFeePercent}
          onWeightChange={setTotalWeight}
          onPricePerKgChange={setPricePerKg}
          onAdminFeeChange={setAdminFeePercent}
        />

        <ProductCard
          name="Queijo Canastra Artesanal"
          description="Queijo minas artesanal da Serra da Canastra, maturado por 22 dias. Compra direto do produtor."
          totalPrice={totalPrice}
          totalWeight={totalWeight}
          remainingPercent={remainingPercent}
          pricePerKg={pricePerKg}
          adminFeePercent={adminFeePercent}
          adminFee={adminFee}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <ParticipantForm
            remainingPercent={remainingPercent}
            totalPrice={totalPrice}
            totalWeight={totalWeight}
            onAdd={addParticipant}
          />
          <ParticipantList
            participants={participants}
            totalPrice={totalPrice}
            totalWeight={totalWeight}
            onRemove={removeParticipant}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;

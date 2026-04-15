import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import ParticipantForm from "@/components/ParticipantForm";
import ParticipantList, { type Participant } from "@/components/ParticipantList";

const PRODUCT = {
  name: "Queijo Canastra Artesanal",
  description: "Queijo minas artesanal da Serra da Canastra, maturado por 22 dias. Compra direto do produtor.",
  totalPrice: 450,
  totalWeight: 5,
};

const Index = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const usedPercent = participants.reduce((s, p) => s + p.percent, 0);
  const remainingPercent = 100 - usedPercent;

  const addParticipant = (name: string, percent: number) => {
    setParticipants((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, percent },
    ]);
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🧀</span>
          <h1 className="text-xl font-heading font-bold text-foreground">Compra Coletiva</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        <ProductCard
          name={PRODUCT.name}
          description={PRODUCT.description}
          totalPrice={PRODUCT.totalPrice}
          totalWeight={PRODUCT.totalWeight}
          remainingPercent={remainingPercent}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <ParticipantForm
            remainingPercent={remainingPercent}
            totalPrice={PRODUCT.totalPrice}
            totalWeight={PRODUCT.totalWeight}
            onAdd={addParticipant}
          />
          <ParticipantList
            participants={participants}
            totalPrice={PRODUCT.totalPrice}
            totalWeight={PRODUCT.totalWeight}
            onRemove={removeParticipant}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;

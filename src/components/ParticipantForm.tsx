import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

interface ParticipantFormProps {
  remainingPercent: number;
  totalPrice: number;
  totalWeight: number;
  onAdd: (name: string, percent: number) => void;
}

const ParticipantForm = ({ remainingPercent, totalPrice, totalWeight, onAdd }: ParticipantFormProps) => {
  const [name, setName] = useState("");
  const [percent, setPercent] = useState(10);

  const effectivePercent = Math.min(percent, remainingPercent);
  const value = (effectivePercent / 100) * totalPrice;
  const weight = (effectivePercent / 100) * totalWeight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Informe seu nome", variant: "destructive" });
      return;
    }
    if (effectivePercent <= 0) {
      toast({ title: "Não há mais percentual disponível", variant: "destructive" });
      return;
    }
    onAdd(name.trim(), effectivePercent);
    setName("");
    setPercent(10);
    toast({ title: "Participação registrada! 🧀" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-md space-y-5">
      <h2 className="text-xl font-heading font-semibold text-foreground">Quero participar!</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Seu nome</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Maria"
          className="bg-background"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Percentual da compra</label>
          <span className="text-lg font-heading font-bold text-primary">{effectivePercent}%</span>
        </div>
        <Slider
          value={[percent]}
          onValueChange={(v) => setPercent(v[0])}
          min={5}
          max={Math.max(5, remainingPercent)}
          step={5}
          className="py-2"
        />
        <p className="text-xs text-muted-foreground">Máximo disponível: {remainingPercent}%</p>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-muted rounded-lg p-4">
        <div>
          <p className="text-xs text-muted-foreground">Você paga</p>
          <p className="text-lg font-heading font-bold text-foreground">
            R$ {value.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Você recebe</p>
          <p className="text-lg font-heading font-bold text-foreground">
            {weight.toFixed(2).replace('.', ',')} kg
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full text-base py-5" disabled={remainingPercent <= 0}>
        {remainingPercent <= 0 ? "Compra completa!" : "Entrar na compra"}
      </Button>
    </form>
  );
};

export default ParticipantForm;

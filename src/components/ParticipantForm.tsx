import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PixModal from "@/components/PixModal";

interface ParticipantFormProps {
  remainingPercent: number;
  totalPrice: number;
  totalWeight: number;
  onAdd: (participant: { id: string; name: string; email: string; phone: string; percent: number }) => void;
}

const ParticipantForm = ({ remainingPercent, totalPrice, totalWeight, onAdd }: ParticipantFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [percent, setPercent] = useState(10);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{ value: number; name: string } | null>(null);

  const effectivePercent = Math.min(percent, remainingPercent);
  const value = (effectivePercent / 100) * totalPrice;
  const weight = (effectivePercent / 100) * totalWeight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Informe seu nome", variant: "destructive" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Informe um email válido", variant: "destructive" });
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast({ title: "Informe um telefone válido", variant: "destructive" });
      return;
    }
    if (!confirmed) {
      toast({ title: "Confirme o compromisso de pagamento", variant: "destructive" });
      return;
    }
    if (effectivePercent <= 0) {
      toast({ title: "Não há mais percentual disponível", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from("participants").insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        percent: effectivePercent,
        value_brl: value,
        weight_kg: weight,
      }).select().single();

      if (error) throw error;

      onAdd({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        percent: data.percent,
      });

      setPixData({ value, name: name.trim() });

      setName("");
      setEmail("");
      setPhone("");
      setPercent(10);
      setConfirmed(false);

      toast({ title: "Participação registrada! 🧀" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao registrar. Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-md space-y-4">
        <h2 className="text-xl font-heading font-semibold text-foreground">Quero participar!</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Seu nome</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria" className="bg-background" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@email.com" className="bg-background" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Telefone</label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="bg-background" />
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

        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(v === true)}
            className="mt-0.5"
          />
          <label htmlFor="confirm" className="text-sm text-foreground leading-snug cursor-pointer">
            Estou ciente do compromisso de pagamento e me comprometo a pagar minha parte via PIX.
          </label>
        </div>

        <Button type="submit" className="w-full text-base py-5" disabled={remainingPercent <= 0 || !confirmed || loading}>
          {loading ? "Registrando..." : remainingPercent <= 0 ? "Compra completa!" : "Entrar na compra e gerar PIX"}
        </Button>
      </form>

      {pixData && (
        <PixModal
          value={pixData.value}
          participantName={pixData.name}
          onClose={() => setPixData(null)}
        />
      )}
    </>
  );
};

export default ParticipantForm;

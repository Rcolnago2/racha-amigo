import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Clock } from "lucide-react";
import ReceiptUpload from "@/components/ReceiptUpload";

const popularProviders = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com", "msn.com", "aol.com", "protonmail.com", "uol.com.br", "bol.com.br", "terra.com.br", "ig.com.br", "globo.com"];

function maskName(name: string): string {
  const parts = name.split(" ");
  return parts.map(p => p[0] + "***").join(" ");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***";
  const isPopular = popularProviders.includes(domain.toLowerCase());
  // Pick 3 random chars from local part
  const chars = local.split("");
  const picked: string[] = [];
  const indices = new Set<number>();
  while (picked.length < Math.min(3, chars.length)) {
    const i = Math.floor(Math.random() * chars.length);
    if (!indices.has(i)) {
      indices.add(i);
      picked.push(chars[i]);
    }
  }
  const maskedLocal = picked.join("") + "***";
  if (isPopular) {
    // Show partial provider: first 2 chars + ***
    return `${maskedLocal}@${domain.slice(0, 2)}***`;
  }
  return `${maskedLocal}@***`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  const ddd = digits.slice(0, 2);
  const last2 = digits.slice(-2);
  return `(${ddd}) *****-**${last2}`;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  percent: number;
  receipt_url?: string | null;
  payment_confirmed?: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
  totalPrice: number;
  totalWeight: number;
  unitLabel?: string;
  onRemove: (id: string) => void;
  onReceiptUploaded: (id: string, url: string) => void;
}

const ParticipantList = ({ participants, totalPrice, totalWeight, unitLabel = "kg", onRemove, onReceiptUploaded }: ParticipantListProps) => {
  if (participants.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-md text-center">
        <p className="text-muted-foreground font-body">Nenhum participante ainda. Seja o primeiro! 🧀</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-heading font-semibold text-foreground">
          Participantes ({participants.length})
        </h2>
      </div>
      <div className="divide-y divide-border">
        {participants.map((p) => {
          const value = (p.percent / 100) * totalPrice;
          const weight = (p.percent / 100) * totalWeight;
          return (
            <div key={p.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{maskName(p.name)}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {p.percent}% · R$ {value.toFixed(2).replace(".", ",")} · {weight.toFixed(2).replace(".", ",")} {unitLabel}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{maskEmail(p.email)} · {maskPhone(p.phone)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(p.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                {p.payment_confirmed ? (
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <CheckCircle className="w-3.5 h-3.5" /> Pagamento confirmado ✅
                  </span>
                ) : p.receipt_url ? (
                  <span className="flex items-center gap-1.5 text-xs text-primary">
                    <Clock className="w-3.5 h-3.5" /> Aguardando confirmação do admin
                  </span>
                ) : (
                  <ReceiptUpload participantId={p.id} participantName={p.name} existingUrl={p.receipt_url} onUploaded={onReceiptUploaded} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total reservado</span>
          <span className="font-heading font-bold text-foreground">
            {participants.reduce((s, p) => s + p.percent, 0)}% · R${" "}
            {((participants.reduce((s, p) => s + p.percent, 0) / 100) * totalPrice).toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParticipantList;

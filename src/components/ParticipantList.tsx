import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  percent: number;
}

interface ParticipantListProps {
  participants: Participant[];
  totalPrice: number;
  totalWeight: number;
  onRemove: (id: string) => void;
}

const ParticipantList = ({ participants, totalPrice, totalWeight, onRemove }: ParticipantListProps) => {
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
            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {p.percent}% · R$ {value.toFixed(2).replace('.', ',')} · {weight.toFixed(2).replace('.', ',')} kg
                </p>
                <p className="text-xs text-muted-foreground truncate">{p.email} · {p.phone}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(p.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total reservado</span>
          <span className="font-heading font-bold text-foreground">
            {participants.reduce((s, p) => s + p.percent, 0)}% · R${" "}
            {((participants.reduce((s, p) => s + p.percent, 0) / 100) * totalPrice).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParticipantList;

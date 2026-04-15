import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductSettingsProps {
  totalWeight: number;
  pricePerKg: number;
  adminFeePercent: number;
  onWeightChange: (v: number) => void;
  onPricePerKgChange: (v: number) => void;
  onAdminFeeChange: (v: number) => void;
}

const ProductSettings = ({
  totalWeight,
  pricePerKg,
  adminFeePercent,
  onWeightChange,
  onPricePerKgChange,
  onAdminFeeChange,
}: ProductSettingsProps) => {
  const [open, setOpen] = useState(false);

  const subtotal = totalWeight * pricePerKg;
  const adminFee = subtotal * (adminFeePercent / 100);
  const total = subtotal + adminFee;

  return (
    <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span className="font-heading font-semibold text-foreground">Configurações do Produto</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {open ? "Fechar" : "Editar"}
        </span>
      </button>

      {open && (
        <div className="p-4 pt-0 space-y-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Peso total (kg)</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={totalWeight}
                onChange={(e) => onWeightChange(Number(e.target.value) || 0)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Valor por kg (R$)</label>
              <Input
                type="number"
                step="1"
                min="1"
                value={pricePerKg}
                onChange={(e) => onPricePerKgChange(Number(e.target.value) || 0)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Taxa admin (%)</label>
              <Input
                type="number"
                step="1"
                min="0"
                max="100"
                value={adminFeePercent}
                onChange={(e) => onAdminFeeChange(Number(e.target.value) || 0)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Subtotal</p>
              <p className="font-heading font-bold text-foreground">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Taxa admin</p>
              <p className="font-heading font-bold text-primary">
                R$ {adminFee.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total final</p>
              <p className="font-heading font-bold text-foreground">
                R$ {total.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSettings;

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { generatePixPayload } from "@/lib/pix";
import { toast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface PixModalProps {
  value: number;
  participantName: string;
  pixKey: string;
  merchantName: string;
  onClose: () => void;
}

const PixModal = ({ value, participantName, pixKey, merchantName, onClose }: PixModalProps) => {
  const [copied, setCopied] = useState(false);

  const pixPayload = generatePixPayload(pixKey, merchantName, "SAO PAULO", value, "RATEIO");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast({ title: "PIX copiado! Cole no app do seu banco." });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-center">Pagamento PIX</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {participantName}, escaneie o QR Code ou copie o código PIX abaixo para pagar sua parte:
          </p>

          <div className="bg-background p-4 rounded-xl border border-border inline-block mx-auto">
            <QRCodeSVG value={pixPayload} size={200} level="M" />
          </div>

          <div className="space-y-2">
            <p className="text-2xl font-heading font-bold text-foreground">
              R$ {value.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-muted-foreground">Chave PIX: {pixKey}</p>
          </div>

          <Button onClick={handleCopy} variant="outline" className="w-full gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar código PIX"}
          </Button>

          <Button onClick={onClose} className="w-full">Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixModal;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, CheckCircle, Loader2 } from "lucide-react";

interface ReceiptUploadProps {
  participantId: string;
  participantName: string;
  existingUrl?: string | null;
  onUploaded: (id: string, url: string) => void;
}

const ReceiptUpload = ({ participantId, participantName, existingUrl, onUploaded }: ReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande (máx 5MB)", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${participantId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(path);

      const receiptUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("participants")
        .update({ receipt_url: receiptUrl })
        .eq("id", participantId);

      if (updateError) throw updateError;

      onUploaded(participantId, receiptUrl);
      toast({ title: "Comprovante enviado com sucesso! ✅" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar comprovante", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (existingUrl) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-success">
        <CheckCircle className="w-3.5 h-3.5" />
        <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Comprovante enviado
        </a>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleUpload}
        className="hidden"
        id={`receipt-${participantId}`}
        disabled={uploading}
      />
      <label htmlFor={`receipt-${participantId}`}>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 cursor-pointer"
          asChild
          disabled={uploading}
        >
          <span>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "Enviando..." : "Enviar comprovante"}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default ReceiptUpload;

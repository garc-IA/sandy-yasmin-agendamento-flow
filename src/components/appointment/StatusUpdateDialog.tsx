
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: "complete" | "cancel" | "delete" | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function StatusUpdateDialog({
  isOpen,
  onOpenChange,
  action,
  reason,
  onReasonChange,
  onConfirm,
  isLoading = false
}: StatusUpdateDialogProps) {
  if (!action) return null;
  
  const isCompleting = action === "complete";
  const isCanceling = action === "cancel";
  const isDeleting = action === "delete";

  const getTitle = () => {
    if (isCompleting) return "Concluir agendamento?";
    if (isCanceling) return "Cancelar agendamento?";
    if (isDeleting) return "Excluir agendamento?";
    return "";
  };

  const getDescription = () => {
    if (isCompleting) return "Tem certeza que deseja marcar este agendamento como concluído?";
    if (isCanceling) return "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.";
    if (isDeleting) return "Tem certeza que deseja excluir este agendamento permanentemente? Esta ação não pode ser desfeita.";
    return "";
  };

  const getButtonColor = () => {
    if (isCompleting) return "bg-green-600 hover:bg-green-700";
    if (isCanceling) return "bg-amber-600 hover:bg-amber-700";
    if (isDeleting) return "bg-red-600 hover:bg-red-700";
    return "";
  };

  const getButtonText = () => {
    if (isLoading) {
      if (isCompleting) return "Concluindo...";
      if (isCanceling) return "Cancelando...";
      if (isDeleting) return "Excluindo...";
      return "Processando...";
    } else {
      if (isCompleting) return "Sim, concluir agendamento";
      if (isCanceling) return "Sim, cancelar agendamento";
      if (isDeleting) return "Sim, excluir agendamento";
      return "Confirmar";
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        
        {isCanceling && (
          <div className="py-2">
            <Label htmlFor="cancelReason" className="mb-2 block">Motivo do cancelamento (opcional):</Label>
            <Textarea
              id="cancelReason"
              placeholder="Informe o motivo do cancelamento"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full"
            />
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={getButtonColor()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

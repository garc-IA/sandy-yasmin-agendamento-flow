
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useToast } from "@/hooks/use-toast";
import { RescheduleForm } from "./RescheduleForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RescheduleDialogProps {
  appointment: AppointmentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date, time: string) => Promise<boolean>;
  isLoading: boolean;
}

export function RescheduleDialog({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  isLoading,
}: RescheduleDialogProps) {
  const { toast } = useToast();

  // This function now returns a Promise<boolean> as expected by the interface
  const handleReschedule = async (date: Date, time: string): Promise<boolean> => {
    try {
      console.log("Iniciando processo de reagendamento...");
      const success = await onReschedule(date, time);
      
      if (success) {
        console.log("Reagendamento concluído com sucesso");
        toast({
          title: "Reagendamento realizado",
          description: `Agendamento remarcado para ${format(date, "dd 'de' MMMM", { locale: ptBR })} às ${time}`,
        });
        onClose();
      }
      return success;
    } catch (error) {
      console.error("Erro ao reagendar:", error);
      toast({
        title: "Erro ao reagendar",
        description: "Não foi possível reagendar o horário. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  if (!appointment) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Reagendar</DialogTitle>
          <DialogDescription>
            Escolha uma nova data e horário para o agendamento com {appointment.cliente.nome}.
          </DialogDescription>
        </DialogHeader>

        <RescheduleForm
          appointment={appointment}
          onReschedule={handleReschedule}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

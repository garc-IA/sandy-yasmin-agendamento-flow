
import { useCallback } from "react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment.types";
import { useAppointmentOperations } from "./useAppointmentOperations";
import { useToast } from "@/hooks/use-toast";

interface UseQuickActionsProps {
  onAppointmentUpdated?: () => void;
}

export function useQuickActions({ onAppointmentUpdated }: UseQuickActionsProps = {}) {
  const { updateStatus, isLoading } = useAppointmentOperations();
  const { toast } = useToast();

  const handleQuickComplete = useCallback(async (appointment: AppointmentWithDetails): Promise<boolean> => {
    try {
      const success = await updateStatus(appointment.id, "concluido");
      
      if (success) {
        toast({
          title: "Agendamento concluído",
          description: `Agendamento com ${appointment.cliente.nome} foi marcado como concluído.`,
        });
        onAppointmentUpdated?.();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao concluir agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível concluir o agendamento.",
        variant: "destructive",
      });
      return false;
    }
  }, [updateStatus, toast, onAppointmentUpdated]);

  const handleQuickCancel = useCallback(async (
    appointment: AppointmentWithDetails, 
    reason?: string
  ): Promise<boolean> => {
    try {
      const success = await updateStatus(
        appointment.id, 
        "cancelado", 
        reason || "Cancelamento rápido"
      );
      
      if (success) {
        toast({
          title: "Agendamento cancelado",
          description: `Agendamento com ${appointment.cliente.nome} foi cancelado.`,
        });
        onAppointmentUpdated?.();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
      return false;
    }
  }, [updateStatus, toast, onAppointmentUpdated]);

  const validateQuickAction = useCallback((
    appointment: AppointmentWithDetails, 
    action: AppointmentStatus
  ): { valid: boolean; message?: string } => {
    if (appointment.status !== "agendado") {
      return {
        valid: false,
        message: "Apenas agendamentos ativos podem ser alterados."
      };
    }

    return { valid: true };
  }, []);

  return {
    handleQuickComplete,
    handleQuickCancel,
    validateQuickAction,
    isLoading
  };
}

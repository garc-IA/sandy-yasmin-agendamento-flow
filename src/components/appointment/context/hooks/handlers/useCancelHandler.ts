
import { useCallback } from "react";
import { useAppointmentOperations } from "@/hooks/appointment/useAppointmentOperations";
import { useToast } from "@/hooks/use-toast";
import { logAppointmentAction, logAppointmentError } from "@/utils/debugUtils";

interface UseCancelHandlerProps {
  appointmentToCancel: string | null;
  cancelReason: string;
  validateAppointmentExists: (id: string | null) => boolean;
  closeCancelDialog: () => void;
  handleAppointmentUpdated: () => void;
}

export function useCancelHandler({
  appointmentToCancel,
  cancelReason,
  validateAppointmentExists,
  closeCancelDialog,
  handleAppointmentUpdated
}: UseCancelHandlerProps) {
  const { toast } = useToast();
  const { updateStatus } = useAppointmentOperations();

  const handleCancel = useCallback(async (): Promise<boolean> => {
    if (!appointmentToCancel || !validateAppointmentExists(appointmentToCancel)) {
      logAppointmentError('Tentativa de cancelar sem ID válido', appointmentToCancel || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    const reasonToUse = cancelReason || 'Cancelamento sem motivo especificado';
    logAppointmentAction('Cancelando agendamento', appointmentToCancel, {
      motivo: reasonToUse
    });

    try {
      const success = await updateStatus(appointmentToCancel, 'cancelado', reasonToUse);
      
      if (success) {
        closeCancelDialog();
        handleAppointmentUpdated();
        return true;
      } else {
        toast({
          title: 'Erro na operação',
          description: 'Não foi possível cancelar o agendamento. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao cancelar agendamento', appointmentToCancel, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o cancelamento. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [appointmentToCancel, cancelReason, validateAppointmentExists, updateStatus, toast, closeCancelDialog, handleAppointmentUpdated]);

  return {
    handleCancel
  };
}

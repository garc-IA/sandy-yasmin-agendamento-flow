
import { useCallback } from "react";
import { AppointmentStatus } from "@/types/appointment.types";
import { useAppointmentOperations } from "@/hooks/appointment/useAppointmentOperations";
import { useToast } from "@/hooks/use-toast";
import { logAppointmentAction, logAppointmentError } from "@/utils/debugUtils";
import { useAppointmentNotifications } from "@/hooks/appointment/useAppointmentNotifications";
import { isInPast } from "@/lib/dateUtils";

interface UseStatusUpdateHandlerProps {
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  validateAppointmentExists: (id: string | null) => boolean;
  closeStatusUpdateDialog: () => void;
  handleAppointmentUpdated: () => void;
}

export function useStatusUpdateHandler({
  appointmentToUpdate,
  validateAppointmentExists,
  closeStatusUpdateDialog,
  handleAppointmentUpdated
}: UseStatusUpdateHandlerProps) {
  const { toast } = useToast();
  const { updateStatus } = useAppointmentOperations();
  const { showStatusUpdateSuccess, showStatusUpdateError } = useAppointmentNotifications();

  const handleStatusUpdate = useCallback(async (): Promise<boolean> => {
    if (!appointmentToUpdate || !validateAppointmentExists(appointmentToUpdate.id)) {
      logAppointmentError('Tentativa de atualizar status sem ID válido', appointmentToUpdate?.id || 'null');
      toast({
        title: 'Erro na operação',
        description: 'ID de agendamento inválido. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    // Get appointment details to check if it's in the future
    const appointment = await getAppointmentDetails(appointmentToUpdate.id);
    
    // If trying to mark as completed, validate it's not a future appointment
    if (appointmentToUpdate.status === 'concluido' && appointment) {
      if (!isInPast(appointment.data, appointment.hora)) {
        toast({
          title: 'Operação não permitida',
          description: 'Não é possível marcar como concluído um agendamento futuro.',
          variant: 'destructive',
        });
        return false;
      }
    }

    logAppointmentAction('Atualizando status', appointmentToUpdate.id, {
      status: appointmentToUpdate.status
    });

    try {
      const success = await updateStatus(appointmentToUpdate.id, appointmentToUpdate.status);
      
      if (success) {
        closeStatusUpdateDialog();
        handleAppointmentUpdated();
        return true;
      } else {
        showStatusUpdateError('Não foi possível atualizar o status. Tente novamente.');
        return false;
      }
    } catch (error) {
      logAppointmentError('Erro ao atualizar status', appointmentToUpdate.id, error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante a atualização. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  }, [appointmentToUpdate, validateAppointmentExists, updateStatus, showStatusUpdateError, toast, closeStatusUpdateDialog, handleAppointmentUpdated]);

  // Helper function to get appointment details
  const getAppointmentDetails = async (id: string) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('agendamentos')
        .select('data, hora')
        .eq('id', id)
        .single();
      return data;
    } catch (error) {
      console.error('Error fetching appointment details', error);
      return null;
    }
  };

  return {
    handleStatusUpdate
  };
}

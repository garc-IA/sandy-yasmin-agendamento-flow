
/**
 * Hook específico para operações de status de agendamento
 * Extração do useAppointmentOperations para melhor organização
 */
import { AppointmentStatus } from '@/types/appointment.types';
import { logger } from '@/utils/logger';
import { useAppointmentCore } from '../core/useAppointmentCore';

export const useAppointmentStatusOperations = () => {
  const { 
    isLoading, 
    setIsLoading, 
    database, 
    forceRefreshAppointments, 
    showSuccessToast, 
    showErrorToast 
  } = useAppointmentCore();

  /**
   * Updates appointment status with validation and history tracking
   */
  const updateStatus = async (
    appointmentId: string,
    status: AppointmentStatus,
    reason?: string
  ): Promise<boolean> => {
    if (!appointmentId) {
      showErrorToast(new Error("ID de agendamento inválido"));
      return false;
    }

    setIsLoading(true);
    const endTiming = logger.timing.start(`updateStatus to ${status}`);
    
    try {
      logger.appointment.action('Atualizando status', appointmentId, { status, reason });

      // Update appointment status
      const { success, error } = await database.updateAppointmentStatus(appointmentId, status, reason);
      
      if (!success) {
        throw new Error(error?.message || "Falha ao atualizar status");
      }

      // Create history entry
      try {
        const historyDescription = `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`;
        const { success: historySuccess, error: historyError } = await database.createHistoryEntry(
          appointmentId,
          status,
          historyDescription,
          status
        );

        if (!historySuccess) {
          logger.warn(`Histórico não registrado para agendamento ${appointmentId}`, historyError);
        }
      } catch (historyError) {
        logger.warn(`Erro ao registrar histórico para agendamento ${appointmentId}`, historyError);
      }

      // Show appropriate success message
      const messages = {
        'concluido': { title: "Agendamento concluído", desc: "O agendamento foi marcado como concluído com sucesso" },
        'cancelado': { title: "Agendamento cancelado", desc: "O agendamento foi cancelado com sucesso" },
        'default': { title: "Status atualizado", desc: "O status do agendamento foi atualizado com sucesso" }
      };
      
      const message = messages[status] || messages.default;
      showSuccessToast(message.title, message.desc);

      // Force refresh of all appointment data
      await forceRefreshAppointments();
      
      endTiming();
      return true;
    } catch (error: any) {
      logger.appointment.error(`Erro ao atualizar status para ${status}`, appointmentId, error);
      showErrorToast(error);
      endTiming();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Convenience methods
  const completeAppointment = async (appointmentId: string): Promise<boolean> => {
    return updateStatus(appointmentId, 'concluido');
  };

  const cancelAppointment = async (appointmentId: string, reason: string): Promise<boolean> => {
    return updateStatus(appointmentId, 'cancelado', reason);
  };

  return {
    updateStatus,
    completeAppointment,
    cancelAppointment,
    isLoading
  };
};


/**
 * Hook específico para operações de exclusão de agendamento
 * Extração do useAppointmentOperations para melhor organização
 */
import { logger } from '@/utils/logger';
import { useAppointmentCore } from '../core/useAppointmentCore';

export const useAppointmentDeleteOperations = () => {
  const { 
    isLoading, 
    setIsLoading, 
    database, 
    forceRefreshAppointments, 
    showSuccessToast, 
    showErrorToast 
  } = useAppointmentCore();

  /**
   * Deletes an appointment
   */
  const deleteAppointment = async (appointmentId: string): Promise<boolean> => {
    if (!appointmentId) {
      showErrorToast(new Error("ID de agendamento inválido"));
      return false;
    }

    setIsLoading(true);
    const endTiming = logger.timing.start('deleteAppointment');
    
    try {
      logger.appointment.action('Excluindo agendamento', appointmentId);

      // Use database function to delete appointment and history
      const { success, error } = await database.deleteAppointmentWithHistory(appointmentId);

      if (!success) {
        logger.appointment.error('Falha ao excluir agendamento', appointmentId, error);
        throw new Error(error?.message || "Falha ao excluir agendamento");
      }

      logger.appointment.action('Agendamento excluído com sucesso', appointmentId);

      showSuccessToast(
        "Agendamento excluído",
        "O agendamento foi excluído com sucesso"
      );

      // Force refresh of all appointment data
      await forceRefreshAppointments();
      
      endTiming();
      return true;
    } catch (error: any) {
      logger.appointment.error('Erro ao excluir agendamento', appointmentId, error);
      showErrorToast(error);
      endTiming();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteAppointment,
    isLoading
  };
};


/**
 * Hook específico para operações de reagendamento
 * Extração do useAppointmentOperations para melhor organização
 */
import { logger } from '@/utils/logger';
import { useAppointmentCore } from '../core/useAppointmentCore';

export const useAppointmentRescheduleOperations = () => {
  const { 
    isLoading, 
    setIsLoading, 
    database, 
    forceRefreshAppointments, 
    showSuccessToast, 
    showErrorToast 
  } = useAppointmentCore();

  /**
   * Reschedules an appointment
   */
  const reschedule = async (
    appointmentId: string, 
    date: string | Date, 
    time: string
  ): Promise<boolean> => {
    if (!appointmentId) {
      showErrorToast(new Error("ID de agendamento inválido"));
      return false;
    }

    if (!date || !time) {
      showErrorToast(new Error("Data e hora são obrigatórios"));
      return false;
    }

    setIsLoading(true);
    const endTiming = logger.timing.start('rescheduleAppointment');
    
    try {
      logger.appointment.action('Reagendando agendamento', appointmentId, { date, time });
      
      // Update appointment date and time
      const { success, error } = await database.rescheduleAppointment(appointmentId, date, time);

      if (!success) {
        const errorMsg = error?.message || "Não foi possível reagendar o agendamento";
        throw new Error(errorMsg);
      }

      // Create history entry
      const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const { success: historySuccess, error: historyError } = await database.createHistoryEntry(
        appointmentId,
        'reagendado',
        `Agendamento reagendado para ${formattedDate} às ${time}`,
        `${formattedDate} ${time}`
      );

      if (!historySuccess) {
        logger.warn("Histórico não registrado", historyError);
      }

      // Force refresh of all appointment data
      await forceRefreshAppointments();
      
      showSuccessToast(
        "Agendamento reagendado", 
        "O agendamento foi reagendado com sucesso"
      );
      
      endTiming();
      return true;
    } catch (error) {
      logger.appointment.error('Erro ao reagendar agendamento', appointmentId, error);
      showErrorToast(error);
      endTiming();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reschedule,
    isLoading
  };
};


import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { DatabaseResult } from "../useAppointmentTypes";

/**
 * Hook for handling appointment rescheduling in the database
 */
export const useAppointmentRescheduling = () => {
  /**
   * Reschedules an appointment in the database
   * @param appointmentId - The ID of the appointment to reschedule
   * @param date - The new date
   * @param time - The new time
   */
  const rescheduleAppointment = async (
    appointmentId: string,
    date: Date | string,
    time: string
  ): Promise<DatabaseResult> => {
    if (!appointmentId || appointmentId.trim() === '') {
      logger.appointment.error('ID de agendamento inválido para reagendamento', appointmentId || 'null');
      return { 
        data: null, 
        error: new Error('ID de agendamento inválido'), 
        success: false 
      };
    }

    const formattedDate = date instanceof Date 
      ? date.toISOString().split('T')[0]
      : date;

    const updateData = { 
      data: formattedDate, 
      hora: time 
    };

    logger.appointment.action('Executando reagendamento no banco', appointmentId, updateData);

    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', appointmentId)
        .select();
      
      logger.database.operation('UPDATE', 'agendamentos', { data, error });
      
      return { 
        data, 
        error: error || null, 
        success: !error && data !== null 
      };
    } catch (error) {
      logger.appointment.error('Erro inesperado ao reagendar', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return { rescheduleAppointment };
};

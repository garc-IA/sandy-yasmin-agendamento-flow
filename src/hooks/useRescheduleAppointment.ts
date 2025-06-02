
import { useState } from 'react';
import { format } from 'date-fns';
import { useAppointmentOperations } from './appointment/useAppointmentOperations';
import { 
  logAppointmentAction, 
  logAppointmentError, 
  traceAppointmentFlow,
  validateAppointmentId,
  logStackTrace
} from '@/utils/debugUtils';

export const useRescheduleAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { reschedule: rescheduleOperation } = useAppointmentOperations();

  /**
   * Reschedules an appointment to a new date and time
   */
  const rescheduleAppointment = async (
    appointmentId: string,
    date: Date,
    time: string,
    professionalId: string,
    note?: string
  ): Promise<boolean> => {
    logStackTrace("rescheduleAppointment chamado");
    
    // Validate appointment ID
    if (!validateAppointmentId(appointmentId)) {
      return false;
    }

    // Validate other required parameters
    if (!date || !time || !professionalId) {
      return false;
    }

    setIsLoading(true);
    traceAppointmentFlow("Iniciando reagendamento", appointmentId, { date: format(date, 'yyyy-MM-dd'), time });

    try {
      const success = await rescheduleOperation(appointmentId, date, time);
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logAppointmentError("Erro inesperado ao reagendar", appointmentId, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rescheduleAppointment,
    isLoading
  };
};

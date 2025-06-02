
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AppointmentStatus } from "@/types/appointment.types";
import { useAppointmentDatabase } from "./useAppointmentDatabase";
import { useAppointmentCache } from "./useAppointmentCache";
import { isInPast } from "@/lib/dateUtils";
import { logAppointmentAction, logAppointmentError } from "@/utils/debugUtils";

/**
 * Centralized hook for all appointment actions
 * This consolidates all the previously separated action hooks
 */
export const useAppointmentActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Get database operations
  const {
    updateAppointmentStatus,
    rescheduleAppointment: dbRescheduleAppointment,
    createHistoryEntry,
    deleteAppointmentWithHistory,
    getAppointmentById
  } = useAppointmentDatabase();
  
  // Get cache operations
  const { forceRefetchAll } = useAppointmentCache();

  /**
   * Generic function to show success toast
   */
  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description,
      duration: 4000
    });
  };

  /**
   * Generic function to show error toast
   */
  const showErrorToast = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
    
    toast({
      title: "Erro na operação",
      description: errorMessage,
      variant: "destructive",
      duration: 5000
    });
  };

  /**
   * Central function for updating appointment status
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
    
    try {
      logAppointmentAction(`Atualizando status para ${status}`, appointmentId);
      
      // If trying to mark as completed, validate it's not a future appointment
      if (status === 'concluido') {
        const { data: appointment, success } = await getAppointmentById(appointmentId);
        
        if (success && appointment) {
          if (!isInPast(appointment.data, appointment.hora)) {
            showErrorToast(new Error("Não é possível marcar como concluído um agendamento futuro"));
            return false;
          }
        }
      }

      // Update the appointment status
      const { success, error } = await updateAppointmentStatus(
        appointmentId,
        status,
        reason
      );

      if (!success) {
        const errorMsg = error?.message || `Não foi possível atualizar o status para ${status}`;
        throw new Error(errorMsg);
      }

      // Create history entry - agora deve funcionar com as políticas RLS corrigidas
      let historyDescription = `Status alterado para ${status}`;
      if (reason && status === 'cancelado') {
        historyDescription += ` - Motivo: ${reason}`;
      }
      
      const { success: historySuccess, error: historyError } = await createHistoryEntry(
        appointmentId,
        status,
        historyDescription,
        status
      );

      if (!historySuccess) {
        console.warn("⚠️ Histórico não registrado:", historyError);
        // Não falhar a operação por conta do histórico
      } else {
        console.log("✅ Histórico registrado com sucesso");
      }

      // Force refresh of all appointment data
      await forceRefetchAll();
      
      // Show appropriate success message
      let successTitle = "Status atualizado";
      let successDesc = "O status do agendamento foi atualizado com sucesso";
      
      if (status === 'concluido') {
        successTitle = "Agendamento concluído";
        successDesc = "O agendamento foi marcado como concluído com sucesso";
      } else if (status === 'cancelado') {
        successTitle = "Agendamento cancelado";
        successDesc = "O agendamento foi cancelado com sucesso";
      }
      
      showSuccessToast(successTitle, successDesc);
      
      return true;
    } catch (error) {
      logAppointmentError(`Erro ao atualizar status para ${status}`, appointmentId, error);
      showErrorToast(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete an appointment (shorthand for updateStatus)
   */
  const completeAppointment = async (appointmentId: string): Promise<boolean> => {
    return updateStatus(appointmentId, 'concluido');
  };

  /**
   * Cancel an appointment (shorthand for updateStatus)
   */
  const cancelAppointment = async (appointmentId: string, reason: string): Promise<boolean> => {
    return updateStatus(appointmentId, 'cancelado', reason);
  };

  /**
   * Reschedule an appointment
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
    
    try {
      logAppointmentAction('Reagendando agendamento', appointmentId, { date, time });
      
      // Update appointment date and time
      const { success, error } = await dbRescheduleAppointment(
        appointmentId, 
        date, 
        time
      );

      if (!success) {
        const errorMsg = error?.message || "Não foi possível reagendar o agendamento";
        throw new Error(errorMsg);
      }

      // Create history entry
      const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const { success: historySuccess, error: historyError } = await createHistoryEntry(
        appointmentId,
        'reagendado',
        `Agendamento reagendado para ${formattedDate} às ${time}`,
        `${formattedDate} ${time}`
      );

      if (!historySuccess) {
        console.warn("⚠️ Histórico não registrado:", historyError);
      }

      // Force refresh of all appointment data
      await forceRefetchAll();
      
      showSuccessToast(
        "Agendamento reagendado", 
        "O agendamento foi reagendado com sucesso"
      );
      
      return true;
    } catch (error) {
      logAppointmentError('Erro ao reagendar agendamento', appointmentId, error);
      showErrorToast(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete an appointment
   */
  const deleteAppointment = async (appointmentId: string): Promise<boolean> => {
    if (!appointmentId) {
      showErrorToast(new Error("ID de agendamento inválido"));
      return false;
    }

    setIsLoading(true);
    
    try {
      logAppointmentAction('Excluindo agendamento', appointmentId);
      
      // Use the database function to delete appointment and history
      const { success, error } = await deleteAppointmentWithHistory(appointmentId);

      if (!success) {
        const errorMsg = error?.message || "Não foi possível excluir o agendamento";
        throw new Error(errorMsg);
      }

      // Force refresh of all appointment data
      await forceRefetchAll();
      
      showSuccessToast(
        "Agendamento excluído", 
        "O agendamento foi excluído com sucesso"
      );
      
      return true;
    } catch (error) {
      logAppointmentError('Erro ao excluir agendamento', appointmentId, error);
      showErrorToast(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateStatus,
    completeAppointment,
    cancelAppointment,
    reschedule,
    deleteAppointment,
    isLoading,
  };
};

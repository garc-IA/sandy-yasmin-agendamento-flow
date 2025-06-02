
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';
import { logAppointmentAction, logAppointmentError, traceAppointmentFlow } from '@/utils/debugUtils';
import { useAppointmentCache } from './useAppointmentCache';
import { useAppointmentDatabase } from './useAppointmentDatabase';
import { isInPast } from '@/lib/dateUtils';
import { logAppointment, logError, startTiming } from '@/utils/logUtils';

/**
 * Consolidated hook for all appointment operations
 * Combines functionality from useAppointmentActions and useUpdateAppointmentStatus
 */
export const useAppointmentOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { forceRefetchAll, refreshDashboardData } = useAppointmentCache();
  const { 
    updateAppointmentStatus,
    createHistoryEntry,
    deleteAppointmentWithHistory,
    rescheduleAppointment: dbRescheduleAppointment,
    getAppointmentById
  } = useAppointmentDatabase();

  // Enhanced cache refresh function
  const forceRefreshAppointments = async () => {
    const endTiming = startTiming('forceRefreshAppointments');
    try {
      logAppointment('Iniciando atualização de cache', 'global');
      
      // Invalidate all appointment-related queries
      await queryClient.invalidateQueries({ 
        predicate: query => 
          Array.isArray(query.queryKey) && 
          query.queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes('appointment') || 
             key.includes('agendamento') || 
             key.includes('dashboard'))
          )
      });

      // Use specialized cache functions
      await forceRefetchAll();
      await refreshDashboardData();
      
      // Force refetch of active queries
      await queryClient.refetchQueries({ type: 'active' });
      
      // Small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 300));

      logAppointment('Cache atualizado com sucesso', 'global');
      endTiming();
      return true;
    } catch (error) {
      logError('Erro ao forçar atualização do cache', error);
      endTiming();
      return false;
    }
  };

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
    const endTiming = startTiming(`updateStatus to ${status}`);
    
    try {
      logAppointment('Atualizando status', appointmentId, { status, reason });

      // Validate for completion status
      if (status === 'concluido') {
        const { data: appointment, success } = await getAppointmentById(appointmentId);
        
        if (success && appointment) {
          if (!isInPast(appointment.data, appointment.hora)) {
            showErrorToast(new Error("Não é possível marcar como concluído um agendamento futuro"));
            return false;
          }
        }
      }

      // Update appointment status
      const { success, error } = await updateAppointmentStatus(appointmentId, status, reason);
      
      if (!success) {
        throw new Error(error?.message || "Falha ao atualizar status");
      }

      // Create history entry
      try {
        const historyDescription = `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`;
        const { success: historySuccess, error: historyError } = await createHistoryEntry(
          appointmentId,
          status,
          historyDescription,
          status
        );

        if (!historySuccess) {
          console.warn(`⚠️ Histórico não registrado para agendamento ${appointmentId}:`, historyError);
        }
      } catch (historyError) {
        console.warn(`⚠️ Erro ao registrar histórico para agendamento ${appointmentId}:`, historyError);
      }

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

      // Force refresh of all appointment data
      await forceRefreshAppointments();
      
      // Additional query after cache expiration
      setTimeout(async () => {
        await queryClient.refetchQueries({ 
          queryKey: ['appointments'],
          type: 'active',
        });
        console.log("✅ Realizada consulta adicional para garantir dados atualizados");
      }, 1000);
      
      endTiming();
      return true;
    } catch (error: any) {
      logError(`Erro ao atualizar status para ${status}`, error);
      showErrorToast(error);
      endTiming();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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
      await forceRefreshAppointments();
      
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
   * Deletes an appointment
   */
  const deleteAppointment = async (appointmentId: string): Promise<boolean> => {
    if (!appointmentId) {
      showErrorToast(new Error("ID de agendamento inválido"));
      return false;
    }

    setIsLoading(true);
    const endTiming = startTiming('deleteAppointment');
    
    try {
      logAppointment('Excluindo agendamento', appointmentId);

      // Use database function to delete appointment and history
      const { success, error } = await deleteAppointmentWithHistory(appointmentId);

      if (!success) {
        logError('Falha ao excluir agendamento', error);
        throw new Error(error?.message || "Falha ao excluir agendamento");
      }

      logAppointment('Agendamento excluído com sucesso', appointmentId);

      showSuccessToast(
        "Agendamento excluído",
        "O agendamento foi excluído com sucesso"
      );

      // Force refresh of all appointment data
      await forceRefreshAppointments();
      
      endTiming();
      return true;
    } catch (error: any) {
      logAppointmentError('Erro ao excluir agendamento', appointmentId, error);
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
    // Core operations
    updateStatus,
    reschedule,
    deleteAppointment,
    
    // Convenience methods
    completeAppointment,
    cancelAppointment,
    
    // State
    isLoading,
  };
};

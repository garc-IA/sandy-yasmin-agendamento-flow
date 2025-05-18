
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';
import { logAppointmentAction, logAppointmentError, traceAppointmentFlow } from '@/utils/debugUtils';
import { useAppointmentCache } from './appointment/useAppointmentCache';
import { useAppointmentDatabase } from './appointment/useAppointmentDatabase';
import { logAppointment, logError, startTiming } from '@/utils/logUtils';

export const useUpdateAppointmentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { forceRefetchAll, refreshDashboardData } = useAppointmentCache();
  const { 
    updateAppointmentStatus,
    createHistoryEntry,
    deleteAppointmentWithHistory 
  } = useAppointmentDatabase();

  // Função aprimorada para invalidação de cache e atualização da UI
  const forceRefreshAppointments = async () => {
    const endTiming = startTiming('forceRefreshAppointments');
    try {
      logAppointment('Iniciando atualização de cache', 'global');
      
      // Primeiro invalidamos todos os caches que possam conter dados de agendamentos
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

      // Depois usamos nossa função especializada para garantir consistência
      await forceRefetchAll();
      
      // E também garantimos que o dashboard está atualizado
      await refreshDashboardData();
      
      // Adicionar um pequeno atraso para garantir que a UI seja atualizada
      await new Promise(resolve => setTimeout(resolve, 100));

      logAppointment('Cache atualizado com sucesso', 'global');
      endTiming();
      return true;
    } catch (error) {
      logError('Erro ao forçar atualização do cache', error);
      endTiming();
      return false;
    }
  };

  const updateStatus = async (appointmentId: string, status: AppointmentStatus, reason?: string) => {
    if (!appointmentId) {
      toast({
        title: "Erro na operação",
        description: "ID de agendamento inválido",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    const endTiming = startTiming(`updateStatus to ${status}`);
    
    try {
      logAppointment('Atualizando status', appointmentId, { status, reason });

      // Usar nosso hook refatorado para atualizar o status
      const { success, error } = await updateAppointmentStatus(appointmentId, status, reason);
      
      if (!success) {
        throw new Error(error?.message || "Falha ao atualizar status");
      }

      // Tentar criar entrada no histórico, mas continuar mesmo se falhar
      try {
        const historyDescription = `Status alterado para ${status}${reason ? ` - Motivo: ${reason}` : ''}`;
        const { success: historySuccess, error: historyError } = await createHistoryEntry(
          appointmentId,
          status,
          historyDescription,
          undefined,
          status
        );

        if (!historySuccess) {
          console.warn(`⚠️ Histórico não registrado para agendamento ${appointmentId}:`, historyError);
          // Continuamos apesar do erro no histórico
        }
      } catch (historyError) {
        console.warn(`⚠️ Erro ao registrar histórico para agendamento ${appointmentId}:`, historyError);
        // Continuamos apesar do erro no histórico
      }

      // Mostrar notificação de sucesso
      toast({
        title: "Sucesso!",
        description: status === "cancelado" ? "Agendamento cancelado com sucesso." : 
                    status === "concluido" ? "Agendamento concluído com sucesso." : 
                    "Status atualizado com sucesso.",
      });

      // Força atualização completa dos dados com atraso para garantir consistência
      await forceRefreshAppointments();
      
      // Forçar nova consulta após o tempo de expiração do cache
      setTimeout(async () => {
        await queryClient.refetchQueries({ 
          queryKey: ['appointments'],
          type: 'active',
        });
        console.log("✅ Realizada consulta adicional para garantir dados atualizados");
      }, 500);
      
      endTiming();
      return true;
    } catch (error: any) {
      logError(`Erro ao atualizar status para ${status}`, error);
      toast({
        title: "Erro ao atualizar agendamento",
        description: error?.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      endTiming();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!appointmentId) {
      toast({
        title: "Erro na operação",
        description: "ID de agendamento inválido",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    const endTiming = startTiming('deleteAppointment');
    
    try {
      logAppointment('Excluindo agendamento', appointmentId);

      // Usar nosso hook refatorado para excluir o agendamento
      const { success, error } = await deleteAppointmentWithHistory(appointmentId);

      if (!success) {
        logError('Falha ao excluir agendamento', error);
        throw new Error(error?.message || "Falha ao excluir agendamento");
      }

      logAppointment('Agendamento excluído com sucesso', appointmentId);

      // Mostrar notificação de sucesso
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso."
      });

      // Força atualização completa dos dados
      await forceRefreshAppointments();
      
      endTiming();
      return true;
    } catch (error: any) {
      logAppointmentError('Erro ao excluir agendamento', appointmentId, error);
      toast({
        title: "Erro ao excluir agendamento",
        description: error?.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      endTiming();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateStatus,
    deleteAppointment,
    isLoading,
  };
};

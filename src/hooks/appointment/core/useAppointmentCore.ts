
/**
 * Hook core para operações básicas de agendamento
 * Extração das funcionalidades essenciais do useAppointmentOperations
 */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AppointmentStatus } from '@/types/appointment.types';
import { logger } from '@/utils/logger';
import { useAppointmentDatabase } from '../useAppointmentDatabase';
import { useAppointmentCache } from '../useAppointmentCache';

export const useAppointmentCore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { forceRefetchAll, refreshDashboardData } = useAppointmentCache();
  const database = useAppointmentDatabase();

  /**
   * Força atualização completa do cache
   */
  const forceRefreshAppointments = async (): Promise<boolean> => {
    const endTiming = logger.timing.start('forceRefreshAppointments');
    
    try {
      logger.cache.refresh('Iniciando atualização global');
      
      // Invalidate appointment-related queries
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

      // Use cache functions
      await forceRefetchAll();
      await refreshDashboardData();
      await queryClient.refetchQueries({ type: 'active' });
      
      // Small delay for UI updates
      await new Promise(resolve => setTimeout(resolve, 300));

      logger.cache.refresh('Cache atualizado com sucesso');
      endTiming();
      return true;
    } catch (error) {
      logger.error('Erro ao forçar atualização do cache', error);
      endTiming();
      return false;
    }
  };

  /**
   * Shows success toast with standardized messaging
   */
  const showSuccessToast = (title: string, description: string) => {
    toast({ title, description, duration: 4000 });
  };

  /**
   * Shows error toast with friendly messaging
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

  return {
    isLoading,
    setIsLoading,
    database,
    forceRefreshAppointments,
    showSuccessToast,
    showErrorToast
  };
};

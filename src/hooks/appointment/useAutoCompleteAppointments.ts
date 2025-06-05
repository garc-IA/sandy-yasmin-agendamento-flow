
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function useAutoCompleteAppointments() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [lastUpdateCount, setLastUpdateCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Função simples para executar auto-complete
  const runAutoComplete = async () => {
    if (isRunning) return { success: false, updated: 0 };
    
    setIsRunning(true);
    
    try {
      const { data, error } = await supabase.rpc('auto_complete_past_appointments');
      
      if (error) {
        console.error('Erro ao executar auto-complete:', error);
        return { success: false, updated: 0 };
      }
      
      const updated = data ? data.filter((item: any) => item.updated === true) : [];
      const totalUpdated = updated.length;
      
      setLastRunTime(new Date());
      setLastUpdateCount(totalUpdated);
      
      // Invalidação simples apenas das queries necessárias
      if (totalUpdated > 0) {
        await queryClient.invalidateQueries({ queryKey: ['appointments'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] });
        
        toast({
          title: "Agendamentos atualizados",
          description: `${totalUpdated} agendamentos foram automaticamente concluídos.`,
          duration: 4000
        });
      }
      
      return { success: true, updated: totalUpdated };
    } catch (err) {
      console.error('Erro inesperado:', err);
      return { success: false, updated: 0 };
    } finally {
      setIsRunning(false);
    }
  };

  // Verificação manual com feedback
  const runManualCheck = async () => {
    const result = await runAutoComplete();
    
    toast({
      title: "Verificação concluída",
      description: `${result.updated} agendamentos atualizados.`,
      duration: 3000
    });
    
    return result;
  };

  // Timer simples - executa a cada 5 minutos
  useEffect(() => {
    // Primeira execução após 30 segundos
    const initialTimer = setTimeout(runAutoComplete, 30000);
    
    // Depois a cada 5 minutos
    const interval = setInterval(runAutoComplete, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);
  
  return { 
    runAutoComplete, 
    runManualCheck,
    isRunning, 
    lastRunTime,
    lastUpdateCount
  };
}

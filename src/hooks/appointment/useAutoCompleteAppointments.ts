
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function useAutoCompleteAppointments() {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const runAutoComplete = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-complete-appointments');
      
      if (error) {
        console.error('Erro ao executar auto-complete:', error);
        return;
      }
      
      // Se algum agendamento foi atualizado, invalidar os caches e mostrar notificação
      if (data?.updated > 0) {
        console.log(`✅ ${data.updated} agendamentos antigos foram automaticamente concluídos.`);
        
        // Invalidar todos os caches relacionados a agendamentos
        await queryClient.invalidateQueries({ 
          predicate: query => 
            Array.isArray(query.queryKey) && 
            query.queryKey.some(key => 
              typeof key === 'string' && 
              (key.includes('appointment') || key.includes('agendamento'))
            )
        });
        
        // Mostrar notificação apenas se tiver atualizado algum
        toast({
          title: "Agendamentos atualizados",
          description: `${data.updated} agendamentos antigos foram automaticamente concluídos.`
        });
      }
    } catch (err) {
      console.error('Erro inesperado ao executar auto-complete:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Executar ao montar o componente e periodicamente a cada 5 minutos
  useEffect(() => {
    // Executar imediatamente quando o componente montar
    runAutoComplete();
    
    // E então a cada 5 minutos
    const interval = setInterval(runAutoComplete, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { runAutoComplete, isRunning };
}

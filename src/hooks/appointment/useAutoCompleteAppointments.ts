
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function useAutoCompleteAppointments() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Função para executar a função RPC do Supabase (agora corrigida)
  const runRpcAutoComplete = async () => {
    try {
      console.log("⏱️ Executando auto_complete_past_appointments via RPC...");
      
      const { data, error } = await supabase.rpc('auto_complete_past_appointments');
      
      if (error) {
        console.error('❌ Erro ao executar auto_complete_past_appointments:', error);
        return { success: false, updated: 0, error: error.message };
      }
      
      // Filtrar os resultados para incluir apenas atualizações
      const updated = data ? data.filter((item: any) => item.updated === true) : [];
      const totalUpdated = updated.length;
      
      console.log(`✅ RPC auto_complete_past_appointments: ${totalUpdated} agendamentos atualizados`, updated);
      return { success: true, updated: totalUpdated, details: updated };
      
    } catch (err) {
      console.error('❌ Erro inesperado ao executar auto_complete_past_appointments via RPC:', err);
      return { success: false, updated: 0, error: String(err) };
    }
  };
  
  // Função para executar o Edge Function como fallback
  const runEdgeFunctionAutoComplete = async () => {
    try {
      console.log("⏱️ Executando auto-complete-appointments via Edge Function (fallback)...");
      
      const { data, error } = await supabase.functions.invoke('auto-complete-appointments');
      
      if (error) {
        console.error('❌ Erro ao executar auto-complete-appointments:', error);
        return { success: false, updated: 0, error: error.message };
      }
      
      console.log("✅ Edge Function auto-complete resultado:", data);
      
      return { 
        success: true, 
        updated: data?.updated || 0,
        details: data?.details || []
      };
      
    } catch (err) {
      console.error('❌ Erro inesperado ao executar auto-complete via Edge Function:', err);
      return { success: false, updated: 0, error: String(err) };
    }
  };
  
  const runAutoComplete = async () => {
    if (isRunning) return { success: false, updated: 0 };
    
    setIsRunning(true);
    try {
      console.log("🔧 Iniciando auto-complete...");
      
      // Tentar primeiro via RPC
      let result = await runRpcAutoComplete();
      
      // Se falhar, tentar via Edge Function como fallback
      if (!result.success) {
        console.log("⚠️ RPC falhou, tentando via Edge Function...");
        result = await runEdgeFunctionAutoComplete();
      }
      
      setLastRunTime(new Date());
      
      // Se algum agendamento foi atualizado, invalidar os caches e mostrar notificação
      if (result.updated > 0) {
        console.log(`✅ ${result.updated} agendamentos antigos foram automaticamente concluídos.`);
        
        // Forçar invalidação completa do cache de agendamentos
        await forceInvalidateCache();
        
        // Mostrar notificação de sucesso
        toast({
          title: "Agendamentos atualizados!",
          description: `${result.updated} agendamentos antigos foram automaticamente concluídos.`,
          duration: 5000
        });
      } else {
        console.log("✅ Nenhum agendamento antigo encontrado para ser concluído.");
      }
      
      return { success: true, updated: result.updated };
    } catch (err) {
      console.error('❌ Erro inesperado ao executar auto-complete:', err);
      
      toast({
        title: "Erro na verificação",
        description: "Erro ao verificar agendamentos antigos. Tente novamente.",
        variant: "destructive",
        duration: 3000
      });
      
      return { success: false, updated: 0 };
    } finally {
      setIsRunning(false);
    }
  };

  // Método auxiliar para forçar invalidação de cache
  const forceInvalidateCache = async () => {
    console.log("🔄 Forçando invalidação completa do cache de agendamentos...");
    
    try {
      // Invalidar todas as queries relacionadas a agendamentos usando predicados para maior abrangência
      await queryClient.invalidateQueries({ 
        predicate: query => {
          if (Array.isArray(query.queryKey)) {
            return query.queryKey.some(key => 
              typeof key === 'string' && 
              (key.includes('appointment') || 
               key.includes('agendamento') ||
               key.includes('dashboard'))
            );
          }
          return false;
        }
      });
      
      // Forçar refetch de queries específicas para garantir dados frescos
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-data'] }),
        queryClient.refetchQueries({ queryKey: ['weekly-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['week-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['upcoming-appointments'] })
      ]);
      
      console.log("✅ Cache de agendamentos invalidado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao invalidar cache:", error);
    }
  };

  // Executar ao montar o componente e periodicamente a cada 2 minutos (mais frequente)
  useEffect(() => {
    // Executar imediatamente quando o componente montar
    const timer = setTimeout(() => {
      runAutoComplete();
    }, 1000);
    
    // E então a cada 2 minutos (ao invés de 5)
    const interval = setInterval(runAutoComplete, 2 * 60 * 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);
  
  return { 
    runAutoComplete, 
    isRunning, 
    lastRunTime,
    forceInvalidateCache
  };
}

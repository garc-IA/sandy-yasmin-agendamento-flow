
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function useAutoCompleteAppointments() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Função para executar a função RPC do Supabase (agora com logs detalhados)
  const runRpcAutoComplete = async () => {
    try {
      console.log("⏱️ Executando auto_complete_past_appointments via RPC...");
      console.log("🕐 Horário atual do sistema:", new Date().toISOString());
      console.log("🇧🇷 Horário atual do Brasil:", new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}));
      
      const { data, error } = await supabase.rpc('auto_complete_past_appointments');
      
      if (error) {
        console.error('❌ Erro ao executar auto_complete_past_appointments:', error);
        return { success: false, updated: 0, error: error.message };
      }
      
      // Log detalhado de todos os resultados
      console.log("📊 Resultados completos da função RPC:", data);
      
      // Filtrar os resultados para incluir apenas atualizações
      const updated = data ? data.filter((item: any) => item.updated === true) : [];
      const notUpdated = data ? data.filter((item: any) => item.updated === false) : [];
      const totalUpdated = updated.length;
      
      console.log(`✅ RPC auto_complete_past_appointments: ${totalUpdated} agendamentos atualizados`);
      console.log("🔄 Agendamentos atualizados:", updated);
      console.log("⏸️ Agendamentos não atualizados:", notUpdated);
      
      // Log específico para agendamentos de hoje às 14:00
      const todayStr = new Date().toISOString().split('T')[0];
      const appointments14h = data ? data.filter((item: any) => 
        item.appointment_date === todayStr && item.appointment_time === '14:00'
      ) : [];
      
      if (appointments14h.length > 0) {
        console.log("🎯 Agendamentos encontrados para hoje às 14:00:", appointments14h);
      } else {
        console.log("🔍 Nenhum agendamento encontrado para hoje às 14:00");
        console.log("📅 Procurando por data:", todayStr);
      }
      
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
    if (isRunning) {
      console.log("⚠️ Auto-complete já está executando, pulando execução");
      return { success: false, updated: 0 };
    }
    
    setIsRunning(true);
    try {
      console.log("🔧 Iniciando auto-complete...");
      console.log("🕐 Timestamp de início:", new Date().toISOString());
      
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
        console.log("📝 Verificando se há agendamentos das 14:00 que deveriam ter sido concluídos...");
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

  // Função para verificação manual imediata
  const runImmediateCheck = async () => {
    console.log("🚀 Executando verificação manual imediata...");
    return await runAutoComplete();
  };

  // Executar ao montar o componente e periodicamente a cada 1 minuto (ainda mais frequente para debug)
  useEffect(() => {
    console.log("🎬 useAutoCompleteAppointments hook montado");
    
    // Executar imediatamente quando o componente montar
    const timer = setTimeout(() => {
      console.log("🏃‍♂️ Executando primeira verificação após mount...");
      runAutoComplete();
    }, 1000);
    
    // E então a cada 1 minuto para debug mais rápido
    const interval = setInterval(() => {
      console.log("⏰ Executando verificação periódica...");
      runAutoComplete();
    }, 1 * 60 * 1000);
    
    return () => {
      console.log("🧹 Limpando timers do useAutoCompleteAppointments");
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);
  
  return { 
    runAutoComplete, 
    runImmediateCheck,
    isRunning, 
    lastRunTime,
    forceInvalidateCache
  };
}

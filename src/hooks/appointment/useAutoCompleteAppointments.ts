
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
  
  // Função para executar a função RPC do Supabase com invalidação agressiva
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
      
      console.log("📊 Resultados completos da função RPC:", data);
      
      // Filtrar os resultados para incluir apenas atualizações
      const updated = data ? data.filter((item: any) => item.updated === true) : [];
      const totalUpdated = updated.length;
      
      console.log(`✅ RPC auto_complete_past_appointments: ${totalUpdated} agendamentos atualizados`);
      console.log("🔄 Agendamentos atualizados:", updated);
      
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

  // Invalidação agressiva e completa do cache
  const forceCompleteInvalidation = async () => {
    console.log("🔥 INICIANDO INVALIDAÇÃO AGRESSIVA DO CACHE...");
    
    try {
      // 1. Invalidar TODAS as queries relacionadas a agendamentos
      await queryClient.invalidateQueries({
        predicate: query => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey : [];
          return queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes('appointment') || 
             key.includes('agendamento') ||
             key.includes('dashboard') ||
             key.includes('week') ||
             key.includes('upcoming') ||
             key.includes('clientes'))
          );
        }
      });

      // 2. Cancelar todas as queries em execução
      await queryClient.cancelQueries();

      // 3. Forçar refetch imediato de queries críticas
      const criticalQueries = [
        ['appointments'],
        ['agendamentos'],
        ['dashboard-appointments'],
        ['dashboard-data'],
        ['weekly-appointments'],
        ['week-appointments'],
        ['upcoming-appointments'],
        ['new-clients']
      ];

      await Promise.allSettled(
        criticalQueries.map(queryKey => 
          queryClient.refetchQueries({ 
            queryKey, 
            type: 'active',
            exact: false 
          })
        )
      );

      // 4. Invalidar novamente para garantir
      await queryClient.invalidateQueries();

      // 5. Aguardar um pouco para sincronização
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("✅ INVALIDAÇÃO AGRESSIVA COMPLETA");
      return true;
    } catch (error) {
      console.error("❌ Erro na invalidação agressiva:", error);
      return false;
    }
  };
  
  const runAutoComplete = async () => {
    if (isRunning) {
      console.log("⚠️ Auto-complete já está executando, pulando execução");
      return { success: false, updated: 0 };
    }
    
    setIsRunning(true);
    const startTime = new Date();
    
    try {
      console.log("🚀 INICIANDO AUTO-COMPLETE COM INVALIDAÇÃO AGRESSIVA");
      console.log("🕐 Timestamp de início:", startTime.toISOString());
      
      // Tentar primeiro via RPC
      let result = await runRpcAutoComplete();
      
      // Se falhar, tentar via Edge Function como fallback
      if (!result.success) {
        console.log("⚠️ RPC falhou, tentando via Edge Function...");
        result = await runEdgeFunctionAutoComplete();
      }
      
      setLastRunTime(new Date());
      setLastUpdateCount(result.updated);
      
      // SEMPRE invalidar cache, independente de atualizações
      console.log("🔄 Executando invalidação completa do cache...");
      await forceCompleteInvalidation();
      
      // Se algum agendamento foi atualizado, mostrar notificação
      if (result.updated > 0) {
        console.log(`✅ ${result.updated} agendamentos foram automaticamente concluídos.`);
        
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

  // Função para verificação manual imediata com feedback visual
  const runImmediateCheck = async () => {
    console.log("🚀 VERIFICAÇÃO MANUAL IMEDIATA SOLICITADA");
    const result = await runAutoComplete();
    
    // Feedback visual adicional para verificação manual
    if (result.success) {
      toast({
        title: "Verificação completa",
        description: `Verificação manual concluída. ${result.updated} agendamentos atualizados.`,
        duration: 3000
      });
    }
    
    return result;
  };

  // Executar ao montar o componente e periodicamente a cada 2 minutos
  useEffect(() => {
    console.log("🎬 useAutoCompleteAppointments hook montado - configurando timers");
    
    // Executar imediatamente quando o componente montar
    const initialTimer = setTimeout(() => {
      console.log("🏃‍♂️ Executando primeira verificação após mount...");
      runAutoComplete();
    }, 2000); // 2 segundos após mount para garantir que tudo esteja carregado
    
    // E então a cada 2 minutos
    const interval = setInterval(() => {
      console.log("⏰ Executando verificação periódica automática...");
      runAutoComplete();
    }, 2 * 60 * 1000); // 2 minutos
    
    return () => {
      console.log("🧹 Limpando timers do useAutoCompleteAppointments");
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);
  
  return { 
    runAutoComplete, 
    runImmediateCheck,
    forceCompleteInvalidation,
    isRunning, 
    lastRunTime,
    lastUpdateCount
  };
}

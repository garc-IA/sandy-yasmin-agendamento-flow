
import { useState, useEffect } from "react";
import { useAutoCompleteAppointments } from "@/hooks/appointment/useAutoCompleteAppointments";
import { useQueryClient } from "@tanstack/react-query";

export function useAppointmentAutoComplete(onAppointmentUpdated: () => void) {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const queryClient = useQueryClient();
  const { 
    runAutoComplete, 
    runImmediateCheck,
    forceCompleteInvalidation,
    isRunning, 
    lastRunTime,
    lastUpdateCount 
  } = useAutoCompleteAppointments();

  // Execute auto-complete when component mounts
  useEffect(() => {
    console.log("🔍 AppointmentList mounted - executing auto-complete with enhanced invalidation");
    const timer = setTimeout(async () => {
      const result = await runAutoComplete();
      if (result.updated > 0) {
        // Forçar invalidação adicional se houve atualizações
        await forceCompleteInvalidation();
        setTimeout(() => onAppointmentUpdated(), 300);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check again when appointments change significantly
  useEffect(() => {
    if (needsRefresh) {
      console.log("🔁 Detected change in appointments list - checking auto-complete with enhanced sync");
      setNeedsRefresh(false);
      
      const executeRefresh = async () => {
        const result = await runAutoComplete();
        await forceCompleteInvalidation();
        setTimeout(() => onAppointmentUpdated(), 300);
      };
      
      executeRefresh();
    }
  }, [needsRefresh, onAppointmentUpdated, runAutoComplete, forceCompleteInvalidation]);

  const handleManualCheck = async () => {
    console.log("🚀 Manual check requested with enhanced invalidation");
    
    const result = await runImmediateCheck();
    
    // Sempre invalidar cache após verificação manual
    await forceCompleteInvalidation();
    
    // Forçar refresh dos dados
    await queryClient.refetchQueries({
      predicate: query => {
        const queryKey = Array.isArray(query.queryKey) ? query.queryKey : [];
        return queryKey.some(key => 
          typeof key === 'string' && 
          (key.includes('appointment') || key.includes('agendamento'))
        );
      }
    });
    
    setNeedsRefresh(true);
    setTimeout(() => onAppointmentUpdated(), 500);
    
    return result;
  };

  const markNeedsRefresh = () => {
    setNeedsRefresh(true);
  };

  return {
    isRunning,
    lastRunTime,
    lastUpdateCount,
    handleManualCheck,
    markNeedsRefresh
  };
}

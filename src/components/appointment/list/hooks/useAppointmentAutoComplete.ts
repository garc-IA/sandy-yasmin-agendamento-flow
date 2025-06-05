
import { useState, useEffect } from "react";
import { useAutoCompleteAppointments } from "@/hooks/appointment/useAutoCompleteAppointments";

export function useAppointmentAutoComplete(onAppointmentUpdated: () => void) {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const { 
    runManualCheck,
    isRunning, 
    lastRunTime,
    lastUpdateCount 
  } = useAutoCompleteAppointments();

  // Refresh quando necessário
  useEffect(() => {
    if (needsRefresh) {
      setNeedsRefresh(false);
      setTimeout(() => onAppointmentUpdated(), 100);
    }
  }, [needsRefresh, onAppointmentUpdated]);

  const handleManualCheck = async () => {
    const result = await runManualCheck();
    setNeedsRefresh(true);
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

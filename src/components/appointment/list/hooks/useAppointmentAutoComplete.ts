
import { useState, useEffect } from "react";
import { useAutoCompleteAppointments } from "@/hooks/appointment/useAutoCompleteAppointments";
import { useQueryClient } from "@tanstack/react-query";

export function useAppointmentAutoComplete(onAppointmentUpdated: () => void) {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const queryClient = useQueryClient();
  const { runAutoComplete, isRunning } = useAutoCompleteAppointments();

  // Execute auto-complete when component mounts
  useEffect(() => {
    console.log("🔍 AppointmentList mounted - executing auto-complete");
    const timer = setTimeout(() => {
      runAutoComplete().then(() => {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check again when appointments change significantly
  useEffect(() => {
    if (needsRefresh) {
      console.log("🔁 Detected change in appointments list - checking auto-complete");
      setNeedsRefresh(false);
      runAutoComplete().then(() => {
        onAppointmentUpdated();
      });
    }
  }, [needsRefresh, onAppointmentUpdated, runAutoComplete]);

  const handleManualCheck = async () => {
    await runAutoComplete();
    setNeedsRefresh(true);
    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    onAppointmentUpdated();
  };

  const markNeedsRefresh = () => {
    setNeedsRefresh(true);
  };

  return {
    isRunning,
    handleManualCheck,
    markNeedsRefresh
  };
}

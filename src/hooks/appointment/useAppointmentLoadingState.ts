
import { useMemo } from "react";

interface UseAppointmentLoadingStateProps {
  isLoading: boolean;
  appointments: any[];
  error?: any;
}

export function useAppointmentLoadingState({ 
  isLoading, 
  appointments, 
  error 
}: UseAppointmentLoadingStateProps) {
  const loadingState = useMemo(() => {
    if (error) return 'error';
    if (isLoading) return 'loading';
    if (!appointments || appointments.length === 0) return 'empty';
    return 'loaded';
  }, [isLoading, appointments, error]);

  const shouldShowSkeleton = loadingState === 'loading';
  const shouldShowError = loadingState === 'error';
  const shouldShowEmpty = loadingState === 'empty';
  const shouldShowContent = loadingState === 'loaded';

  return {
    loadingState,
    shouldShowSkeleton,
    shouldShowError,
    shouldShowEmpty,
    shouldShowContent
  };
}

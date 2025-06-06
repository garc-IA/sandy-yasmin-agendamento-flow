
import { useAppointmentDetailsState } from "./dialog-state/useAppointmentDetailsState";
import { useStatusUpdateState } from "./dialog-state/useStatusUpdateState";
import { useCancelDialogState } from "./dialog-state/useCancelDialogState";
import { useRescheduleDialogState } from "./dialog-state/useRescheduleDialogState";
import { useDebugState } from "./dialog-state/useDebugState";
import { logAppointmentAction, logUIEvent, validateAppointmentId } from "@/utils/debugUtils";
import { AppointmentStatus } from "@/types/appointment.types";

/**
 * Hook that combines all dialog state hooks to manage appointment dialogs
 */
export function useAppointmentDialogsState(onAppointmentUpdated: () => void) {
  // Appointment details state
  const {
    selectedAppointment,
    setSelectedAppointment,
    showAppointmentDetails,
    closeAppointmentDetails
  } = useAppointmentDetailsState();

  // Status update state
  const {
    appointmentToUpdate,
    setAppointmentToUpdate,
    isLoading: isStatusUpdateLoading,
    handleUpdateStatus: baseHandleUpdateStatus
  } = useStatusUpdateState(onAppointmentUpdated);

  // Wrapper for handleUpdateStatus to ensure we have a valid appointment before updating
  const handleUpdateStatus = async (status: AppointmentStatus): Promise<boolean> => {
    if (!selectedAppointment?.id) {
      logUIEvent("Tentativa de atualizar status sem agendamento selecionado");
      return Promise.resolve(false);
    }
    
    // Set the appointment to update with the selected appointment ID
    setAppointmentToUpdate({ id: selectedAppointment.id, status });
    
    // After setting the appointmentToUpdate, execute the update
    return baseHandleUpdateStatus();
  };

  // Cancel dialog state
  const {
    appointmentToCancel,
    setAppointmentToCancel,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    cancelReason,
    setCancelReason,
    isLoading: isCancelLoading,
    openCancelDialog,
    closeCancelDialog,
    handleCancel
  } = useCancelDialogState(onAppointmentUpdated);

  // Reschedule dialog state
  const {
    isRescheduleDialogOpen,
    setIsRescheduleDialogOpen,
    isReschedulingLoading,
    handleReschedule: baseHandleReschedule
  } = useRescheduleDialogState(onAppointmentUpdated);

  // Wrapper for handleReschedule to provide the selectedAppointment
  const handleReschedule = async (date: Date, time: string): Promise<boolean> => {
    logUIEvent("Rescheduling appointment", selectedAppointment?.id || "unknown");
    
    if (!selectedAppointment?.id || !validateAppointmentId(selectedAppointment.id)) {
      logAppointmentAction("Tentativa de reagendamento com agendamento inválido", selectedAppointment?.id || "unknown");
      return Promise.resolve(false);
    }
    
    return baseHandleReschedule(selectedAppointment, date, time);
  };

  // Combined loading state
  const isLoading = isStatusUpdateLoading || isCancelLoading;

  // Debug state
  const state = {
    selectedAppointment: selectedAppointment?.id || null,
    appointmentToUpdate: appointmentToUpdate?.id || null,
    appointmentToCancel,
    isCancelDialogOpen,
    isRescheduleDialogOpen,
    cancelReason,
    isLoading,
    isReschedulingLoading
  };
  
  const { debugCurrentState } = useDebugState(state);

  return {
    // Details dialog
    selectedAppointment,
    setSelectedAppointment,
    showAppointmentDetails,
    closeAppointmentDetails,
    
    // Status update dialog
    appointmentToUpdate,
    setAppointmentToUpdate,
    
    // Cancel dialog
    appointmentToCancel,
    setAppointmentToCancel,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    cancelReason,
    setCancelReason,
    openCancelDialog,
    closeCancelDialog,
    
    // Reschedule dialog
    isRescheduleDialogOpen,
    setIsRescheduleDialogOpen,
    
    // Loading states
    isLoading,
    isReschedulingLoading,
    
    // Actions
    handleUpdateStatus,
    handleCancel,
    handleReschedule,
    
    // Debug
    debugCurrentState
  };
}

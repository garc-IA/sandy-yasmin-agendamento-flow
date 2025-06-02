
import { useAppointmentOperations } from "@/hooks/appointment/useAppointmentOperations";

export function useAppointmentActions(
  onAppointmentUpdated: () => void,
  markNeedsRefresh: () => void,
  closeDialogs: () => void
) {
  const { updateStatus, deleteAppointment, isLoading } = useAppointmentOperations();

  const handleConfirmAction = async (
    statusAction: { id: string; action: "complete" | "cancel" | "delete" | null; } | null,
    cancelReason: string
  ) => {
    if (!statusAction) return;
    
    const { id, action } = statusAction;
    
    try {
      let success = false;
      
      switch (action) {
        case "complete":
          success = await updateStatus(id, "concluido");
          break;
        case "cancel":
          success = await updateStatus(id, "cancelado", cancelReason);
          break;
        case "delete":
          success = await deleteAppointment(id);
          break;
      }
      
      if (success) {
        closeDialogs();
        markNeedsRefresh();
        
        setTimeout(() => {
          onAppointmentUpdated();
        }, 300);
      }
    } catch (error) {
      console.error("Error handling action:", error);
    }
  };

  const handleDialogClosed = (refreshData: boolean = false) => {
    if (refreshData && onAppointmentUpdated) {
      console.log("Refreshing appointments data after dialog action");
      markNeedsRefresh();
      
      setTimeout(() => {
        onAppointmentUpdated();
      }, 300);
    }
  };

  return {
    isLoading,
    handleConfirmAction,
    handleDialogClosed
  };
}

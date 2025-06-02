
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentDialog } from "../../AppointmentDialog";
import { StatusUpdateDialog } from "../../StatusUpdateDialog";

interface AppointmentDialogsProps {
  selectedAppointment: AppointmentWithDetails | null;
  isDetailsDialogOpen: boolean;
  isConfirmDialogOpen: boolean;
  statusAction: { id: string; action: "complete" | "cancel" | "delete" | null; } | null;
  cancelReason: string;
  isLoading: boolean;
  onDetailsClose: () => void;
  onConfirmDialogChange: (open: boolean) => void;
  onReasonChange: (reason: string) => void;
  onConfirmAction: () => void;
  onAppointmentUpdated: () => void;
}

export function AppointmentDialogs({
  selectedAppointment,
  isDetailsDialogOpen,
  isConfirmDialogOpen,
  statusAction,
  cancelReason,
  isLoading,
  onDetailsClose,
  onConfirmDialogChange,
  onReasonChange,
  onConfirmAction,
  onAppointmentUpdated
}: AppointmentDialogsProps) {
  return (
    <>
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDialog
          appointment={selectedAppointment}
          isOpen={isDetailsDialogOpen}
          onClose={onDetailsClose}
          onAppointmentUpdated={onAppointmentUpdated}
        />
      )}
      
      {/* Status Update Dialog */}
      <StatusUpdateDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={onConfirmDialogChange}
        action={statusAction?.action || null}
        reason={cancelReason}
        onReasonChange={onReasonChange}
        onConfirm={onConfirmAction}
        isLoading={isLoading}
      />
    </>
  );
}

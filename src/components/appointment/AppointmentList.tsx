
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useAppointmentGrouper } from "./list/AppointmentGrouper";
import { useAppointmentAutoComplete } from "./list/hooks/useAppointmentAutoComplete";
import { useAppointmentDialogs } from "./list/hooks/useAppointmentDialogs";
import { useAppointmentActions } from "./list/hooks/useAppointmentActions";
import { EmptyState } from "./list/components/EmptyState";
import { ManualCheckButton } from "./list/components/ManualCheckButton";
import { AppointmentSections } from "./list/components/AppointmentSections";
import { AppointmentDialogs } from "./list/components/AppointmentDialogs";

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  onAppointmentUpdated?: () => void;
  showAll?: boolean;
  statusFilter?: string;
}

export function AppointmentList({
  appointments,
  onAppointmentUpdated = () => {},
  showAll = false,
  statusFilter = "all"
}: AppointmentListProps) {
  // Auto-complete management
  const { isRunning, handleManualCheck, markNeedsRefresh } = useAppointmentAutoComplete(onAppointmentUpdated);
  
  // Dialog state management
  const {
    selectedAppointment,
    statusAction,
    isConfirmDialogOpen,
    isDetailsDialogOpen,
    cancelReason,
    setIsConfirmDialogOpen,
    setIsDetailsDialogOpen,
    setCancelReason,
    handleShowDetails,
    handleActionClick,
    closeDialogs
  } = useAppointmentDialogs();
  
  // Actions management
  const { isLoading, handleConfirmAction, handleDialogClosed } = useAppointmentActions(
    onAppointmentUpdated,
    markNeedsRefresh,
    closeDialogs
  );

  // Group appointments by status
  const { isEmpty } = useAppointmentGrouper({ appointments, showAll });

  // Handle confirmation of status update
  const onConfirmAction = async () => {
    await handleConfirmAction(statusAction, cancelReason);
  };

  // Handle details dialog close
  const onDetailsClose = () => {
    setIsDetailsDialogOpen(false);
    setSelectedAppointment(null);
  };

  // If no appointments, show empty state
  if (isEmpty) {
    return <EmptyState onManualCheck={handleManualCheck} isRunning={isRunning} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <ManualCheckButton onClick={handleManualCheck} isRunning={isRunning} />
      </div>
      
      <AppointmentSections
        appointments={appointments}
        showAll={showAll}
        statusFilter={statusFilter}
        onShowDetails={handleShowDetails}
        onActionClick={handleActionClick}
        isLoading={isLoading}
      />

      <AppointmentDialogs
        selectedAppointment={selectedAppointment}
        isDetailsDialogOpen={isDetailsDialogOpen}
        isConfirmDialogOpen={isConfirmDialogOpen}
        statusAction={statusAction}
        cancelReason={cancelReason}
        isLoading={isLoading}
        onDetailsClose={onDetailsClose}
        onConfirmDialogChange={setIsConfirmDialogOpen}
        onReasonChange={setCancelReason}
        onConfirmAction={onConfirmAction}
        onAppointmentUpdated={() => handleDialogClosed(true)}
      />
    </div>
  );
}

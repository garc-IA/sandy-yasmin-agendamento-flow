
import React from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useAppointmentGrouper } from "./list/AppointmentGrouper";
import { useAppointmentAutoComplete } from "./list/hooks/useAppointmentAutoComplete";
import { useAppointmentDialogs } from "./list/hooks/useAppointmentDialogs";
import { useAppointmentActions } from "./list/hooks/useAppointmentActions";
import { useAppointmentLoadingState } from "@/hooks/appointment/useAppointmentLoadingState";
import { EmptyState } from "./list/components/EmptyState";
import { ManualCheckButton } from "./list/components/ManualCheckButton";
import { AppointmentSections } from "./list/components/AppointmentSections";
import { AppointmentDialogs } from "./list/components/AppointmentDialogs";
import { AppointmentListSkeleton } from "./skeleton/AppointmentListSkeleton";

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  onAppointmentUpdated?: () => void;
  showAll?: boolean;
  statusFilter?: string;
}

function AppointmentListComponent({
  appointments,
  onAppointmentUpdated = () => {},
  showAll = false,
  statusFilter = "all"
}: AppointmentListProps) {
  // Auto-complete management
  const { isRunning, handleManualCheck, markNeedsRefresh } = useAppointmentAutoComplete(onAppointmentUpdated);
  
  // Dialog state management - now including setSelectedAppointment
  const {
    selectedAppointment,
    setSelectedAppointment,
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

  // Loading state management
  const { shouldShowSkeleton, shouldShowEmpty, shouldShowContent } = useAppointmentLoadingState({
    isLoading: isRunning,
    appointments,
  });

  // Handle confirmation of status update
  const onConfirmAction = React.useCallback(async () => {
    await handleConfirmAction(statusAction, cancelReason);
  }, [handleConfirmAction, statusAction, cancelReason]);

  // Handle details dialog close
  const onDetailsClose = React.useCallback(() => {
    setIsDetailsDialogOpen(false);
    setSelectedAppointment(null);
  }, [setIsDetailsDialogOpen, setSelectedAppointment]);

  // Show skeleton while running auto-complete
  if (shouldShowSkeleton) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end mb-4">
          <ManualCheckButton onClick={handleManualCheck} isRunning={isRunning} />
        </div>
        <AppointmentListSkeleton count={5} />
      </div>
    );
  }

  // If no appointments, show empty state
  if (shouldShowEmpty || isEmpty) {
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

export const AppointmentList = React.memo(AppointmentListComponent);

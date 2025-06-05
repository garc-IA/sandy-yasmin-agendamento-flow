
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";

export function useAdminAppointmentDialogs() {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSelectAppointment = (appointment: AppointmentWithDetails) => {
    console.log("👆 Selected appointment:", appointment.id, appointment.status);
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const closeAllDialogs = () => {
    setShowDetailsDialog(false);
    setShowCancelDialog(false);
    setShowRescheduleDialog(false);
    setShowDeleteDialog(false);
    setSelectedAppointment(null);
  };

  return {
    // State
    selectedAppointment,
    showDetailsDialog,
    showCancelDialog,
    showRescheduleDialog,
    showDeleteDialog,
    
    // Actions
    setSelectedAppointment,
    setShowDetailsDialog,
    setShowCancelDialog,
    setShowRescheduleDialog,
    setShowDeleteDialog,
    handleSelectAppointment,
    closeAllDialogs,
  };
}

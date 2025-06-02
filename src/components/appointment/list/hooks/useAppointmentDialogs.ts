
import { useState } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";

export function useAppointmentDialogs() {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [statusAction, setStatusAction] = useState<{ 
    id: string; 
    action: "complete" | "cancel" | "delete" | null;
  } | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleShowDetails = (appointment: AppointmentWithDetails) => {
    console.log("Opening details for appointment:", appointment.id);
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleActionClick = (appointmentId: string, action: "complete" | "cancel" | "delete") => {
    setStatusAction({ id: appointmentId, action });
    setIsConfirmDialogOpen(true);
  };

  const closeDialogs = () => {
    setIsConfirmDialogOpen(false);
    setIsDetailsDialogOpen(false);
    setSelectedAppointment(null);
    setStatusAction(null);
    setCancelReason('');
  };

  return {
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
  };
}

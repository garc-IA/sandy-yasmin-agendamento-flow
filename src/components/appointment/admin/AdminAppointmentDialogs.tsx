
import { useState } from "react";
import { useAppointmentActions } from "@/hooks/appointment/useAppointmentActions";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { DetailsDialog } from "./dialogs/DetailsDialog";
import { CancelDialog } from "./dialogs/CancelDialog";
import { RescheduleDialog } from "./dialogs/RescheduleDialog";
import { DeleteDialog } from "./dialogs/DeleteDialog";

interface AdminAppointmentDialogsProps {
  appointment: AppointmentWithDetails | null;
  showDetailsDialog: boolean;
  setShowDetailsDialog: (value: boolean) => void;
  showCancelDialog: boolean;
  setShowCancelDialog: (value: boolean) => void;
  showRescheduleDialog: boolean;
  setShowRescheduleDialog: (value: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (value: boolean) => void;
  onAppointmentUpdated: () => void;
}

export function AdminAppointmentDialogs({
  appointment,
  showDetailsDialog,
  setShowDetailsDialog,
  showCancelDialog,
  setShowCancelDialog,
  showRescheduleDialog,
  setShowRescheduleDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  onAppointmentUpdated,
}: AdminAppointmentDialogsProps) {
  const [cancelReason, setCancelReason] = useState("");
  const { isLoading, completeAppointment, cancelAppointment, rescheduleAppointment, deleteAppointment } = useAppointmentActions();

  const handleCompleteAppointment = async () => {
    if (!appointment) return;
    
    const success = await completeAppointment(appointment.id);
    if (success) {
      // Clone e modifique o appointment para refletir a mudança imediatamente na UI
      const updatedAppointment = {
        ...appointment,
        status: "concluido" as const
      };
      
      // Fechar o diálogo e forçar atualização dos dados
      setShowDetailsDialog(false);
      
      // Permitir que a UI seja atualizada antes de chamar onAppointmentUpdated
      setTimeout(() => {
        onAppointmentUpdated();
      }, 100);
    }
  };

  const handleCancelAppointment = async (reason: string) => {
    if (!appointment) return;
    
    const success = await cancelAppointment(appointment.id, reason);
    if (success) {
      // Fechar diálogos e forçar atualização dos dados
      setShowCancelDialog(false);
      setShowDetailsDialog(false);
      
      // Permitir que a UI seja atualizada antes de chamar onAppointmentUpdated
      setTimeout(() => {
        onAppointmentUpdated();
      }, 100);
    }
  };

  const handleRescheduleAppointment = async (date: string, time: string) => {
    if (!appointment) return;
    
    const success = await rescheduleAppointment(appointment.id, date, time);
    
    if (success) {
      // Fechar diálogos e forçar atualização dos dados
      setShowRescheduleDialog(false);
      setShowDetailsDialog(false);
      
      // Permitir que a UI seja atualizada antes de chamar onAppointmentUpdated
      setTimeout(() => {
        onAppointmentUpdated();
      }, 100);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!appointment) return;
    
    const success = await deleteAppointment(appointment.id);
    if (success) {
      // Fechar diálogos e forçar atualização dos dados
      setShowDeleteDialog(false);
      setShowDetailsDialog(false);
      
      // Permitir que a UI seja atualizada antes de chamar onAppointmentUpdated
      setTimeout(() => {
        onAppointmentUpdated();
      }, 100);
    }
  };

  return (
    <>
      {/* Details Dialog */}
      <DetailsDialog 
        appointment={appointment}
        showDialog={showDetailsDialog}
        setShowDialog={setShowDetailsDialog}
        onReschedule={() => setShowRescheduleDialog(true)}
        onCancel={() => setShowCancelDialog(true)}
        onComplete={handleCompleteAppointment}
        onDelete={() => setShowDeleteDialog(true)}
        isLoading={isLoading}
      />

      {/* Cancel Dialog */}
      <CancelDialog
        showDialog={showCancelDialog}
        setShowDialog={setShowCancelDialog}
        onCancel={handleCancelAppointment}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        isLoading={isLoading}
      />

      {/* Reschedule Dialog */}
      <RescheduleDialog
        showDialog={showRescheduleDialog}
        setShowDialog={setShowRescheduleDialog}
        onReschedule={handleRescheduleAppointment}
        isLoading={isLoading}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        showDialog={showDeleteDialog}
        setShowDialog={setShowDeleteDialog}
        onDelete={handleDeleteAppointment}
        isLoading={isLoading}
      />
    </>
  );
}

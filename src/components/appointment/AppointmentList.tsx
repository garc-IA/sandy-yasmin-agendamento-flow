
import { useState, useEffect } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentStatusSection } from "./list/AppointmentStatusSection";
import { AppointmentDialog } from "./AppointmentDialog";
import { StatusUpdateDialog } from "./StatusUpdateDialog";
import { useAppointmentGrouper } from "./list/AppointmentGrouper";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { useAutoCompleteAppointments } from "@/hooks/appointment/useAutoCompleteAppointments";

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
  // Local state for dialogs
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [statusAction, setStatusAction] = useState<{ 
    id: string; 
    action: "complete" | "cancel" | "delete" | null;
  } | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Status update hook
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();
  const { toast } = useToast();
  
  // Auto-complete hook para verificar agendamentos passados
  const { runAutoComplete } = useAutoCompleteAppointments();
  
  // Executar auto-complete quando o componente montar
  useEffect(() => {
    runAutoComplete();
  }, []);

  // Group appointments by status
  const { groupedAppointments, isEmpty } = useAppointmentGrouper({ 
    appointments, 
    showAll 
  });

  // Helper function to determine if a section should be shown based on the status filter
  const shouldShowSection = (sectionStatus: string): boolean => {
    // If the status filter is set to "all", show all sections
    if (statusFilter === "all") {
      return true;
    }
    // Otherwise, only show the section if it matches the selected filter
    return sectionStatus === statusFilter;
  };

  // Handlers for opening dialogs
  const handleShowDetails = (appointment: AppointmentWithDetails) => {
    console.log("Opening details for appointment:", appointment.id);
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleActionClick = (appointmentId: string, action: "complete" | "cancel" | "delete") => {
    setStatusAction({ id: appointmentId, action });
    setIsConfirmDialogOpen(true);
  };

  // Handle confirmation of status update
  const handleConfirmAction = async () => {
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
        // Close dialog and refresh data
        setIsConfirmDialogOpen(false);
        setStatusAction(null);
        setCancelReason('');
        
        // Adicionar um pequeno atraso para garantir que o estado visual seja atualizado
        setTimeout(() => {
          onAppointmentUpdated();
        }, 100);
      }
    } catch (error) {
      console.error("Error handling action:", error);
    }
  };

  // When any dialog closes and needs to refresh data
  const handleDialogClosed = (refreshData: boolean = false) => {
    if (refreshData && onAppointmentUpdated) {
      console.log("Refreshing appointments data after dialog action");
      
      // Adicionar um pequeno atraso para garantir que o estado visual seja atualizado
      setTimeout(() => {
        onAppointmentUpdated();
      }, 100);
    }
  };

  // If no appointments, show empty state
  if (isEmpty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Appointments - only show if filter is "all" or "agendado" */}
      {shouldShowSection("agendado") && (
        <AppointmentStatusSection
          title="Agendamentos Ativos"
          titleClassName="text-blue-800"
          appointments={groupedAppointments.agendado}
          onShowDetails={handleShowDetails}
          onActionClick={handleActionClick}
          isLoading={isLoading}
        />
      )}
      
      {/* Completed Appointments - only show if filter is "all" or "concluido" */}
      {shouldShowSection("concluido") && (
        <AppointmentStatusSection
          title="Agendamentos Concluídos"
          titleClassName="text-green-800"
          appointments={groupedAppointments.concluido}
          onShowDetails={handleShowDetails}
          onActionClick={handleActionClick}
          isLoading={isLoading}
          hideActions={statusFilter !== "concluido"}
        />
      )}
      
      {/* Canceled Appointments - only show if filter is "all" or "cancelado" */}
      {shouldShowSection("cancelado") && (
        <AppointmentStatusSection
          title="Agendamentos Cancelados"
          titleClassName="text-red-800"
          appointments={groupedAppointments.cancelado}
          onShowDetails={handleShowDetails}
          onActionClick={handleActionClick}
          isLoading={isLoading}
          hideActions={statusFilter !== "cancelado"}
        />
      )}

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDialog
          appointment={selectedAppointment}
          isOpen={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedAppointment(null);
          }}
          onAppointmentUpdated={() => handleDialogClosed(true)}
        />
      )}
      
      {/* Status Update Dialog */}
      <StatusUpdateDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        action={statusAction?.action || null}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleConfirmAction}
        isLoading={isLoading}
      />
    </div>
  );
}

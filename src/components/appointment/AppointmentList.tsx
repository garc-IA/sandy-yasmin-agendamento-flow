import { useState, useEffect } from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentStatusSection } from "./list/AppointmentStatusSection";
import { AppointmentDialog } from "./AppointmentDialog";
import { StatusUpdateDialog } from "./StatusUpdateDialog";
import { useAppointmentGrouper } from "./list/AppointmentGrouper";
import { useUpdateAppointmentStatus } from "@/hooks/useUpdateAppointmentStatus";
import { useToast } from "@/hooks/use-toast";
import { useAutoCompleteAppointments } from "@/hooks/appointment/useAutoCompleteAppointments";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

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
  const [needsRefresh, setNeedsRefresh] = useState(false);
  
  // Status update hook
  const { updateStatus, deleteAppointment, isLoading } = useUpdateAppointmentStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Auto-complete hook para verificar agendamentos passados
  const { runAutoComplete, isRunning } = useAutoCompleteAppointments();
  
  // Executar auto-complete quando o componente montar
  useEffect(() => {
    console.log("🔍 AppointmentList montado - executando auto-complete");
    // Pequeno atraso para garantir que todos os componentes estejam montados
    const timer = setTimeout(() => {
      runAutoComplete().then(() => {
        // Se houve atualização, forçar um refetch
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Verificar novamente quando appointments mudar significativamente
  useEffect(() => {
    // Apenas verificar se appointments está definido e mudou de vazio/não-vazio
    if (appointments && needsRefresh) {
      console.log("🔁 Detectada mudança na lista de agendamentos - verificando auto-complete");
      setNeedsRefresh(false);
      runAutoComplete().then(() => {
        onAppointmentUpdated();
      });
    }
  }, [needsRefresh]);

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

  // Função para forçar verificação manual
  const handleManualCheck = async () => {
    await runAutoComplete();
    // Marcar que precisa de atualização
    setNeedsRefresh(true);
    // Forçar refresh
    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    onAppointmentUpdated();
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
        
        // Marcar que precisa de atualização
        setNeedsRefresh(true);
        
        // Adicionar um pequeno atraso para garantir que o estado visual seja atualizado
        setTimeout(() => {
          onAppointmentUpdated();
        }, 300);
      }
    } catch (error) {
      console.error("Error handling action:", error);
    }
  };

  // When any dialog closes and needs to refresh data
  const handleDialogClosed = (refreshData: boolean = false) => {
    if (refreshData && onAppointmentUpdated) {
      console.log("Refreshing appointments data after dialog action");
      
      // Marcar que precisa de atualização
      setNeedsRefresh(true);
      
      // Adicionar um pequeno atraso para garantir que o estado visual seja atualizado
      setTimeout(() => {
        onAppointmentUpdated();
      }, 300);
    }
  };

  // If no appointments, show empty state
  if (isEmpty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum agendamento encontrado.</p>
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleManualCheck}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Agendamentos Antigos
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleManualCheck}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Agendamentos Antigos
            </>
          )}
        </Button>
      </div>
      
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

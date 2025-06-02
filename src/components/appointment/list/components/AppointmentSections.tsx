
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentStatusSection } from "../AppointmentStatusSection";
import { useAppointmentGrouper } from "../AppointmentGrouper";

interface AppointmentSectionsProps {
  appointments: AppointmentWithDetails[];
  showAll: boolean;
  statusFilter: string;
  onShowDetails: (appointment: AppointmentWithDetails) => void;
  onActionClick: (appointmentId: string, action: "complete" | "cancel" | "delete") => void;
  isLoading: boolean;
}

export function AppointmentSections({
  appointments,
  showAll,
  statusFilter,
  onShowDetails,
  onActionClick,
  isLoading
}: AppointmentSectionsProps) {
  const { groupedAppointments } = useAppointmentGrouper({ appointments, showAll });

  // Helper function to determine if a section should be shown based on the status filter
  const shouldShowSection = (sectionStatus: string): boolean => {
    if (statusFilter === "all") {
      return true;
    }
    return sectionStatus === statusFilter;
  };

  return (
    <div className="space-y-6">
      {/* Active Appointments - only show if filter is "all" or "agendado" */}
      {shouldShowSection("agendado") && (
        <AppointmentStatusSection
          title="Agendamentos Ativos"
          titleClassName="text-blue-800"
          appointments={groupedAppointments.agendado}
          onShowDetails={onShowDetails}
          onActionClick={onActionClick}
          isLoading={isLoading}
        />
      )}
      
      {/* Completed Appointments - only show if filter is "all" or "concluido" */}
      {shouldShowSection("concluido") && (
        <AppointmentStatusSection
          title="Agendamentos Concluídos"
          titleClassName="text-green-800"
          appointments={groupedAppointments.concluido}
          onShowDetails={onShowDetails}
          onActionClick={onActionClick}
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
          onShowDetails={onShowDetails}
          onActionClick={onActionClick}
          isLoading={isLoading}
          hideActions={statusFilter !== "cancelado"}
        />
      )}
    </div>
  );
}

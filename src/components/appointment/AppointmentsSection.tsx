
import React from "react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentCard } from "./AppointmentCard";

interface AppointmentsSectionProps {
  title: string;
  titleClassName: string;
  appointments: AppointmentWithDetails[];
  onShowDetails: (appointment: AppointmentWithDetails) => void;
  onActionClick: (appointmentId: string, action: "complete" | "cancel" | "delete") => void;
  isLoading: boolean;
  hideActions?: boolean;
}

function AppointmentsSectionComponent({
  title,
  titleClassName,
  appointments,
  onShowDetails,
  onActionClick,
  isLoading,
  hideActions = false
}: AppointmentsSectionProps) {
  // Se não houver agendamentos, não renderizar a seção
  if (!appointments || appointments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className={`text-lg font-medium transition-all duration-300 hover:text-primary ${titleClassName}`}>{title}</h3>
      <div className="space-y-3">
        {appointments.map((appointment, index) => (
          <div 
            key={appointment.id}
            style={{ 
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
            className="animate-fade-in"
          >
            <AppointmentCard
              appointment={appointment}
              onShowDetails={onShowDetails}
              onActionClick={onActionClick}
              isLoading={isLoading}
              hideActions={hideActions}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const AppointmentsSection = React.memo(AppointmentsSectionComponent);

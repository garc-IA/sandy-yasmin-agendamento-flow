
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { QuickActions } from "./QuickActions";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Scissors } from "lucide-react";

interface AppointmentCardProps {
  appointment: AppointmentWithDetails;
  onShowDetails: (appointment: AppointmentWithDetails) => void;
  onActionClick: (appointmentId: string, action: "complete" | "cancel" | "delete") => void;
  isLoading?: boolean;
  hideActions?: boolean;
  onReschedule?: (appointment: AppointmentWithDetails) => void;
}

function AppointmentCardComponent({
  appointment,
  onShowDetails,
  onActionClick,
  isLoading = false,
  hideActions = false,
  onReschedule
}: AppointmentCardProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      "agendado": "default",
      "concluido": "secondary", 
      "cancelado": "destructive"
    } as const;
    
    const labels = {
      "agendado": "Agendado",
      "concluido": "Concluído", 
      "cancelado": "Cancelado"
    };
    
    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "default"}
        className="transition-all duration-200 hover:scale-105"
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleReschedule = () => {
    if (onReschedule) {
      onReschedule(appointment);
    }
  };

  const handleComplete = () => {
    onActionClick(appointment.id, "complete");
  };

  const handleCancel = () => {
    onActionClick(appointment.id, "cancel");
  };

  const handleViewDetails = () => {
    onShowDetails(appointment);
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fade-in border-l-4 border-l-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header with client and status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg transition-colors duration-200 hover:text-primary">
                  {appointment.cliente.nome}
                </h3>
              </div>
              {getStatusBadge(appointment.status)}
            </div>
            
            {/* Service info */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scissors className="h-4 w-4" />
              <span className="font-medium">{appointment.servico.nome}</span>
              <span className="text-sm">
                • {appointment.servico.duracao_em_minutos}min
              </span>
            </div>
            
            {/* Date and time */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDate(appointment.data)} às {appointment.hora}</span>
            </div>
            
            {/* Professional */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Profissional:</span> {appointment.profissional.nome}
            </div>

            {/* Cancellation reason if present */}
            {appointment.motivo_cancelamento && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md animate-fade-in">
                <span className="font-medium">Motivo:</span> {appointment.motivo_cancelamento}
              </div>
            )}
          </div>

          {/* Actions */}
          {!hideActions && (
            <div className="flex sm:flex-col sm:justify-center">
              <QuickActions
                appointment={appointment}
                onReschedule={handleReschedule}
                onComplete={handleComplete}
                onCancel={handleCancel}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
                compact={true}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const AppointmentCard = React.memo(AppointmentCardComponent);

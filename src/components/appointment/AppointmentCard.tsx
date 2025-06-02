
import React from "react";
import { format, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  PhoneCall, 
  Loader2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { formatCurrency } from "@/lib/supabase";
import { isInPast } from "@/lib/dateUtils";

interface AppointmentCardProps {
  appointment: AppointmentWithDetails;
  onShowDetails: (appointment: AppointmentWithDetails) => void;
  onActionClick: (appointmentId: string, action: "complete" | "cancel" | "delete") => void;
  isLoading: boolean;
  hideActions?: boolean;
}

function AppointmentCardComponent({ 
  appointment, 
  onShowDetails, 
  onActionClick, 
  isLoading,
  hideActions = false
}: AppointmentCardProps) {
  const getStatusBadge = React.useMemo(() => {
    switch (appointment.status) {
      case "agendado":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 transition-all duration-200 hover:bg-blue-150">Agendado</Badge>;
      case "concluido":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 transition-all duration-200 hover:bg-green-150">Concluído</Badge>;
      case "cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 transition-all duration-200 hover:bg-red-150">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 transition-all duration-200 hover:bg-gray-150">{appointment.status}</Badge>;
    }
  }, [appointment.status]);

  const cardClassName = React.useMemo(() => {
    const baseClass = "p-4 border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] animate-fade-in";
    
    switch (appointment.status) {
      case "agendado":
        return `${baseClass} bg-white hover:bg-gray-50`;
      case "concluido":
        return `${baseClass} bg-green-50 border-green-200 hover:bg-green-100`;
      case "cancelado":
        return `${baseClass} bg-red-50 border-red-200 hover:bg-red-100`;
      default:
        return baseClass;
    }
  }, [appointment.status]);
  
  // Check if appointment is in the past and still marked as "agendado"
  const isPastAndPending = React.useMemo(() => 
    appointment.status === "agendado" && isInPast(appointment.data, appointment.hora),
    [appointment.status, appointment.data, appointment.hora]
  );

  const formattedDate = React.useMemo(() => {
    try {
      return isToday(parseISO(appointment.data)) ? "Hoje" : format(parseISO(appointment.data), "dd/MM/yyyy");
    } catch {
      return appointment.data;
    }
  }, [appointment.data]);

  const handleShowDetails = React.useCallback(() => {
    onShowDetails(appointment);
  }, [onShowDetails, appointment]);

  const handleCompleteClick = React.useCallback(() => {
    onActionClick(appointment.id, "complete");
  }, [onActionClick, appointment.id]);

  const handleCancelClick = React.useCallback(() => {
    onActionClick(appointment.id, "cancel");
  }, [onActionClick, appointment.id]);

  return (
    <div className={cardClassName}>
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium transition-colors duration-200 hover:text-primary">{appointment.cliente.nome}</h3>
            {getStatusBadge}
          </div>
          
          <p className="text-sm text-muted-foreground flex items-center transition-colors duration-200 hover:text-foreground">
            <PhoneCall className="h-3.5 w-3.5 inline mr-1" />
            {appointment.cliente.telefone}
          </p>
          
          <div className="mt-2">
            <p className="font-medium transition-colors duration-200 hover:text-primary">{appointment.servico.nome}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(appointment.servico.valor)} • {appointment.servico.duracao_em_minutos} minutos
            </p>
          </div>
          
          {appointment.status === "cancelado" && appointment.motivo_cancelamento && (
            <div className="mt-2 text-red-700 text-sm animate-fade-in">
              <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
              Motivo: {appointment.motivo_cancelamento}
            </div>
          )}
          
          {isPastAndPending && (
            <div className="mt-2 text-amber-600 text-sm font-medium animate-pulse">
              ⚠️ Agendamento no passado - necessita atualização
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-0 text-right">
          <div className="space-y-1">
            <p className="text-sm transition-colors duration-200 hover:text-foreground">{formattedDate}</p>
            <p className="text-lg font-bold transition-all duration-200 hover:text-primary hover:scale-105">{appointment.hora}</p>
            <p className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground">Com {appointment.profissional.nome}</p>
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            {!hideActions && appointment.status === "agendado" && !isLoading && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className={`text-green-600 border-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700 transition-all duration-200 hover:scale-105 ${isPastAndPending ? 'animate-pulse' : ''}`}
                  onClick={handleCompleteClick}
                >
                  <CheckCircle className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:scale-110" />
                  Concluir
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 hover:text-red-700 transition-all duration-200 hover:scale-105"
                  onClick={handleCancelClick}
                >
                  <XCircle className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:scale-110" />
                  Cancelar
                </Button>
              </>
            )}

            {isLoading && (
              <Button size="sm" variant="outline" disabled className="animate-pulse">
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Atualizando...
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleShowDetails}
              className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
            >
              Detalhes <ArrowRight className="h-3 w-3 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const AppointmentCard = React.memo(AppointmentCardComponent);

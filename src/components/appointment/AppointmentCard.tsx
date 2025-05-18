
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

export function AppointmentCard({ 
  appointment, 
  onShowDetails, 
  onActionClick, 
  isLoading,
  hideActions = false
}: AppointmentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Agendado</Badge>;
      case "concluido":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Concluído</Badge>;
      case "cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const getCardClassName = () => {
    const baseClass = "p-4 border rounded-lg shadow-sm transition-all";
    
    switch (appointment.status) {
      case "agendado":
        return `${baseClass} bg-white hover:bg-gray-50`;
      case "concluido":
        return `${baseClass} bg-green-50 border-green-200`;
      case "cancelado":
        return `${baseClass} bg-red-50 border-red-200`;
      default:
        return baseClass;
    }
  };
  
  // Check if appointment is in the past and still marked as "agendado"
  const isPastAndPending = appointment.status === "agendado" && 
    isInPast(appointment.data, appointment.hora);

  return (
    <div className={getCardClassName()}>
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium">{appointment.cliente.nome}</h3>
            {getStatusBadge(appointment.status)}
          </div>
          
          <p className="text-sm text-muted-foreground">
            <PhoneCall className="h-3.5 w-3.5 inline mr-1" />
            {appointment.cliente.telefone}
          </p>
          
          <div className="mt-2">
            <p className="font-medium">{appointment.servico.nome}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(appointment.servico.valor)} • {appointment.servico.duracao_em_minutos} minutos
            </p>
          </div>
          
          {appointment.status === "cancelado" && appointment.motivo_cancelamento && (
            <div className="mt-2 text-red-700 text-sm">
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
            <p className="text-sm">
              {isToday(parseISO(appointment.data)) ? "Hoje" : format(parseISO(appointment.data), "dd/MM/yyyy")}
            </p>
            <p className="text-lg font-bold">{appointment.hora}</p>
            <p className="text-xs text-muted-foreground">Com {appointment.profissional.nome}</p>
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            {!hideActions && appointment.status === "agendado" && !isLoading && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className={`text-green-600 border-green-600 hover:bg-green-50 ${isPastAndPending ? 'animate-pulse' : ''}`}
                  onClick={() => onActionClick(appointment.id, "complete")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Concluir
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => onActionClick(appointment.id, "cancel")}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </>
            )}

            {isLoading && (
              <Button size="sm" variant="outline" disabled>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Atualizando...
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onShowDetails(appointment)}
            >
              Detalhes <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Scissors, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { formatCurrency } from "@/lib/supabase";

interface AdminAppointmentCardProps {
  appointment: AppointmentWithDetails;
  onClick: () => void;
}

export function AdminAppointmentCard({ appointment, onClick }: AdminAppointmentCardProps) {
  const getStatusBadge = () => {
    switch (appointment.status) {
      case "agendado":
        return (
          <Badge 
            variant="outline" 
            className="bg-blue-100 text-blue-800 border-blue-200 transition-all duration-200 hover:bg-blue-150"
          >
            Agendado
          </Badge>
        );
      case "concluido":
        return (
          <Badge 
            variant="outline" 
            className="bg-green-100 text-green-800 border-green-200 transition-all duration-200 hover:bg-green-150"
          >
            Concluído
          </Badge>
        );
      case "cancelado":
        return (
          <Badge 
            variant="outline" 
            className="bg-red-100 text-red-800 border-red-200 transition-all duration-200 hover:bg-red-150"
          >
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge 
            variant="outline" 
            className="bg-gray-100 text-gray-800 border-gray-200 transition-all duration-200 hover:bg-gray-150"
          >
            {appointment.status}
          </Badge>
        );
    }
  };

  const formattedDate = format(parseISO(appointment.data), "dd/MM/yyyy");

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Header with client name and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
              <h3 className="font-medium transition-colors duration-200 group-hover:text-primary">
                {appointment.cliente.nome}
              </h3>
            </div>
            {getStatusBadge()}
          </div>

          {/* Service and professional info */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 transition-colors duration-200 group-hover:text-foreground">
              <Scissors className="h-3.5 w-3.5" />
              <span>{appointment.servico.nome}</span>
            </div>
            <div className="flex items-center space-x-1 transition-colors duration-200 group-hover:text-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{appointment.profissional.nome}</span>
            </div>
          </div>

          {/* Date, time and contact */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formattedDate} às {appointment.hora}</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{appointment.cliente.telefone}</span>
              </div>
            </div>
            <div className="font-medium text-primary transition-all duration-200 group-hover:scale-105">
              {formatCurrency(appointment.servico.valor)}
            </div>
          </div>

          {/* Cancellation reason if applicable */}
          {appointment.status === "cancelado" && appointment.motivo_cancelamento && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded animate-fade-in">
              <strong>Motivo:</strong> {appointment.motivo_cancelamento}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

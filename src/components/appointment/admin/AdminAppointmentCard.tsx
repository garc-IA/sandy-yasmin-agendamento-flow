
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, User, Clock, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { formatCurrency } from "@/lib/currencyUtils";
import { isInPast } from "@/lib/dateUtils";

interface AdminAppointmentCardProps {
  appointment: AppointmentWithDetails;
  onClick: () => void;
}

export function AdminAppointmentCard({ appointment, onClick }: AdminAppointmentCardProps) {
  const statusColors = {
    agendado: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    concluido: "bg-green-100 text-green-800 hover:bg-green-200",
    cancelado: "bg-red-100 text-red-800 hover:bg-red-200",
  };
  
  const statusLabels = {
    agendado: "Agendado",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };

  const statusColor = statusColors[appointment.status as keyof typeof statusColors] || statusColors.agendado;
  const statusLabel = statusLabels[appointment.status as keyof typeof statusLabels] || "Agendado";
  
  // Check if appointment is in the past and still marked as "agendado"
  const isPastAndPending = appointment.status === "agendado" && 
    isInPast(appointment.data, appointment.hora);
    
  // Handle card click with immediate loading state update
  const handleCardClick = () => {
    console.log("Clicando em agendamento:", appointment.id, isPastAndPending ? "(agendamento passado)" : "");
    onClick();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow transition-shadow duration-200 cursor-pointer" 
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Time section */}
          <div className="bg-muted p-4 flex items-center justify-center md:w-24">
            <div className="text-center">
              <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
              <span className="block mt-1 text-xl font-semibold">{appointment.hora}</span>
            </div>
          </div>
          
          {/* Info section */}
          <div className="p-4 flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{appointment.cliente.nome}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.servico.nome}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(parseISO(appointment.data), "dd/MM/yyyy")} - {appointment.profissional.nome}
                  </span>
                </div>
                
                {isPastAndPending && (
                  <div className="text-amber-600 text-sm font-medium animate-pulse">
                    ⚠️ Agendamento no passado - necessita atualização
                  </div>
                )}
              </div>
              
              <div className="flex flex-col md:items-end gap-2 mt-2 md:mt-0">
                <Badge variant="secondary" className={statusColor}>
                  {statusLabel}
                </Badge>
                
                <div className="text-primary font-medium">
                  {formatCurrency(appointment.servico.valor)}
                </div>
                
                <Button 
                  size="sm" 
                  className={`md:self-stretch ${isPastAndPending ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                >
                  {isPastAndPending ? 'Atualizar Agora' : 'Gerenciar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

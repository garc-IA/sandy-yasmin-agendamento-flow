
import { CalendarIcon, Clock } from "lucide-react";

interface AppointmentDetailsSectionProps {
  data: string;
  hora: string;
  profissional?: string;
}

export function AppointmentDetailsSection({ 
  data, 
  hora, 
  profissional 
}: AppointmentDetailsSectionProps) {
  return (
    <div>
      <h3 className="font-medium mb-2">Detalhes do Horário</h3>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{data}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{hora}</span>
        </div>

        {profissional && (
          <div className="flex items-start">
            <span className="text-muted-foreground mr-2">Profissional:</span>
            <span className="text-sm">{profissional}</span>
          </div>
        )}
      </div>
    </div>
  );
}

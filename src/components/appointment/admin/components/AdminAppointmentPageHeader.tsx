
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminAppointmentPageHeaderProps {
  selectedDate: Date | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function AdminAppointmentPageHeader({
  selectedDate,
  isLoading,
  isRefreshing,
  onRefresh
}: AdminAppointmentPageHeaderProps) {
  const formattedDate = selectedDate 
    ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
    : "Selecione uma data";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
        <p className="text-muted-foreground mt-1">
          {formattedDate}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="h-9" 
          onClick={onRefresh} 
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing || isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CalendarIcon className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>
    </div>
  );
}

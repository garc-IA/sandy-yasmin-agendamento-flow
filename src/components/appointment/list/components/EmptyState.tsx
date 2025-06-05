
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualCheckButton } from "./ManualCheckButton";

interface EmptyStateProps {
  onManualCheck: () => Promise<any>;
  isRunning: boolean;
}

export function EmptyState({ onManualCheck, isRunning }: EmptyStateProps) {
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="animate-scale-in">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 transition-all duration-300 hover:text-primary hover:scale-110" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2 transition-colors duration-300 hover:text-foreground">
          Nenhum agendamento encontrado
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Não há agendamentos para os filtros selecionados.
        </p>
      </div>
      
      <div className="flex justify-center gap-3 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <ManualCheckButton onClick={onManualCheck} isRunning={isRunning} />
        <Button 
          variant="default" 
          size="sm"
          className="transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2 transition-transform duration-200 hover:scale-110" />
          Novo Agendamento
        </Button>
      </div>
    </div>
  );
}

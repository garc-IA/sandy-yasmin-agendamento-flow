
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualCheckButton } from "./ManualCheckButton";

interface EmptyStateProps {
  onManualCheck: () => Promise<any>;
  isRunning: boolean;
}

export function EmptyState({ onManualCheck, isRunning }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Nenhum agendamento encontrado
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Não há agendamentos para os filtros selecionados.
      </p>
      
      <div className="flex justify-center gap-3">
        <ManualCheckButton onClick={onManualCheck} isRunning={isRunning} />
        <Button variant="default" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>
    </div>
  );
}

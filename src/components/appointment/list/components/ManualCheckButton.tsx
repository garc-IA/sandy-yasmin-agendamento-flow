
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManualCheckButtonProps {
  onClick: () => Promise<any>;
  isRunning: boolean;
  lastRunTime?: Date | null;
  lastUpdateCount?: number;
}

export function ManualCheckButton({ 
  onClick, 
  isRunning, 
  lastRunTime, 
  lastUpdateCount = 0 
}: ManualCheckButtonProps) {
  const formatLastRun = (date: Date | null) => {
    if (!date) return "Nunca executado";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins === 1) return "1 minuto atrás";
    if (diffMins < 60) return `${diffMins} minutos atrás`;
    
    return date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onClick} 
        disabled={isRunning}
        className="transition-all duration-200 hover:scale-105"
      >
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar Agendamentos
          </>
        )}
      </Button>
      
      {lastRunTime && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Última verificação: {formatLastRun(lastRunTime)}</span>
          {lastUpdateCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              {lastUpdateCount} atualizados
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

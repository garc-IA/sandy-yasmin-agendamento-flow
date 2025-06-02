
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface ManualCheckButtonProps {
  onClick: () => void;
  isRunning: boolean;
}

export function ManualCheckButton({ onClick, isRunning }: ManualCheckButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClick}
      disabled={isRunning}
    >
      {isRunning ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Verificando...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Verificar Agendamentos Antigos
        </>
      )}
    </Button>
  );
}

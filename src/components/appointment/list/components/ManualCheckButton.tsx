
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle } from "lucide-react";

interface ManualCheckButtonProps {
  onClick: () => void;
  isRunning: boolean;
}

export function ManualCheckButton({ onClick, isRunning }: ManualCheckButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isRunning}
      variant="outline"
      size="sm"
      className="transition-all duration-300 hover:scale-105 hover:shadow-md"
    >
      {isRunning ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Verificando...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2 transition-transform duration-200 hover:scale-110" />
          Verificar Agendamentos
        </>
      )}
    </Button>
  );
}

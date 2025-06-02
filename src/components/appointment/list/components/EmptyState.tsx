
import { ManualCheckButton } from "./ManualCheckButton";

interface EmptyStateProps {
  onManualCheck: () => void;
  isRunning: boolean;
}

export function EmptyState({ onManualCheck, isRunning }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>Nenhum agendamento encontrado.</p>
      <div className="mt-4">
        <ManualCheckButton onClick={onManualCheck} isRunning={isRunning} />
      </div>
    </div>
  );
}

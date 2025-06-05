
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AppointmentHistory } from "../../AppointmentHistory";

interface HistorySidebarProps {
  appointmentId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistorySidebar({ 
  appointmentId, 
  isOpen, 
  onOpenChange 
}: HistorySidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Histórico do Agendamento</SheetTitle>
          <SheetDescription>
            Confira o histórico completo deste agendamento.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <AppointmentHistory appointmentId={appointmentId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

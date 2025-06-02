
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { DateSelector } from "@/components/shared/date-time/DateSelector";
import { TimeSelector } from "@/components/shared/date-time/TimeSelector";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseISO } from "date-fns";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface RescheduleFormProps {
  appointment: AppointmentWithDetails;
  onReschedule?: (date: Date, time: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function RescheduleForm({
  appointment,
  onReschedule,
  isLoading = false
}: RescheduleFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [availableTimesData, setAvailableTimesData] = useState<string[]>([]);

  // Parse the date string safely
  const parsedDate = (() => {
    try {
      // Try using parseISO for ISO format dates
      return parseISO(appointment.data);
    } catch (error) {
      console.error("Error parsing date with parseISO:", error);
      try {
        // Fallback to Date constructor
        return new Date(appointment.data);
      } catch (secondError) {
        console.error("Error parsing date with Date constructor:", secondError);
        // Ultimate fallback
        return new Date();
      }
    }
  })();

  const currentDateTime = `${format(parsedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${appointment.hora}`;
  const newDateTime = selectedDate && selectedTime 
    ? `${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${selectedTime}` 
    : "Selecione data e hora";

  const handleSubmit = async () => {
    if (selectedDate && selectedTime && onReschedule) {
      await onReschedule(selectedDate, selectedTime);
    }
  };

  // Function to disable past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <>
      <Alert className="bg-blue-50 border-blue-200 flex-none">
        <AlertDescription className="text-sm">
          <strong>Agendamento atual:</strong> {currentDateTime} com {appointment.profissional.nome}
        </AlertDescription>
      </Alert>

      <ScrollArea className="flex-grow pr-4 my-4 max-h-[50vh]">
        <div className="grid gap-4">
          <DateSelector
            date={selectedDate}
            onDateChange={setSelectedDate}
            disabledDates={isDateDisabled}
          />
          
          {selectedDate && (
            <TimeSelector
              professionalId={appointment.profissional.id}
              availableTimes={availableTimesData}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />
          )}
          
          <Separator />
          
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Observação (opcional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[80px] p-2 border rounded-md"
              placeholder="Motivo do reagendamento..."
            />
          </div>
        </div>
      </ScrollArea>

      {selectedDate && selectedTime && (
        <Alert className="bg-green-50 border-green-200 flex-none mt-2">
          <AlertDescription className="text-sm">
            <strong>Novo agendamento:</strong> {newDateTime} com {appointment.profissional.nome}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Button variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedDate || !selectedTime || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reagendando...
            </>
          ) : "Confirmar Reagendamento"}
        </Button>
      </div>
    </>
  );
}

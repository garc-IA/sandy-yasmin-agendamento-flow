
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateSelectorProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
}

export const DateSelector = ({
  date,
  onDateChange,
  disabledDates,
}: DateSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione a data:</CardTitle>
        <CardDescription>Escolha uma data disponível para o agendamento.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Label htmlFor="date">Data</Label>
        <div className="flex flex-col space-y-2">
          {date && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          )}
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={disabledDates}
            locale={ptBR}
            className="rounded-md border"
          />
        </div>
      </CardContent>
    </Card>
  );
};

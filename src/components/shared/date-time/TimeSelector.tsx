
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TimeSelectorProps {
  professionalId: string;
  availableTimes: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export const TimeSelector = ({
  professionalId,
  availableTimes,
  selectedTime,
  onTimeSelect,
}: TimeSelectorProps) => {
  if (!professionalId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selecione o horário:</CardTitle>
          <CardDescription>Primeiro selecione um profissional.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-4">
            Selecione um profissional para ver os horários disponíveis.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione o horário:</CardTitle>
        <CardDescription>Escolha um horário disponível.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Label>Horário</Label>
        {availableTimes.length === 0 ? (
          <div className="text-amber-600 py-2">
            Nenhum horário disponível para esta data e profissional.
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {availableTimes.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                className="h-10"
                onClick={() => onTimeSelect(time)}
              >
                <Clock className="h-4 w-4 mr-1" />
                {time}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

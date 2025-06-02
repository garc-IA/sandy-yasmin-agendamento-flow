
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/classnames";
import { Clock, AlertCircle } from "lucide-react";

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
  const getTimeGridColumns = () => {
    if (availableTimes.length <= 6) return "grid-cols-2";
    if (availableTimes.length <= 12) return "grid-cols-3";
    if (availableTimes.length <= 20) return "grid-cols-4";
    return "grid-cols-5";
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Selecione o horário desejado
        </CardTitle>
        <CardDescription>
          {!professionalId ? (
            "Selecione um profissional para ver os horários disponíveis."
          ) : availableTimes.length === 0 ? (
            "Nenhum horário disponível para este profissional nesta data."
          ) : (
            `${availableTimes.length} ${availableTimes.length === 1 ? 'horário disponível' : 'horários disponíveis'}`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!professionalId ? (
          <div className="flex items-center gap-2 text-amber-600 py-4 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <span>Selecione um profissional para ver os horários disponíveis.</span>
          </div>
        ) : availableTimes.length === 0 ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-full">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-amber-700">Nenhum horário disponível</p>
                <p className="text-sm text-amber-600">
                  Tente escolher outra data ou profissional
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Time slots grid */}
            <div className={cn("grid gap-2", getTimeGridColumns())}>
              {availableTimes.map((time, index) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={cn(
                    "h-12 w-full transition-all duration-200 animate-fade-in",
                    selectedTime === time 
                      ? "bg-primary text-primary-foreground shadow-md scale-105" 
                      : "hover:scale-105 hover:border-primary/50"
                  )}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                  onClick={() => onTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>

            {/* Selected time indicator */}
            {selectedTime && (
              <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-lg animate-fade-in">
                <Badge variant="default" className="px-3 py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {selectedTime} selecionado
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

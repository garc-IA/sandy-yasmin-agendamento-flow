
import { useState } from "react";
import { Service } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { DateSelector } from "@/components/shared/date-time/DateSelector";
import { ProfessionalSelector } from "@/components/shared/date-time/ProfessionalSelector";
import { TimeSelector } from "@/components/shared/date-time/TimeSelector";
import { useTimeSlots } from "@/components/shared/date-time/hooks/useTimeSlots";
import { useProfessionals } from "./hooks/useProfessionals";
import { useDateValidation } from "@/hooks/useDateValidation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface DateSelectionProps {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  professionalId: string | null;
  updateAppointmentData: (data: { 
    date?: Date | null; 
    time?: string | null; 
    professionalId?: string | null;
    professional_id?: string | null;
    professional_name?: string 
  }) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DateSelection = ({
  selectedService,
  selectedDate,
  selectedTime,
  professionalId,
  updateAppointmentData,
  nextStep,
  prevStep,
}: DateSelectionProps) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined);
  const [time, setTime] = useState<string>(selectedTime || "");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(professionalId || "");
  const [professionalName, setProfessionalName] = useState<string>("");
  
  const { toast } = useToast();

  // Fetch professionals for the selected date
  const { professionals, isLoading, error } = useProfessionals(date);
  
  // Find the selected professional
  const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId);
  
  // Use the enhanced date validation hook
  const dateValidation = useDateValidation(selectedProfessional);
  
  // Fetch appointments for the selected date and professional
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments-for-date', date ? format(date, 'yyyy-MM-dd') : null, selectedProfessionalId],
    queryFn: async () => {
      if (!date || !selectedProfessionalId) return [];
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('data', formattedDate)
        .eq('profissional_id', selectedProfessionalId)
        .neq('status', 'cancelado');
      
      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!date && !!selectedProfessionalId
  });
  
  // Generate available time slots
  const availableTimes = useTimeSlots({
    date,
    selectedService: selectedService!,
    professional: selectedProfessional,
    appointments
  });

  if (!selectedService) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          Por favor, selecione um serviço primeiro.
        </p>
        <Button onClick={prevStep}>Voltar para seleção de serviço</Button>
      </div>
    );
  }

  // Handle date selection
  const onDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      if (dateValidation.isHoliday(newDate)) {
        toast({
          title: "Data selecionada é um feriado",
          description: "O agendamento é permitido, mas verifique o funcionamento do estabelecimento nesta data.",
          variant: "default",
        });
      }
      
      if (dateValidation.isValidAppointmentDate(newDate)) {
        setDate(newDate);
        // Reset professional and time when date changes
        setSelectedProfessionalId("");
        setTime("");
        setProfessionalName("");
      }
    }
  };

  // Handle professional selection
  const onProfessionalSelect = (id: string) => {
    const professional = professionals.find(p => p.id === id);
    if (professional) {
      setSelectedProfessionalId(id);
      setProfessionalName(professional.nome);
      // Reset time when professional changes
      setTime("");
    }
  };

  // Handle time selection
  const onTimeSelect = (selectedTime: string) => {
    setTime(selectedTime);
  };

  // Handle continue
  const onContinue = () => {
    if (!date) {
      toast({
        title: "Data não selecionada",
        description: "Por favor, selecione uma data.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProfessionalId) {
      toast({
        title: "Profissional não selecionado",
        description: "Por favor, selecione um profissional.",
        variant: "destructive",
      });
      return;
    }

    if (!time) {
      toast({
        title: "Horário não selecionado",
        description: "Por favor, selecione um horário.",
        variant: "destructive",
      });
      return;
    }

    // Update appointment data with all necessary fields
    updateAppointmentData({
      date,
      time,
      professionalId: selectedProfessionalId,
      professional_id: selectedProfessionalId,
      professional_name: professionalName
    });

    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Escolha a data e horário
      </h2>

      <div className="space-y-6">
        <DateSelector 
          date={date} 
          onDateChange={onDateSelect}
          disabledDates={(date) => dateValidation.isDateDisabled(date)}
        />
        
        {dateValidation.error && (
          <div className="text-destructive text-sm">
            {dateValidation.error}
          </div>
        )}
        
        <ProfessionalSelector
          isLoading={isLoading}
          error={error}
          professionals={professionals}
          selectedProfessionalId={selectedProfessionalId}
          onProfessionalSelect={onProfessionalSelect}
        />

        <TimeSelector
          professionalId={selectedProfessionalId}
          availableTimes={availableTimes}
          selectedTime={time}
          onTimeSelect={onTimeSelect}
        />

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            Voltar
          </Button>
          <Button onClick={onContinue}>Continuar</Button>
        </div>
      </div>
    </div>
  );
};

export default DateSelection;


import React, { useState, useEffect } from "react";
import { Service, Professional } from "@/types/appointment.types";
import { Button } from "@/components/ui/button";
import { DateSelector } from "@/components/shared/date-time/DateSelector";
import { ProfessionalSelector } from "@/components/shared/date-time/ProfessionalSelector";
import { TimeSelector } from "@/components/shared/date-time/TimeSelector";
import { useTimeSlots } from "@/components/shared/date-time/hooks/useTimeSlots";
import { useProfessionals } from "./hooks/useProfessionals";
import { useDateValidation } from "./hooks/useDateValidation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface DateSelectionProps {
  selectedService: Service;
  selectedDate: Date | null;
  selectedTime: string;
  updateAppointmentData: (data: {
    date?: Date;
    time?: string;
    professional?: Professional;
  }) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DateAndTimeSelector = ({
  selectedService,
  selectedDate,
  selectedTime,
  updateAppointmentData,
  nextStep,
  prevStep,
}: DateSelectionProps) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined);
  const [time, setTime] = useState<string>(selectedTime || "");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  const { professionals, isLoading, error } = useProfessionals(date);
  const { toast } = useToast();
  const { isDateDisabled, isHoliday, isValidAppointmentDate } = useDateValidation();

  // Fetch appointments for the selected date and professional
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments-for-date', date ? format(date, 'yyyy-MM-dd') : null, selectedProfessional?.id],
    queryFn: async () => {
      if (!date || !selectedProfessional) return [];
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('data', formattedDate)
        .eq('profissional_id', selectedProfessional.id)
        .neq('status', 'cancelado');
      
      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return [];
      }
      
      console.log(`📅 Agendamentos encontrados: ${data?.length || 0} para ${formattedDate}`);
      return data || [];
    },
    enabled: !!date && !!selectedProfessional
  });
  
  // Generate available time slots
  const availableTimes = useTimeSlots({
    date,
    selectedService,
    professional: selectedProfessional,
    appointments
  });

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && isValidAppointmentDate(newDate)) {
      console.log("📅 Data selecionada:", newDate);
      setDate(newDate);
      setSelectedProfessional(null);
      setTime("");
      
      updateAppointmentData({
        date: newDate,
        time: "",
        professional: undefined
      });

      if (isHoliday(newDate)) {
        toast({
          title: "Feriado selecionado",
          description: "Verifique o funcionamento do estabelecimento nesta data.",
          variant: "default",
        });
      }
    }
  };

  const handleProfessionalSelect = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    if (professional) {
      console.log("👨‍💼 Profissional selecionado:", professional);
      setSelectedProfessional(professional);
      setTime("");
      
      updateAppointmentData({
        date: date,
        time: "",
        professional: professional
      });
    }
  };

  const handleTimeSelect = (selectedTime: string) => {
    console.log("⏰ Horário selecionado:", selectedTime);
    setTime(selectedTime);
    
    updateAppointmentData({
      date: date,
      time: selectedTime,
      professional: selectedProfessional
    });
  };

  const handleContinue = () => {
    console.log("=== VALIDAÇÃO ANTES DE CONTINUAR ===");
    console.log("Data:", date);
    console.log("Profissional:", selectedProfessional);
    console.log("Horário:", time);

    if (!date) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data para o agendamento.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProfessional) {
      toast({
        title: "Profissional obrigatório",
        description: "Por favor, selecione um profissional.",
        variant: "destructive",
      });
      return;
    }

    if (!time) {
      toast({
        title: "Horário obrigatório",
        description: "Por favor, selecione um horário.",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Todos os dados validados, prosseguindo...");

    // Atualização final para garantir que todos os dados estão corretos
    updateAppointmentData({
      date: date,
      time: time,
      professional: selectedProfessional
    });

    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Data e Horário
      </h2>

      <div className="space-y-6">
        <DateSelector 
          date={date} 
          onDateChange={handleDateSelect}
          disabledDates={(date) => isDateDisabled(date)}
        />
        
        <ProfessionalSelector
          isLoading={isLoading}
          error={error}
          professionals={professionals}
          selectedProfessionalId={selectedProfessional?.id || ""}
          onProfessionalSelect={handleProfessionalSelect}
        />

        <TimeSelector
          professionalId={selectedProfessional?.id || ""}
          availableTimes={availableTimes}
          selectedTime={time}
          onTimeSelect={handleTimeSelect}
        />

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            Voltar
          </Button>
          <Button onClick={handleContinue}>Continuar</Button>
        </div>
      </div>
    </div>
  );
};

export default DateAndTimeSelector;


import React, { useState, useEffect } from "react";
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
  selectedService: Service;
  selectedDate: Date | null;
  selectedTime: string;
  updateAppointmentData: (data: any) => void;
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
  const [professionalId, setProfessionalId] = useState<string>("");
  const [professionalName, setProfessionalName] = useState<string>("");
  
  const { professionals, isLoading, error } = useProfessionals(date);
  const { toast } = useToast();

  // Find the selected professional
  const selectedProfessional = professionals.find(p => p.id === professionalId);
  
  // Use the enhanced date validation hook
  const dateValidation = useDateValidation(selectedProfessional);
  
  // Fetch appointments for the selected date and professional
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments-for-date', date ? format(date, 'yyyy-MM-dd') : null, professionalId],
    queryFn: async () => {
      if (!date || !professionalId) return [];
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('data', formattedDate)
        .eq('profissional_id', professionalId);
      
      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return [];
      }
      
      console.log(`Encontrados ${data?.length || 0} agendamentos para ${formattedDate} com o profissional ${professionalId}`);
      return data || [];
    },
    enabled: !!date && !!professionalId
  });
  
  // Generate available time slots
  const availableTimes = useTimeSlots({
    date,
    selectedService,
    professional: selectedProfessional,
    appointments
  });

  const handleDateSelect = (newDate: Date | undefined) => {
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
        // Clear professional and time when date changes
        setProfessionalId("");
        setProfessionalName("");
        setTime("");
        
        // Update parent component
        updateAppointmentData({
          date: newDate,
          time: "",
          professional_id: "",
          professional_name: ""
        });
      }
    }
  };

  const handleProfessionalSelect = (id: string) => {
    const professional = professionals.find(p => p.id === id);
    if (professional) {
      setProfessionalId(id);
      setProfessionalName(professional.nome);
      // Clear time when professional changes
      setTime("");
      
      console.log("Profissional selecionado:", { id, nome: professional.nome });
      
      // Update parent component
      updateAppointmentData({
        date: date,
        time: "",
        professional_id: id,
        professional_name: professional.nome
      });
    }
  };

  const handleTimeSelect = (selectedTime: string) => {
    setTime(selectedTime);
    
    console.log("Horário selecionado:", selectedTime);
    console.log("Dados completos:", {
      date,
      time: selectedTime,
      professional_id: professionalId,
      professional_name: professionalName
    });
    
    // Update parent component with complete data
    updateAppointmentData({
      date: date,
      time: selectedTime,
      professional_id: professionalId,
      professional_name: professionalName
    });
  };

  const handleContinue = () => {
    if (!date) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data para o agendamento.",
        variant: "destructive",
      });
      return false;
    }

    if (!professionalId) {
      toast({
        title: "Profissional obrigatório",
        description: "Por favor, selecione um profissional.",
        variant: "destructive",
      });
      return false;
    }

    if (!time) {
      toast({
        title: "Horário obrigatório",
        description: "Por favor, selecione um horário.",
        variant: "destructive",
      });
      return false;
    }

    console.log("Dados finais antes de continuar:", {
      date,
      time,
      professional_id: professionalId,
      professional_name: professionalName
    });

    // Final update to ensure parent has all data
    updateAppointmentData({
      date: date,
      time: time,
      professional_id: professionalId,
      professional_name: professionalName
    });

    nextStep();
    return true;
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
          selectedProfessionalId={professionalId}
          onProfessionalSelect={handleProfessionalSelect}
        />

        <TimeSelector
          professionalId={professionalId}
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

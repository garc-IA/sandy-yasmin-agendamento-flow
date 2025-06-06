
import { useState } from "react";
import { Client } from "@/lib/supabase";

interface Servico {
  id: string;
  nome: string;
  valor: number;
  duracao_em_minutos: number;
  descricao: string;
  created_at: string;
  ativo: boolean;
  categoria_id: string | null;
  imagem_url: string | null;
  admin_id: string | null;
}

interface Professional {
  id: string;
  nome: string;
}

export const useAppointmentState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [client, setClient] = useState<Client | null>(null);
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const resetState = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedProfessional(null);
    setSelectedDate(null);
    setSelectedTime("");
    setClient(null);
    setAppointmentId("");
    setIsComplete(false);
  };

  return {
    currentStep,
    setCurrentStep,
    selectedService,
    setSelectedService,
    selectedProfessional,
    setSelectedProfessional,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    client,
    setClient,
    appointmentId,
    setAppointmentId,
    isSubmitting,
    setIsSubmitting,
    isComplete,
    setIsComplete,
    resetState,
  };
};

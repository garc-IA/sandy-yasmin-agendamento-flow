
import { useState } from "react";
import { Service, Professional, Client } from "@/types/appointment.types";

export const useAppointmentState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const resetState = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedProfessional(null);
    setSelectedDate(null);
    setSelectedTime("");
    setClient(null);
    setAppointmentId(null);
    setIsSubmitting(false);
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

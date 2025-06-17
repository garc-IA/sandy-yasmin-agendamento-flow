
import { Service, Professional, Client } from "@/types/appointment.types";

interface UseAppointmentHandlersProps {
  setCurrentStep: (step: number) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedProfessional: (professional: Professional | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string) => void;
  setClient: (client: Client | null) => void;
  setAppointmentId: (id: string | null) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setIsComplete: (complete: boolean) => void;
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  selectedDate: Date | null;
  selectedTime: string;
  client: Client | null;
  currentStep: number;
}

export const useAppointmentHandlers = ({
  setCurrentStep,
  setSelectedService,
  setSelectedProfessional,
  setSelectedDate,
  setSelectedTime,
  setClient,
  setAppointmentId,
  setIsSubmitting,
  setIsComplete,
  selectedService,
  selectedProfessional,
  selectedDate,
  selectedTime,
  client,
  currentStep,
}: UseAppointmentHandlersProps) => {
  
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = (data: any) => {
    if (data.date) setSelectedDate(data.date);
    if (data.time) setSelectedTime(data.time);
    if (data.professional) setSelectedProfessional(data.professional);
  };

  const handleCustomerSubmit = (clientData: Client) => {
    setClient(clientData);
    setCurrentStep(4);
  };

  const handleConfirmAppointment = () => {
    // This will be handled by the Confirmation component
    console.log("Confirming appointment...");
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    handleServiceSelect,
    handleDateTimeSelect,
    handleCustomerSubmit,
    handleConfirmAppointment,
    handleBack,
  };
};

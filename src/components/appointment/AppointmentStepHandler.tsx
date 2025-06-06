
import ServiceSelection from "@/components/appointment/ServiceSelection";
import DateAndTimeSelector from "@/components/appointment/DateAndTimeSelector";
import CustomerForm from "@/components/appointment/CustomerForm";
import Confirmation from "@/components/appointment/Confirmation";
import { Service, Professional, Client, AppointmentData } from "@/types/appointment.types";

interface AppointmentStepHandlerProps {
  currentStep: number;
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  selectedDate: Date | null;
  selectedTime: string;
  client: Client | null;
  isSubmitting: boolean;
  isComplete: boolean;
  onServiceSelect: (service: Service) => void;
  onDateTimeSelect: (data: any) => void;
  onCustomerSubmit: (clientData: Client) => void;
  onBack: () => void;
  onConfirmAppointment: () => void;
  setIsSubmitting: (value: boolean) => void;
  setIsComplete: (value: boolean) => void;
  setCurrentStep: (step: number) => void;
}

const AppointmentStepHandler = ({
  currentStep,
  selectedService,
  selectedProfessional,
  selectedDate,
  selectedTime,
  client,
  isSubmitting,
  isComplete,
  onServiceSelect,
  onDateTimeSelect,
  onCustomerSubmit,
  onBack,
  onConfirmAppointment,
  setIsSubmitting,
  setIsComplete,
  setCurrentStep,
}: AppointmentStepHandlerProps) => {
  // Preparar dados do agendamento para confirmação
  const appointmentData: AppointmentData | null = selectedService && selectedDate && selectedProfessional && client ? {
    service: selectedService,
    professional: selectedProfessional,
    professional_name: selectedProfessional.nome,
    professional_id: selectedProfessional.id,
    date: selectedDate.toISOString().split('T')[0],
    time: selectedTime,
    client: client
  } : null;

  console.log(`📍 Step ${currentStep} - Dados disponíveis:`, {
    service: !!selectedService,
    professional: !!selectedProfessional,
    date: !!selectedDate,
    time: !!selectedTime,
    client: !!client,
    appointmentData: !!appointmentData
  });

  if (currentStep === 1) {
    return (
      <ServiceSelection 
        selectedService={selectedService}
        updateAppointmentData={({ service }) => onServiceSelect(service)}
        nextStep={() => setCurrentStep(2)}
      />
    );
  }

  if (currentStep === 2 && selectedService) {
    return (
      <DateAndTimeSelector
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        updateAppointmentData={onDateTimeSelect}
        nextStep={() => setCurrentStep(3)}
        prevStep={onBack}
      />
    );
  }

  if (currentStep === 3) {
    return (
      <CustomerForm
        client={client}
        updateAppointmentData={({ client }) => onCustomerSubmit(client)}
        nextStep={() => setCurrentStep(4)}
        prevStep={onBack}
      />
    );
  }

  if (currentStep === 4 && appointmentData) {
    return (
      <Confirmation
        appointmentData={appointmentData}
        isSubmitting={isSubmitting}
        isComplete={isComplete}
        setIsSubmitting={setIsSubmitting}
        setIsComplete={setIsComplete}
        prevStep={onBack}
        onConfirm={onConfirmAppointment}
      />
    );
  }

  // Fallback para casos onde dados estão incompletos
  if (currentStep === 4 && !appointmentData) {
    console.error("❌ Dados incompletos no step 4");
    setCurrentStep(1);
    return null;
  }

  return null;
};

export default AppointmentStepHandler;

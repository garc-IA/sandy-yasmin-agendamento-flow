
import ServiceSelection from "@/components/appointment/ServiceSelection";
import DateAndTimeSelector from "@/components/appointment/DateAndTimeSelector";
import CustomerForm from "@/components/appointment/CustomerForm";
import Confirmation from "@/components/appointment/Confirmation";
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

interface AppointmentStepHandlerProps {
  currentStep: number;
  selectedService: Servico | null;
  selectedProfessional: Professional | null;
  selectedDate: Date | null;
  selectedTime: string;
  client: Client | null;
  isSubmitting: boolean;
  isComplete: boolean;
  onServiceSelect: (service: Servico) => void;
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
  // Preparar dados do agendamento para o componente de confirmação
  const appointmentData = selectedService && selectedDate && selectedProfessional && client ? {
    service: {
      ...selectedService,
      descricao: selectedService.descricao || ""
    },
    professional_name: selectedProfessional.nome,
    professional_id: selectedProfessional.id,
    date: selectedDate.toISOString().split('T')[0],
    time: selectedTime,
    client: client
  } : null;

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

  return null;
};

export default AppointmentStepHandler;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemAvailability } from "@/hooks/useSystemAvailability";
import { SystemMaintenanceMessage } from "@/components/appointment/SystemMaintenanceMessage";
import { Loader2 } from "lucide-react";
import { useAppointmentState } from "@/hooks/appointment/useAppointmentState";
import { useAppointmentHandlers } from "@/hooks/appointment/useAppointmentHandlers";
import AppointmentStepHandler from "./AppointmentStepHandler";

export default function AppointmentContainer() {
  const { isSystemActive, maintenanceMessage, isLoading } = useSystemAvailability();
  const {
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
  } = useAppointmentState();

  const {
    handleServiceSelect,
    handleDateTimeSelect,
    handleCustomerSubmit,
    handleConfirmAppointment,
    handleBack,
  } = useAppointmentHandlers({
    setCurrentStep,
    setSelectedService,
    setSelectedProfessional,
    setSelectedDate,
    setSelectedTime,
    setClient,
    setAppointmentId,
    setIsComplete,
    selectedService,
    selectedProfessional,
    selectedDate,
    selectedTime,
    client,
    currentStep,
  });

  // Se ainda está carregando o status do sistema
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se o sistema não está ativo, mostrar mensagem de manutenção
  if (!isSystemActive) {
    return <SystemMaintenanceMessage message={maintenanceMessage} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              {currentStep === 4 && isComplete ? "Agendamento Confirmado!" : "Agendar Horário"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AppointmentStepHandler
              currentStep={currentStep}
              selectedService={selectedService}
              selectedProfessional={selectedProfessional}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              client={client}
              isSubmitting={isSubmitting}
              isComplete={isComplete}
              onServiceSelect={handleServiceSelect}
              onDateTimeSelect={handleDateTimeSelect}
              onCustomerSubmit={handleCustomerSubmit}
              onBack={handleBack}
              onConfirmAppointment={handleConfirmAppointment}
              setIsSubmitting={setIsSubmitting}
              setIsComplete={setIsComplete}
              setCurrentStep={setCurrentStep}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

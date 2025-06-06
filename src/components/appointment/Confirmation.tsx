
import AppointmentSummary from "./AppointmentSummary";
import ConfirmationComplete from "./ConfirmationComplete";
import ConfirmationActions from "./ConfirmationActions";
import type { ConfirmationProps } from "./types/confirmation.types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExtendedConfirmationProps extends Omit<ConfirmationProps, 'onConfirm'> {
  onConfirm?: () => void;
}

const Confirmation = ({
  appointmentData,
  isSubmitting,
  isComplete,
  setIsSubmitting,
  setIsComplete,
  prevStep,
  onConfirm
}: ExtendedConfirmationProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div>
      {isComplete ? (
        <ConfirmationComplete
          appointmentId={null}
          appointmentData={appointmentData}
        />
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-playfair mb-2">
            Confirme seu agendamento
          </h2>
          <p className="text-gray-500">
            Por favor verifique os detalhes abaixo antes de confirmar.
          </p>

          <AppointmentSummary 
            service={appointmentData.service}
            professionalName={appointmentData.professional_name}
            date={appointmentData.date}
            time={appointmentData.time}
            client={appointmentData.client}
          />

          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            
            <ConfirmationActions
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Confirmation;

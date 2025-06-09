
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { AppointmentData } from "@/types/appointment.types";

interface ConfirmationCompleteProps {
  appointmentData: AppointmentData;
  appointmentId: string | null;
}

const ConfirmationComplete = ({ appointmentData, appointmentId }: ConfirmationCompleteProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
        <Check className="h-8 w-8" />
      </div>
      <p className="text-lg">Seu agendamento foi confirmado com sucesso!</p>
      <p className="text-gray-500">
        Enviamos um e-mail com os detalhes do seu agendamento.
      </p>

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => (window.location.href = "/agendar")}
        >
          Fazer novo agendamento
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationComplete;

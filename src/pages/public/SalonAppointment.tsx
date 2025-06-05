
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppointmentSteps from "@/components/appointment/AppointmentSteps";
import { useSystemAvailability } from "@/hooks/useSystemAvailability";
import { SystemMaintenanceMessage } from "@/components/appointment/SystemMaintenanceMessage";
import { Loader2 } from "lucide-react";

export default function SalonAppointment() {
  const { salonUrl } = useParams<{ salonUrl: string }>();
  const { isSystemActive, maintenanceMessage, isLoading } = useSystemAvailability();

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-3xl font-bold">
              Agendar no {salonUrl}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AppointmentSteps />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

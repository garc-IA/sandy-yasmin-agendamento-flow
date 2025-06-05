
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AdminAppointmentCard } from "../AdminAppointmentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentListSkeleton } from "../../skeleton/AppointmentListSkeleton";

interface AdminAppointmentSectionsProps {
  appointments: AppointmentWithDetails[];
  currentTab: string;
  onTabChange: (value: string) => void;
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
  shouldShowError: boolean;
  shouldShowSkeleton: boolean;
}

export function AdminAppointmentSections({
  appointments,
  currentTab,
  onTabChange,
  onSelectAppointment,
  shouldShowError,
  shouldShowSkeleton
}: AdminAppointmentSectionsProps) {
  // Group appointments by status for easier rendering
  const groupedAppointments = {
    agendado: appointments.filter(app => app.status === "agendado"),
    concluido: appointments.filter(app => app.status === "concluido"),
    cancelado: appointments.filter(app => app.status === "cancelado"),
  };

  console.log("📋 Appointments count by status:", {
    all: appointments.length,
    agendado: groupedAppointments.agendado.length,
    concluido: groupedAppointments.concluido.length,
    cancelado: groupedAppointments.cancelado.length,
  });

  // Render appointment card for a given list
  const renderAppointmentCards = (appointmentList: AppointmentWithDetails[]) => {
    if (appointmentList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum agendamento encontrado.
        </div>
      );
    }

    return appointmentList.map((appointment) => (
      <AdminAppointmentCard
        key={appointment.id}
        appointment={appointment}
        onClick={() => onSelectAppointment(appointment)}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="agendado">Agendados</TabsTrigger>
              <TabsTrigger value="concluido">Concluídos</TabsTrigger>
              <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
            </TabsList>
          </div>
          
          {shouldShowError ? (
            <div className="text-center py-8 text-red-500 px-6">
              Erro ao carregar agendamentos. Por favor, tente novamente.
            </div>
          ) : shouldShowSkeleton ? (
            <div className="px-6 py-2">
              <AppointmentListSkeleton count={4} />
            </div>
          ) : (
            <>
              <TabsContent value="all" className="px-6 py-2 space-y-4">
                {groupedAppointments.agendado.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-blue-600">Agendamentos Ativos</h3>
                    {renderAppointmentCards(groupedAppointments.agendado)}
                  </div>
                )}
                
                {groupedAppointments.concluido.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-medium text-green-600">Agendamentos Concluídos</h3>
                    {renderAppointmentCards(groupedAppointments.concluido)}
                  </div>
                )}
                
                {groupedAppointments.cancelado.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-medium text-red-600">Agendamentos Cancelados</h3>
                    {renderAppointmentCards(groupedAppointments.cancelado)}
                  </div>
                )}
                
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento encontrado.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="agendado" className="px-6 py-2">
                <div className="space-y-3">
                  {renderAppointmentCards(groupedAppointments.agendado)}
                </div>
              </TabsContent>
              
              <TabsContent value="concluido" className="px-6 py-2">
                <div className="space-y-3">
                  {renderAppointmentCards(groupedAppointments.concluido)}
                </div>
              </TabsContent>
              
              <TabsContent value="cancelado" className="px-6 py-2">
                <div className="space-y-3">
                  {renderAppointmentCards(groupedAppointments.cancelado)}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}


import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useAppointmentsData } from "@/hooks/appointment/useAppointmentsData";
import { useAppointmentLoadingState } from "@/hooks/appointment/useAppointmentLoadingState";
import { AdminAppointmentFilters } from "./AdminAppointmentFilters";
import { AdminAppointmentCard } from "./AdminAppointmentCard";
import { AdminAppointmentDialogs } from "./AdminAppointmentDialogs";
import { AppointmentListSkeleton } from "../skeleton/AppointmentListSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminAppointmentList() {
  const {
    // Filter state
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    professionalFilter,
    setProfessionalFilter,
    searchQuery,
    setSearchQuery,
    
    // Data
    appointments,
    professionals,
    isLoading,
    error,
    
    // Actions
    refetch,
    handleAppointmentUpdated
  } = useAppointmentsData();

  // Dialog state
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Selected tab state
  const [currentTab, setCurrentTab] = useState("all");
  
  // Manual refresh indicator
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Loading state management
  const { shouldShowSkeleton, shouldShowError, shouldShowEmpty } = useAppointmentLoadingState({
    isLoading: isLoading || isRefreshing,
    appointments,
    error
  });

  // When statusFilter changes, update the tab
  useEffect(() => {
    setCurrentTab(statusFilter);
  }, [statusFilter]);

  // When tab changes, update the statusFilter
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setStatusFilter(value);
  };

  // Function to handle appointment selection
  const handleSelectAppointment = (appointment: AppointmentWithDetails) => {
    console.log("👆 Selected appointment:", appointment.id, appointment.status);
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  // Function to refresh the data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log("🔄 Manual refresh requested by user");
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

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
        onClick={() => handleSelectAppointment(appointment)}
      />
    ));
  };

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

  const formattedDate = selectedDate 
    ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
    : "Selecione uma data";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
          <p className="text-muted-foreground mt-1">
            {formattedDate}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="h-9" 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing || isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarIcon className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AdminAppointmentFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        professionalFilter={professionalFilter}
        setProfessionalFilter={setProfessionalFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        professionals={professionals}
      />
      
      {/* Appointment Tabs and List */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
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
      
      {/* Dialogs */}
      <AdminAppointmentDialogs
        appointment={selectedAppointment}
        showDetailsDialog={showDetailsDialog}
        setShowDetailsDialog={setShowDetailsDialog}
        showCancelDialog={showCancelDialog}
        setShowCancelDialog={setShowCancelDialog}
        showRescheduleDialog={showRescheduleDialog}
        setShowRescheduleDialog={setShowRescheduleDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        onAppointmentUpdated={handleAppointmentUpdated}
      />
    </div>
  );
}

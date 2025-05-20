
import { useState, useEffect } from "react";
import { CalendarView } from "@/components/appointment/admin/CalendarView";
import { AppointmentAlerts } from "@/components/appointment/admin/AppointmentAlerts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminAppointmentList } from "@/components/appointment/admin/AdminAppointmentList";
import { useAutoCompleteAppointments } from "@/hooks/appointment/useAutoCompleteAppointments";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

const AppointmentsOverview = () => {
  const [view, setView] = useState<string>("calendar");
  
  // Initialize auto-completion for past appointments
  const { runAutoComplete, lastRunTime, isRunning, forceInvalidateCache } = useAutoCompleteAppointments();
  
  // Forçar a verificação de agendamentos antigos quando a página for carregada
  useEffect(() => {
    console.log("🔄 AppointmentsOverview montado - verificando agendamentos antigos");
    // Pequeno atraso para garantir que todos os componentes estejam montados
    const timer = setTimeout(() => {
      runAutoComplete();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Função para forçar a verificação manual
  const handleManualCheck = async () => {
    await runAutoComplete();
    // Forçar a atualização visual
    await forceInvalidateCache();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral de Agendamentos</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os agendamentos em um só lugar
            {lastRunTime && (
              <span className="text-xs ml-2">
                (Última verificação: {lastRunTime.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualCheck} 
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Agendamentos Antigos
            </>
          )}
        </Button>
      </div>

      <AppointmentAlerts />

      <Tabs defaultValue={view} onValueChange={setView} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-0">
          <CalendarView />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <AdminAppointmentList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsOverview;

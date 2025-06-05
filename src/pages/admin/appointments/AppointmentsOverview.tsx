
import { useState, useEffect } from "react";
import { CalendarView } from "@/components/appointment/admin/CalendarView";
import { AppointmentAlerts } from "@/components/appointment/admin/AppointmentAlerts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminAppointmentList } from "@/components/appointment/admin/AdminAppointmentList";
import { useAutoCompleteAppointments } from "@/hooks/appointment/useAutoCompleteAppointments";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AppointmentsOverview = () => {
  const [view, setView] = useState<string>("calendar");
  
  // Initialize auto-completion with enhanced monitoring
  const { 
    runImmediateCheck, 
    forceCompleteInvalidation,
    lastRunTime, 
    lastUpdateCount,
    isRunning 
  } = useAutoCompleteAppointments();
  
  // Forçar a verificação de agendamentos antigos quando a página for carregada
  useEffect(() => {
    console.log("🔄 AppointmentsOverview montado - verificando agendamentos antigos com sync enhancado");
    const timer = setTimeout(async () => {
      await runImmediateCheck();
      await forceCompleteInvalidation();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Função para forçar a verificação manual com invalidação completa
  const handleManualCheck = async () => {
    console.log("🚀 Verificação manual solicitada da Overview");
    await runImmediateCheck();
    await forceCompleteInvalidation();
  };

  const formatLastRun = (date: Date | null) => {
    if (!date) return "Nunca executado";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "agora mesmo";
    if (diffMins === 1) return "1 minuto atrás";
    if (diffMins < 60) return `${diffMins} minutos atrás`;
    
    return date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral de Agendamentos</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Visualize e gerencie todos os agendamentos em um só lugar
            </p>
            {lastRunTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Última verificação: {formatLastRun(lastRunTime)}</span>
                {lastUpdateCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {lastUpdateCount} atualizados
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualCheck} 
          disabled={isRunning}
          className="transition-all duration-200 hover:scale-105"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar & Atualizar
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

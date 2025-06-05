
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Clock, Bell, TestTube, Loader2, Settings } from "lucide-react";

export function ReminderSettings() {
  const [isTestingReminder, setIsTestingReminder] = useState(false);
  const [isConfiguringCron, setIsConfiguringCron] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const { toast } = useToast();

  const configureCronJob = async () => {
    setIsConfiguringCron(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('setup-reminders-cron');
      
      if (error) throw error;

      toast({
        title: "Lembretes automáticos configurados!",
        description: "Sistema rodará a cada 15 minutos verificando agendamentos.",
      });
    } catch (error) {
      console.error("Erro ao configurar cron de lembretes:", error);
      toast({
        title: "Erro na configuração",
        description: "Não foi possível configurar os lembretes automáticos.",
        variant: "destructive"
      });
    } finally {
      setIsConfiguringCron(false);
    }
  };

  const testReminders = async () => {
    setIsTestingReminder(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('appointment-reminders');
      
      if (error) throw error;

      toast({
        title: "Teste de lembretes executado!",
        description: `${data.remindersCount} lembrete(s) processado(s).`,
      });

      // Se houver lembretes para enviar, abrir o primeiro WhatsApp
      if (data.reminders && data.reminders.length > 0) {
        window.open(data.reminders[0].whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error("Erro ao testar lembretes:", error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível executar o teste de lembretes.",
        variant: "destructive"
      });
    } finally {
      setIsTestingReminder(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Lembretes de Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lembretes Automáticos (1h antes)</Label>
              <p className="text-sm text-muted-foreground">
                Enviar WhatsApp automaticamente 1 hora antes do agendamento
              </p>
            </div>
            <Switch
              checked={remindersEnabled}
              onCheckedChange={setRemindersEnabled}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Lembrete Automático:</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Enviado 1 hora antes do agendamento</li>
                  <li>• WhatsApp direto para o cliente</li>
                  <li>• Detalhes completos do atendimento</li>
                  <li>• Evita faltas e não comparecimentos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={configureCronJob}
              disabled={isConfiguringCron}
              className="flex-1"
            >
              {isConfiguringCron ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Ativar Automático
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={testReminders}
              disabled={isTestingReminder}
            >
              {isTestingReminder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Sistema verifica agendamentos a cada 15 minutos e envia lembretes automaticamente
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Clock, Settings, TestTube, Loader2 } from "lucide-react";

interface BusinessHours {
  horario_abertura: string;
  horario_fechamento: string;
  dias_funcionamento: string[];
}

export function BusinessHoursSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConfiguringCron, setIsConfiguringCron] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    horario_abertura: "08:00",
    horario_fechamento: "18:00",
    dias_funcionamento: ["segunda", "terça", "quarta", "quinta", "sexta", "sábado"]
  });
  const [closingSummaryEnabled, setClosingSummaryEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBusinessHours();
  }, []);

  const loadBusinessHours = async () => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("horario_abertura, horario_fechamento, dias_funcionamento")
        .eq("email", "admin@studio.com")
        .single();

      if (error) throw error;
      
      if (data) {
        setBusinessHours({
          horario_abertura: data.horario_abertura || "08:00",
          horario_fechamento: data.horario_fechamento || "18:00",
          dias_funcionamento: data.dias_funcionamento || ["segunda", "terça", "quarta", "quinta", "sexta", "sábado"]
        });
      }
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários de funcionamento.",
        variant: "destructive"
      });
    }
  };

  const saveBusinessHours = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("admins")
        .update({
          horario_abertura: businessHours.horario_abertura,
          horario_fechamento: businessHours.horario_fechamento,
          dias_funcionamento: businessHours.dias_funcionamento
        })
        .eq("email", "admin@studio.com");

      if (error) throw error;

      toast({
        title: "Horários salvos",
        description: "Os horários de funcionamento foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os horários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const configureCronJob = async () => {
    setIsConfiguringCron(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('setup-closing-cron');
      
      if (error) throw error;

      toast({
        title: "Resumo automático configurado!",
        description: `Resumo de encerramento será enviado às ${data.summaryTime} (1h após fechamento).`,
      });
    } catch (error) {
      console.error("Erro ao configurar cron:", error);
      toast({
        title: "Erro na configuração",
        description: "Não foi possível configurar o envio automático.",
        variant: "destructive"
      });
    } finally {
      setIsConfiguringCron(false);
    }
  };

  const testClosingSummary = async () => {
    setIsTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('daily-closing-summary');
      
      if (error) throw error;

      if (data?.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
        
        toast({
          title: "Teste do resumo de encerramento!",
          description: `Resumo de ${data.totalAppointments} agendamento(s) preparado.`,
        });
      }
    } catch (error) {
      console.error("Erro ao testar resumo de encerramento:", error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível gerar o resumo de teste.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const calculateSummaryTime = () => {
    const [hours] = businessHours.horario_fechamento.split(':');
    const closingHour = parseInt(hours);
    const summaryHour = (closingHour + 1) % 24;
    return `${summaryHour.toString().padStart(2, '0')}:00`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários de Funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="opening-time">Horário de Abertura</Label>
            <Input
              id="opening-time"
              type="time"
              value={businessHours.horario_abertura}
              onChange={(e) => setBusinessHours({
                ...businessHours,
                horario_abertura: e.target.value
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="closing-time">Horário de Fechamento</Label>
            <Input
              id="closing-time"
              type="time"
              value={businessHours.horario_fechamento}
              onChange={(e) => setBusinessHours({
                ...businessHours,
                horario_fechamento: e.target.value
              })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Resumo de Encerramento</Label>
              <p className="text-sm text-muted-foreground">
                Enviar balanço do dia às {calculateSummaryTime()} (1h após fechamento)
              </p>
            </div>
            <Switch
              checked={closingSummaryEnabled}
              onCheckedChange={setClosingSummaryEnabled}
            />
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 text-orange-600" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Resumo de Encerramento:</p>
                <ul className="text-orange-700 mt-1 space-y-1">
                  <li>• Balanço do dia (atendimentos realizados vs planejados)</li>
                  <li>• Faturamento real vs perdido</li>
                  <li>• Lista de clientes atendidos</li>
                  <li>• Faltas e não comparecimentos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex gap-2">
            <Button 
              onClick={saveBusinessHours} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Horários"
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={configureCronJob}
              disabled={isConfiguringCron}
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
              onClick={testClosingSummary}
              disabled={isTesting}
            >
              {isTesting ? (
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
        </div>
      </CardContent>
    </Card>
  );
}

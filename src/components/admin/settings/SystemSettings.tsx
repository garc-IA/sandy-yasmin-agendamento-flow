
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, MessageSquare, Clock, Calendar } from "lucide-react";

interface SystemConfig {
  businessHours: {
    start: string;
    end: string;
    breakStart: string;
    breakEnd: string;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    reminderHours: number;
  };
  booking: {
    advanceBookingDays: number;
    intervalMinutes: number;
    allowCancellationHours: number;
  };
  messages: {
    welcomeMessage: string;
    confirmationMessage: string;
    reminderMessage: string;
    cancellationMessage: string;
  };
}

const defaultConfig: SystemConfig = {
  businessHours: {
    start: "09:00",
    end: "18:00",
    breakStart: "12:00",
    breakEnd: "13:00"
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    reminderHours: 24
  },
  booking: {
    advanceBookingDays: 30,
    intervalMinutes: 15,
    allowCancellationHours: 24
  },
  messages: {
    welcomeMessage: "Bem-vindo ao Studio Sandy Yasmin!",
    confirmationMessage: "Seu agendamento foi confirmado para {data} às {hora}.",
    reminderMessage: "Lembramos que você tem um agendamento amanhã às {hora}.",
    cancellationMessage: "Seu agendamento foi cancelado com sucesso."
  }
};

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="business" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="booking" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendamentos
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagens
              </TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Horário de Abertura</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={config.businessHours.start}
                    onChange={(e) => updateConfig('businessHours', 'start', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-time">Horário de Fechamento</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={config.businessHours.end}
                    onChange={(e) => updateConfig('businessHours', 'end', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="break-start">Início do Intervalo</Label>
                  <Input
                    id="break-start"
                    type="time"
                    value={config.businessHours.breakStart}
                    onChange={(e) => updateConfig('businessHours', 'breakStart', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="break-end">Fim do Intervalo</Label>
                  <Input
                    id="break-end"
                    type="time"
                    value={config.businessHours.breakEnd}
                    onChange={(e) => updateConfig('businessHours', 'breakEnd', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar confirmações e lembretes por email
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateConfig('notifications', 'emailEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar confirmações e lembretes por SMS
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.smsEnabled}
                    onCheckedChange={(checked) => updateConfig('notifications', 'smsEnabled', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminder-hours">Enviar lembrete (horas antes)</Label>
                  <Select
                    value={config.notifications.reminderHours.toString()}
                    onValueChange={(value) => updateConfig('notifications', 'reminderHours', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="booking" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="advance-days">Agendamentos com antecedência (dias)</Label>
                  <Input
                    id="advance-days"
                    type="number"
                    min="1"
                    max="90"
                    value={config.booking.advanceBookingDays}
                    onChange={(e) => updateConfig('booking', 'advanceBookingDays', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interval">Intervalo entre agendamentos (minutos)</Label>
                  <Select
                    value={config.booking.intervalMinutes.toString()}
                    onValueChange={(value) => updateConfig('booking', 'intervalMinutes', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cancellation">Permitir cancelamento até (horas antes)</Label>
                  <Input
                    id="cancellation"
                    type="number"
                    min="1"
                    max="72"
                    value={config.booking.allowCancellationHours}
                    onChange={(e) => updateConfig('booking', 'allowCancellationHours', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="welcome"
                    value={config.messages.welcomeMessage}
                    onChange={(e) => updateConfig('messages', 'welcomeMessage', e.target.value)}
                    placeholder="Mensagem exibida na página inicial"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmation">Mensagem de Confirmação</Label>
                  <Textarea
                    id="confirmation"
                    value={config.messages.confirmationMessage}
                    onChange={(e) => updateConfig('messages', 'confirmationMessage', e.target.value)}
                    placeholder="Use {data} e {hora} para variáveis dinâmicas"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminder">Mensagem de Lembrete</Label>
                  <Textarea
                    id="reminder"
                    value={config.messages.reminderMessage}
                    onChange={(e) => updateConfig('messages', 'reminderMessage', e.target.value)}
                    placeholder="Use {data} e {hora} para variáveis dinâmicas"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cancellation">Mensagem de Cancelamento</Label>
                  <Textarea
                    id="cancellation"
                    value={config.messages.cancellationMessage}
                    onChange={(e) => updateConfig('messages', 'cancellationMessage', e.target.value)}
                    placeholder="Mensagem enviada após cancelamento"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end pt-6 border-t">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

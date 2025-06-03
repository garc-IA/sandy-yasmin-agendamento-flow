
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Clock, Bell, MessageSquare, Globe } from "lucide-react";

export function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    studio_name: "Sandy Yasmin Studio",
    email: "contato@sandyyasmin.com",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123 - Centro",
    opening_hours: {
      monday: { start: "09:00", end: "18:00", enabled: true },
      tuesday: { start: "09:00", end: "18:00", enabled: true },
      wednesday: { start: "09:00", end: "18:00", enabled: true },
      thursday: { start: "09:00", end: "18:00", enabled: true },
      friday: { start: "09:00", end: "18:00", enabled: true },
      saturday: { start: "09:00", end: "15:00", enabled: true },
      sunday: { start: "10:00", end: "14:00", enabled: false },
    },
    appointment_interval: "30",
    max_advance_booking: "30",
    notifications: {
      email_enabled: true,
      sms_enabled: false,
      whatsapp_enabled: true,
      reminder_hours: "24",
    },
    automatic_confirmation: true,
    allow_cancellation_hours: "2",
    timezone: "America/Sao_Paulo",
  });

  const handleSaveSettings = async () => {
    try {
      // Aqui seria feita a chamada para salvar as configurações
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
    }
  };

  const weekDays = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studio_name">Nome do Studio</Label>
                <Input
                  id="studio_name"
                  value={settings.studio_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, studio_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          {/* Horários de Funcionamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários de Funcionamento
            </h3>
            <div className="space-y-3">
              {weekDays.map(day => (
                <div key={day.key} className="flex items-center gap-4 p-3 border rounded">
                  <div className="w-32">
                    <Label>{day.label}</Label>
                  </div>
                  <Switch
                    checked={settings.opening_hours[day.key as keyof typeof settings.opening_hours].enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        opening_hours: {
                          ...prev.opening_hours,
                          [day.key]: { ...prev.opening_hours[day.key as keyof typeof prev.opening_hours], enabled: checked }
                        }
                      }))
                    }
                  />
                  {settings.opening_hours[day.key as keyof typeof settings.opening_hours].enabled && (
                    <>
                      <Input
                        type="time"
                        value={settings.opening_hours[day.key as keyof typeof settings.opening_hours].start}
                        onChange={(e) => 
                          setSettings(prev => ({
                            ...prev,
                            opening_hours: {
                              ...prev.opening_hours,
                              [day.key]: { ...prev.opening_hours[day.key as keyof typeof prev.opening_hours], start: e.target.value }
                            }
                          }))
                        }
                        className="w-32"
                      />
                      <span>até</span>
                      <Input
                        type="time"
                        value={settings.opening_hours[day.key as keyof typeof settings.opening_hours].end}
                        onChange={(e) => 
                          setSettings(prev => ({
                            ...prev,
                            opening_hours: {
                              ...prev.opening_hours,
                              [day.key]: { ...prev.opening_hours[day.key as keyof typeof prev.opening_hours], end: e.target.value }
                            }
                          }))
                        }
                        className="w-32"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Configurações de Agendamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações de Agendamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo entre Atendimentos (min)</Label>
                <Select
                  value={settings.appointment_interval}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, appointment_interval: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance_booking">Agendamento Antecipado (dias)</Label>
                <Input
                  id="advance_booking"
                  type="number"
                  value={settings.max_advance_booking}
                  onChange={(e) => setSettings(prev => ({ ...prev, max_advance_booking: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellation_hours">Cancelamento Antecipado (horas)</Label>
                <Input
                  id="cancellation_hours"
                  type="number"
                  value={settings.allow_cancellation_hours}
                  onChange={(e) => setSettings(prev => ({ ...prev, allow_cancellation_hours: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto_confirmation"
                checked={settings.automatic_confirmation}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, automatic_confirmation: checked }))}
              />
              <Label htmlFor="auto_confirmation">Confirmar agendamentos automaticamente</Label>
            </div>
          </div>

          <Separator />

          {/* Notificações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email_notifications"
                    checked={settings.notifications.email_enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email_enabled: checked }
                      }))
                    }
                  />
                  <Label htmlFor="email_notifications">Notificações por Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms_notifications"
                    checked={settings.notifications.sms_enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, sms_enabled: checked }
                      }))
                    }
                  />
                  <Label htmlFor="sms_notifications">Notificações por SMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="whatsapp_notifications"
                    checked={settings.notifications.whatsapp_enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, whatsapp_enabled: checked }
                      }))
                    }
                  />
                  <Label htmlFor="whatsapp_notifications">Notificações por WhatsApp</Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder_hours">Enviar lembretes antes (horas)</Label>
                  <Select
                    value={settings.notifications.reminder_hours}
                    onValueChange={(value) => 
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, reminder_hours: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora antes</SelectItem>
                      <SelectItem value="2">2 horas antes</SelectItem>
                      <SelectItem value="12">12 horas antes</SelectItem>
                      <SelectItem value="24">24 horas antes</SelectItem>
                      <SelectItem value="48">2 dias antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

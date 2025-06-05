
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Bell, MessageSquare, Clock, TestTube, Loader2 } from "lucide-react";

export function DailyNotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [adminPhone, setAdminPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { toast } = useToast();

  // Carregar configurações atuais
  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("nome, telefone")
        .eq("email", "admin@studio.com")
        .single();

      if (error) throw error;
      
      if (data) {
        setAdminName(data.nome || "");
        setAdminPhone(data.telefone || "");
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações atuais.",
        variant: "destructive"
      });
    }
  };

  const saveSettings = async () => {
    if (!adminPhone.trim()) {
      toast({
        title: "Telefone obrigatório",
        description: "Por favor, informe o número de telefone para receber as notificações.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("admins")
        .update({ 
          telefone: adminPhone.trim(),
          nome: adminName.trim() || "Sandy"
        })
        .eq("email", "admin@studio.com");

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações de notificação foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    if (!adminPhone.trim()) {
      toast({
        title: "Configure o telefone primeiro",
        description: "Salve o número de telefone antes de testar a notificação.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('daily-appointment-summary');
      
      if (error) throw error;

      if (data?.whatsappUrl) {
        // Abrir WhatsApp com a mensagem de teste
        window.open(data.whatsappUrl, '_blank');
        
        toast({
          title: "Teste enviado!",
          description: `Resumo de ${data.appointmentsCount} agendamento(s) preparado para envio.`,
        });
      } else {
        toast({
          title: "Erro no teste",
          description: "Não foi possível gerar o resumo de teste.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao testar notificação:", error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a notificação de teste.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Diárias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Nome do Administrador</Label>
            <Input
              id="admin-name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Sandy Yasmin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-phone">Telefone para Notificações</Label>
            <Input
              id="admin-phone"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              type="tel"
            />
            <p className="text-sm text-muted-foreground">
              Número que receberá o resumo diário dos agendamentos via WhatsApp
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações Ativas</Label>
              <p className="text-sm text-muted-foreground">
                Receber resumo diário às 8h da manhã
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex gap-2">
            <Button 
              onClick={saveSettings} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configurações"
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={testNotification}
              disabled={isTesting || !adminPhone.trim()}
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
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Como funciona:</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Resumo automático enviado às 8h da manhã</li>
                  <li>• Inclui todos os agendamentos do dia</li>
                  <li>• Mostra faturamento previsto</li>
                  <li>• Enviado via WhatsApp</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

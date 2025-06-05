
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CalendarOff, Calendar, Loader2, AlertTriangle } from "lucide-react";

export function SystemAvailabilitySettings() {
  const [isSystemEnabled, setIsSystemEnabled] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("sistema_ativo, mensagem_manutencao")
        .eq("email", "admin@studio.com")
        .single();

      if (error) throw error;

      if (data) {
        setIsSystemEnabled(data.sistema_ativo ?? true);
        setMaintenanceMessage(data.mensagem_manutencao || "Sistema temporariamente indisponível para agendamentos. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("admins")
        .update({
          sistema_ativo: isSystemEnabled,
          mensagem_manutencao: maintenanceMessage
        })
        .eq("email", "admin@studio.com");

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: isSystemEnabled 
          ? "Sistema de agendamentos ativado com sucesso."
          : "Sistema de agendamentos desativado temporariamente.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSystemEnabled ? (
            <Calendar className="h-5 w-5 text-green-600" />
          ) : (
            <CalendarOff className="h-5 w-5 text-red-600" />
          )}
          Disponibilidade do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Sistema de Agendamentos
              </Label>
              <p className="text-sm text-muted-foreground">
                Controle se novos agendamentos podem ser realizados
              </p>
            </div>
            <Switch
              checked={isSystemEnabled}
              onCheckedChange={setIsSystemEnabled}
            />
          </div>

          {!isSystemEnabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Sistema Desativado
                  </p>
                  <p className="text-sm text-amber-700">
                    Quando desativado, clientes não conseguirão fazer novos agendamentos. 
                    A página mostrará a mensagem personalizada abaixo.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="maintenance-message">
              Mensagem de Manutenção
            </Label>
            <Textarea
              id="maintenance-message"
              placeholder="Digite a mensagem que será exibida quando o sistema estiver desativado..."
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={3}
              disabled={isSystemEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Esta mensagem será exibida para os clientes quando tentarem agendar
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={saveSettings}
            disabled={isSaving}
            variant={isSystemEnabled ? "default" : "destructive"}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                {isSystemEnabled ? (
                  <Calendar className="h-4 w-4 mr-2" />
                ) : (
                  <CalendarOff className="h-4 w-4 mr-2" />
                )}
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Status atual:</strong> {isSystemEnabled ? "Sistema Ativo ✅" : "Sistema Desativado ❌"}</p>
            <p><strong>Última atualização:</strong> {new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudioSettings } from "@/context/theme-context";
import { PersonalizationSection } from "@/components/admin/tools/PersonalizationSection";
import { DailyNotificationSettings } from "@/components/admin/daily-notifications/DailyNotificationSettings";

const Tools = () => {
  const { studioTheme, updateStudioTheme } = useStudioSettings();
  
  // Apply settings to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', convertHexToHsl(studioTheme.primaryColor));
    root.style.setProperty('--secondary', convertHexToHsl(studioTheme.secondaryColor));
  }, [studioTheme.primaryColor, studioTheme.secondaryColor]);
  
  // Helper function to convert hex to HSL format for Tailwind CSS variables
  const convertHexToHsl = (hex: string): string => {
    // For a proper implementation, you'd convert hex to HSL
    // This is a placeholder that would work with proper conversion logic
    return hex; // In reality, you'd return something like "43 69% 52%"
  };
  
  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As alterações foram aplicadas com sucesso."
    });
  };
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ferramentas</h1>
      
      <Tabs defaultValue="personalizacao">
        <TabsList className="mb-4">
          <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações Gerais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personalizacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalização do Studio</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalizationSection />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <DailyNotificationSettings />
        </TabsContent>
        
        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações adicionais e opções do sistema estarão disponíveis em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tools;

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import LogoUploader from "@/components/admin/tools/LogoUploader";
import BannerUploader from "@/components/admin/tools/BannerUploader";
import ColorPicker from "@/components/admin/tools/ColorPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudioSettings } from "@/context/theme-context";

interface StudioSettings {
  name: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

const defaultSettings: StudioSettings = {
  name: "Studio Sandy Yasmin",
  logoUrl: "",
  bannerUrl: "",
  primaryColor: "#D0A638", // Gold color
  secondaryColor: "#FFEFEF", // Light pink
};

const Tools = () => {
  const { studioTheme, updateStudioTheme } = useStudioSettings();
  const [studioName, setStudioName] = useState(studioTheme.name);
  const [logoUrl, setLogoUrl] = useState(studioTheme.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(studioTheme.bannerUrl);
  const [primaryColor, setPrimaryColor] = useState(studioTheme.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(studioTheme.secondaryColor);
  
  // Apply settings to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', convertHexToHsl(primaryColor));
    root.style.setProperty('--secondary', convertHexToHsl(secondaryColor));
  }, [primaryColor, secondaryColor]);
  
  // Helper function to convert hex to HSL format for Tailwind CSS variables
  const convertHexToHsl = (hex: string): string => {
    // For a proper implementation, you'd convert hex to HSL
    // This is a placeholder that would work with proper conversion logic
    return hex; // In reality, you'd return something like "43 69% 52%"
  };
  
  const handleSave = () => {
    const newSettings = {
      name: studioName,
      logoUrl,
      bannerUrl,
      primaryColor,
      secondaryColor,
    };
    
    updateStudioTheme(newSettings);
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
          <TabsTrigger value="configuracoes">Configurações Gerais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personalizacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalização do Studio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Studio Name */}
              <div className="space-y-2">
                <Label htmlFor="studio-name">Nome do Studio</Label>
                <Input
                  id="studio-name"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Nome do seu studio"
                />
                <p className="text-xs text-muted-foreground">
                  Este nome será exibido no cabeçalho e título da página.
                </p>
              </div>
              
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo do Studio</Label>
                <LogoUploader 
                  currentLogo={logoUrl} 
                  onLogoChange={setLogoUrl} 
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: imagem quadrada de pelo menos 200x200 pixels.
                </p>
              </div>
              
              {/* Banner Upload */}
              <div className="space-y-2">
                <Label>Banner do Studio</Label>
                <BannerUploader 
                  currentBanner={bannerUrl} 
                  onBannerChange={setBannerUrl} 
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: imagem no formato 1200x300 pixels. Este banner aparecerá no topo do painel administrativo.
                </p>
              </div>
              
              {/* Color Selection */}
              <div className="space-y-4">
                <Label>Cores do Tema</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color" className="mb-2 block text-sm">Cor Primária</Label>
                    <ColorPicker 
                      color={primaryColor} 
                      onChange={setPrimaryColor}
                      id="primary-color"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Usada em botões e elementos de destaque.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="secondary-color" className="mb-2 block text-sm">Cor Secundária</Label>
                    <ColorPicker 
                      color={secondaryColor} 
                      onChange={setSecondaryColor}
                      id="secondary-color"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Usada em fundos e elementos complementares.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="space-y-2">
                <Label>Pré-visualização</Label>
                <div className="border rounded-lg overflow-hidden">
                  {/* Banner preview */}
                  {bannerUrl && (
                    <div className="h-24 overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10">
                      <img 
                        src={bannerUrl} 
                        alt="Banner Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Header preview */}
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {logoUrl && (
                        <img 
                          src={logoUrl} 
                          alt="Logo Preview" 
                          className="w-12 h-12 object-contain"
                        />
                      )}
                      <h2 className="font-bold">{studioName}</h2>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button style={{backgroundColor: primaryColor}}>
                        Botão Primário
                      </Button>
                      <div style={{backgroundColor: secondaryColor}} className="p-4 rounded-md text-center">
                        Background Secundário
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
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


/**
 * Seção de personalização extraída do Tools.tsx
 * Responsável apenas pela personalização visual do studio
 */
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LogoUploader from "./LogoUploader";
import BannerUploader from "./BannerUploader";
import ColorPicker from "./ColorPicker";
import { useStudioSettings } from "@/context/theme-context";

export function PersonalizationSection() {
  const { studioTheme } = useStudioSettings();
  const [studioName, setStudioName] = useState(studioTheme.name);
  const [logoUrl, setLogoUrl] = useState(studioTheme.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(studioTheme.bannerUrl);
  const [primaryColor, setPrimaryColor] = useState(studioTheme.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(studioTheme.secondaryColor);

  return (
    <div className="space-y-6">
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
              <button 
                style={{backgroundColor: primaryColor}}
                className="px-4 py-2 rounded text-white font-medium"
              >
                Botão Primário
              </button>
              <div 
                style={{backgroundColor: secondaryColor}} 
                className="p-4 rounded-md text-center"
              >
                Background Secundário
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

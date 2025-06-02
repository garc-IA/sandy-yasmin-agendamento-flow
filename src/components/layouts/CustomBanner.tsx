
import { useStudioSettings } from "@/context/theme-context";

export function CustomBanner() {
  const { studioTheme } = useStudioSettings();

  if (!studioTheme.bannerUrl) {
    return null;
  }

  return (
    <div className="w-full h-32 md:h-40 lg:h-48 overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10 animate-fade-in">
      <img 
        src={studioTheme.bannerUrl} 
        alt="Banner do Studio" 
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}

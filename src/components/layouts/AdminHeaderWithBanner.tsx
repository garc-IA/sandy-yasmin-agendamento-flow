
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "../admin/ThemeToggle";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudioSettings } from "@/context/theme-context";
import { CustomBanner } from "./CustomBanner";

interface AdminHeaderWithBannerProps {
  onLogout: () => void;
}

const AdminHeaderWithBanner = ({ onLogout }: AdminHeaderWithBannerProps) => {
  const { adminData, isLoading } = useAdminProfile();
  const { studioTheme } = useStudioSettings();
  
  return (
    <div className="w-full">
      {/* Custom Banner */}
      <CustomBanner />
      
      {/* Header */}
      <div className="flex-1 flex items-center justify-between h-16 px-2 sm:px-4 border-b bg-background">
        <div className="flex-1 truncate">
          <h1 className="text-base sm:text-lg font-semibold truncate">
            {studioTheme.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            Painel Administrativo
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="w-8 h-8 rounded-full" />
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={adminData?.avatar_url || undefined} 
                  alt={adminData?.nome || "Admin"} 
                />
                <AvatarFallback>{adminData?.nome?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
            )}
            <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
              {isLoading ? (
                <Skeleton className="w-24 h-4" />
              ) : (
                adminData?.nome || "Admin"
              )}
            </span>
          </div>
          
          <Button variant="outline" size="sm" onClick={onLogout} className="px-2 sm:px-3">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Sair</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeaderWithBanner;

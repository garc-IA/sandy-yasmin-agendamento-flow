
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { User, LogOut } from "lucide-react";

export function AdminHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b flex items-center justify-between px-6 py-3">
      <h1 className="text-lg font-medium">
        Painel Administrativo - Studio Sandy Yasmin
      </h1>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user.email}
            </span>
          </div>
        )}
        
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </Button>
      </div>
    </header>
  );
}

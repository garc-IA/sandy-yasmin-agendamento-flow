
import { Outlet, Navigate } from "react-router-dom";
import AdminHeaderWithBanner from "./AdminHeaderWithBanner";
import { useAuth } from "@/context/auth-context";
import Breadcrumbs from "../admin/Breadcrumbs";
import { Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import AdminSidebar from "../admin/AdminSidebar";

const AdminLayout = () => {
  const { isLoggedIn, signOut, isLoading } = useAuth();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Handle window resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Protect admin layout
  if (!isLoggedIn) {
    console.log("Access denied: User not logged in. Redirecting to login from AdminLayout");
    return <Navigate to="/admin/login" replace />;
  }

  // Mobile view with sheet-based sidebar
  if (isMobileView) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-40">
          <div className="h-16 border-b bg-background flex items-center px-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-4">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[80%] max-w-[280px]">
                <AdminSidebar onItemClick={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <AdminHeaderWithBanner onLogout={signOut} />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto bg-background p-3 md:p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    );
  }

  // Desktop view with fixed sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block w-64 h-full">
        <AdminSidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeaderWithBanner onLogout={signOut} />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

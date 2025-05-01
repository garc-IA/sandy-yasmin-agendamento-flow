
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicLayout from "./components/layouts/PublicLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import Appointment from "./pages/public/Appointment";
import ClientArea from "./pages/public/ClientArea"; 
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AppointmentList from "./pages/admin/appointments/AppointmentList";
import AppointmentsOverview from "./pages/admin/appointments/AppointmentsOverview";
import WeeklySchedule from "./pages/admin/WeeklySchedule";
import Professionals from "./pages/admin/Professionals";
import Services from "./pages/admin/Services";
import WhatsAppMessages from "./pages/admin/WhatsAppMessages";
import Profile from "./pages/admin/Profile";
import Reviews from "./pages/admin/Reviews";
import WhatsAppSender from "./pages/admin/WhatsAppSender";
import { AuthProvider } from "./context/auth-context";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import { initializeDefaultData } from "@/lib/initData";
import BlocksList from "./pages/admin/blocks/BlocksList";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Configure React Query with more robust error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2, // Retry failed requests twice
      retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000), // Exponential backoff
      meta: {
        onError: (error: any) => {
          console.error("Query error:", error);
        },
      },
    },
    mutations: {
      retry: 1,
      meta: {
        onError: (error: any) => {
          console.error("Mutation error:", error);
        },
      },
    },
  },
});

const App = () => {
  useEffect(() => {
    const initData = async () => {
      try {
        console.log("Initializing default data...");
        await initializeDefaultData();
        console.log("Default data initialized successfully");
      } catch (error) {
        console.error("Error initializing default data:", error);
      }
    };
    
    initData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Navigate to="/agendar" replace />} />
                <Route path="/agendar" element={<Appointment />} />
                <Route path="/cliente" element={<ClientArea />} />
              </Route>

              {/* Authentication routes - not protected */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<Register />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />

              {/* Protected admin routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="agendamentos" element={<AppointmentsOverview />} />
                <Route path="agendamentos/lista" element={<AppointmentList />} />
                <Route path="agenda-semanal" element={<WeeklySchedule />} />
                <Route path="profissionais" element={<Professionals />} />
                <Route path="servicos" element={<Services />} />
                <Route path="mensagens" element={<WhatsAppMessages />} />
                <Route path="enviar-mensagens" element={<WhatsAppSender />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="bloqueios" element={<BlocksList />} />
                <Route path="avaliacoes" element={<Reviews />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

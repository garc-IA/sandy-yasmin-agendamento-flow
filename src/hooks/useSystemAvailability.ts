
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SystemStatus {
  isSystemActive: boolean;
  maintenanceMessage: string;
  isLoading: boolean;
}

export function useSystemAvailability() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isSystemActive: true,
    maintenanceMessage: "",
    isLoading: true
  });

  useEffect(() => {
    checkSystemAvailability();
  }, []);

  const checkSystemAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("sistema_ativo, mensagem_manutencao")
        .eq("email", "admin@studio.com")
        .single();

      if (error) throw error;

      setSystemStatus({
        isSystemActive: data?.sistema_ativo ?? true,
        maintenanceMessage: data?.mensagem_manutencao || "Sistema temporariamente indisponível para agendamentos. Tente novamente mais tarde.",
        isLoading: false
      });
    } catch (error) {
      console.error("Erro ao verificar disponibilidade do sistema:", error);
      // Em caso de erro, assumir que o sistema está ativo
      setSystemStatus({
        isSystemActive: true,
        maintenanceMessage: "",
        isLoading: false
      });
    }
  };

  return { ...systemStatus, refresh: checkSystemAvailability };
}

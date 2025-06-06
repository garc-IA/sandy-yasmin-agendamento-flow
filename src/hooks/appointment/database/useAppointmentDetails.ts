
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { DatabaseResult } from "../useAppointmentTypes";

/**
 * Hook for fetching appointment details from the database
 */
export const useAppointmentDetails = () => {
  /**
   * Obtém o ID do admin padrão para o Studio Sandy Yasmin
   */
  const getAdminId = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("email", "admin@studio.com")
        .single();
      
      if (error) throw error;
      if (!data?.id) throw new Error("Admin não encontrado");
      
      return data.id;
    } catch (error) {
      logger.error("Erro ao obter ID do admin:", error);
      throw error;
    }
  };

  /**
   * Fetches appointment details by ID
   */
  const getAppointmentById = async (appointmentId: string): Promise<DatabaseResult> => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `)
        .eq('id', appointmentId)
        .single();
      
      logger.database.operation('SELECT', 'agendamentos', { data, error });
      
      return {
        data,
        error: error || null,
        success: !error && data !== null
      };
    } catch (error) {
      logger.appointment.error('Erro ao buscar detalhes do agendamento', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return { getAdminId, getAppointmentById };
};

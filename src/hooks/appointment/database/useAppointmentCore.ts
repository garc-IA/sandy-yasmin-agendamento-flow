
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";

/**
 * Core database utilities for appointment operations
 * Contains shared functionality used across different database operation hooks
 */
export const useAppointmentCore = () => {
  /**
   * Obtém o ID do admin padrão para o Studio Sandy Yasmin
   * Esta função é usada internamente para associar operações ao admin correto
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
   * Fetches an appointment by ID with all related data
   */
  const getAppointmentById = async (appointmentId: string) => {
    try {
      if (!appointmentId) {
        return { 
          data: null, 
          error: new Error('ID de agendamento inválido'), 
          success: false 
        };
      }

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
      
      return { 
        data, 
        error: error || null, 
        success: !error && data !== null 
      };
    } catch (error) {
      logger.appointment.error('Erro ao buscar agendamento', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return {
    getAdminId,
    getAppointmentById
  };
};

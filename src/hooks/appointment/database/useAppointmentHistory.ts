
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { DatabaseResult } from "../useAppointmentTypes";

/**
 * Hook for handling appointment history entries in the database
 */
export const useAppointmentHistory = () => {
  /**
   * Creates a history entry for an appointment status change
   */
  const createHistoryEntry = async (
    appointmentId: string,
    tipo: string,
    descricao: string,
    valorAnterior?: string,
    novoValor?: string,
    observacao?: string
  ): Promise<DatabaseResult> => {
    const historyEntry = {
      agendamento_id: appointmentId,
      tipo,
      descricao,
      ...(valorAnterior && { valor_anterior: valorAnterior }),
      ...(novoValor && { novo_valor: novoValor }),
      ...(observacao && { observacao }),
    };

    logger.appointment.action("Inserindo histórico", appointmentId, historyEntry);

    try {
      const { data, error } = await supabase
        .from('agendamento_historico')
        .insert(historyEntry)
        .select();
      
      logger.database.operation('INSERT', 'agendamento_historico', { data, error });
      
      return { 
        data, 
        error: error || null, 
        success: !error 
      };
    } catch (error) {
      logger.appointment.error('Erro ao criar histórico', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  /**
   * Fetches appointment history by appointment ID
   */
  const getAppointmentHistory = async (appointmentId: string): Promise<DatabaseResult> => {
    try {
      const { data, error } = await supabase
        .from('agendamento_historico')
        .select('*')
        .eq('agendamento_id', appointmentId)
        .order('created_at', { ascending: false });
      
      logger.database.operation('SELECT', 'agendamento_historico', { data, error });
      
      return {
        data,
        error: error || null,
        success: !error
      };
    } catch (error) {
      logger.appointment.error('Erro ao buscar histórico do agendamento', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return {
    createHistoryEntry,
    getAppointmentHistory
  };
};


import { supabase } from "@/lib/supabase";
import { AppointmentStatus } from "@/types/appointment.types";
import { 
  logDatabaseOperation,
  logAppointmentError,
  logAppointmentAction
} from "@/utils/debugUtils";

// Generic database result type
export type DatabaseResult<T = any> = {
  data: T | null;
  error: Error | null;
  success: boolean;
};

/**
 * Core hook for all database operations related to appointments
 * This centralizes all direct Supabase calls to ensure consistency
 */
export const useAppointmentDatabase = () => {
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
      console.error("Erro ao obter ID do admin:", error);
      throw error;
    }
  };

  /**
   * Updates an appointment's status in the database
   */
  const updateAppointmentStatus = async (
    appointmentId: string, 
    status: AppointmentStatus, 
    reason?: string
  ): Promise<DatabaseResult> => {
    try {
      if (!appointmentId || appointmentId.trim() === '') {
        return { 
          data: null, 
          error: new Error('ID de agendamento inválido'), 
          success: false 
        };
      }

      const updateData: Record<string, any> = { status };
      
      if (reason && status === 'cancelado') {
        updateData['motivo_cancelamento'] = reason;
        logAppointmentAction(`Adicionando motivo de cancelamento`, appointmentId, { motivo: reason });
      }

      logAppointmentAction('Executando update no banco', appointmentId, { updateData });

      const { data, error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', appointmentId)
        .select();
      
      logDatabaseOperation('UPDATE', 'agendamentos', { data, error });
      
      return { 
        data, 
        error: error || null, 
        success: !error && data !== null 
      };
    } catch (error) {
      logAppointmentError('Erro inesperado ao atualizar status', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  /**
   * Reschedules an appointment in the database
   */
  const rescheduleAppointment = async (
    appointmentId: string,
    date: Date | string,
    time: string
  ): Promise<DatabaseResult> => {
    try {
      if (!appointmentId || appointmentId.trim() === '') {
        return { 
          data: null, 
          error: new Error('ID de agendamento inválido'), 
          success: false 
        };
      }

      const formattedDate = date instanceof Date 
        ? date.toISOString().split('T')[0]
        : date;

      const updateData = { 
        data: formattedDate, 
        hora: time 
      };

      logAppointmentAction('Executando reagendamento no banco', appointmentId, updateData);

      const { data, error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', appointmentId)
        .select();
      
      logDatabaseOperation('UPDATE', 'agendamentos', { data, error });
      
      return { 
        data, 
        error: error || null, 
        success: !error && data !== null 
      };
    } catch (error) {
      logAppointmentError('Erro inesperado ao reagendar', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  /**
   * Creates a history entry for an appointment action
   */
  const createHistoryEntry = async (
    appointmentId: string,
    tipo: string,
    descricao: string,
    novoValor?: string,
    detalhes?: any
  ): Promise<DatabaseResult> => {
    try {
      if (!appointmentId) {
        return { 
          data: null, 
          error: new Error('ID de agendamento inválido'), 
          success: false 
        };
      }

      const historyData = {
        agendamento_id: appointmentId,
        tipo,
        descricao,
        novo_valor: novoValor
      };

      logAppointmentAction('Criando entrada no histórico', appointmentId, historyData);

      const { data, error } = await supabase
        .from('agendamento_historico')
        .insert(historyData)
        .select();
      
      logDatabaseOperation('INSERT', 'agendamento_historico', { data, error });
      
      return { 
        data, 
        error: error || null, 
        success: !error 
      };
    } catch (error) {
      logAppointmentError('Erro ao criar histórico', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };
  
  /**
   * Deletes an appointment and its history using a database function
   * This ensures all operations occur in a single transaction
   */
  const deleteAppointmentWithHistory = async (appointmentId: string): Promise<DatabaseResult> => {
    try {
      if (!appointmentId) {
        return { 
          data: null, 
          error: new Error('ID de agendamento inválido'), 
          success: false 
        };
      }

      logAppointmentAction('Excluindo agendamento e histórico via função SQL', appointmentId);
      
      const { data, error } = await supabase
        .rpc('delete_appointment_with_history', {
          appointment_id: appointmentId
        });
      
      // The RPC returns a boolean success indicator
      logDatabaseOperation('RPC', 'delete_appointment_with_history', { 
        success: data, 
        error,
        appointmentId 
      });
      
      return { 
        data, 
        error: error || null, 
        success: data === true && !error 
      };
    } catch (error) {
      logAppointmentError('Erro ao excluir agendamento e histórico', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  /**
   * Fetches an appointment by ID
   */
  const getAppointmentById = async (appointmentId: string): Promise<DatabaseResult> => {
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
      logAppointmentError('Erro ao buscar agendamento', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return {
    getAdminId,
    updateAppointmentStatus,
    rescheduleAppointment,
    createHistoryEntry,
    deleteAppointmentWithHistory,
    getAppointmentById
  };
};

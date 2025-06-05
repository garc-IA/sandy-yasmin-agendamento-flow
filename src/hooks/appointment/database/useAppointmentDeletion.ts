
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { DatabaseResult } from "../useAppointmentTypes";

/**
 * Hook for handling appointment deletion operations in the database
 */
export const useAppointmentDeletion = () => {
  /**
   * Deletes an appointment and its history
   */
  const deleteAppointmentWithHistory = async (appointmentId: string): Promise<DatabaseResult> => {
    try {
      // Log the deletion attempt
      logger.info(`🗑️ Attempting to delete appointment: ${appointmentId}`);
      
      // Use the improved database function to delete the appointment and its history
      const { data, error } = await supabase
        .rpc('delete_appointment_with_history', {
          appointment_id: appointmentId
        });
      
      if (error) {
        logger.error("❌ Error deleting appointment:", error);
        return {
          data: null,
          error: error || null,
          success: false
        };
      }
      
      logger.database.operation('RPC', 'delete_appointment_with_history', { success: true, appointmentId });
      logger.info(`✅ Successfully deleted appointment: ${appointmentId}`);

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      logger.appointment.error('Erro ao excluir agendamento e histórico', appointmentId, error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        success: false 
      };
    }
  };

  return { deleteAppointmentWithHistory };
};

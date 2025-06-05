
import { AppointmentStatus } from "@/types/appointment.types";
import { useAppointmentCore } from "./database/useAppointmentCore";
import { useAppointmentStatus } from "./database/useAppointmentStatus";
import { useAppointmentRescheduling } from "./database/useAppointmentRescheduling";
import { useAppointmentHistory } from "./database/useAppointmentHistory";
import { useAppointmentDeletion } from "./database/useAppointmentDeletion";

// Re-export the DatabaseResult type for backwards compatibility
export type { DatabaseResult } from "./useAppointmentTypes";

/**
 * Unified hook for all database operations related to appointments
 * Acts as a facade for specialized database operation hooks
 */
export const useAppointmentDatabase = () => {
  const core = useAppointmentCore();
  const status = useAppointmentStatus();
  const rescheduling = useAppointmentRescheduling();
  const history = useAppointmentHistory();
  const deletion = useAppointmentDeletion();

  return {
    // Core operations
    getAdminId: core.getAdminId,
    getAppointmentById: core.getAppointmentById,
    
    // Status operations
    updateAppointmentStatus: status.updateAppointmentStatus,
    
    // Rescheduling operations
    rescheduleAppointment: rescheduling.rescheduleAppointment,
    
    // History operations
    createHistoryEntry: history.createHistoryEntry,
    getAppointmentHistory: history.getAppointmentHistory,
    
    // Deletion operations
    deleteAppointmentWithHistory: deletion.deleteAppointmentWithHistory,
  };
};


/**
 * Hook consolidado para operações de agendamento - refatorado
 * Agora usa hooks especializados para melhor organização
 */
import { useAppointmentStatusOperations } from './operations/useAppointmentStatusOperations';
import { useAppointmentRescheduleOperations } from './operations/useAppointmentRescheduleOperations';
import { useAppointmentDeleteOperations } from './operations/useAppointmentDeleteOperations';

/**
 * Consolidated hook for all appointment operations
 * Now acts as a facade for specialized operation hooks
 */
export const useAppointmentOperations = () => {
  const statusOps = useAppointmentStatusOperations();
  const rescheduleOps = useAppointmentRescheduleOperations();
  const deleteOps = useAppointmentDeleteOperations();

  // Combine loading states
  const isLoading = statusOps.isLoading || rescheduleOps.isLoading || deleteOps.isLoading;

  return {
    // Core operations
    updateStatus: statusOps.updateStatus,
    reschedule: rescheduleOps.reschedule,
    deleteAppointment: deleteOps.deleteAppointment,
    
    // Convenience methods
    completeAppointment: statusOps.completeAppointment,
    cancelAppointment: statusOps.cancelAppointment,
    
    // State
    isLoading,
  };
};

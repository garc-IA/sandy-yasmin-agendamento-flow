
import { useAppointmentOperations } from './useAppointmentOperations';

/**
 * @deprecated Use useAppointmentOperations instead
 * This hook is kept for backward compatibility
 */
export const useAppointmentActions = () => {
  console.warn('useAppointmentActions is deprecated. Use useAppointmentOperations instead.');
  return useAppointmentOperations();
};

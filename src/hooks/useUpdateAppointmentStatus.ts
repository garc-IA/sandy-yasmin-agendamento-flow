
import { useAppointmentOperations } from './appointment/useAppointmentOperations';

/**
 * @deprecated Use useAppointmentOperations instead
 * This hook is kept for backward compatibility
 */
export const useUpdateAppointmentStatus = () => {
  console.warn('useUpdateAppointmentStatus is deprecated. Use useAppointmentOperations instead.');
  return useAppointmentOperations();
};

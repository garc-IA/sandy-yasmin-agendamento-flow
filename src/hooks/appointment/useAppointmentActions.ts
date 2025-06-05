
import { useAppointmentOperations } from './useAppointmentOperations';
import { logger } from '@/utils/logger';

/**
 * @deprecated Use useAppointmentOperations instead
 * Este hook é mantido para compatibilidade reversa
 */
export const useAppointmentActions = () => {
  logger.warn('useAppointmentActions está obsoleto. Use useAppointmentOperations.');
  return useAppointmentOperations();
};

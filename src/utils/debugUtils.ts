
/**
 * Utility functions for debugging appointment issues
 * Atualizado para usar o novo sistema de logging consolidado
 */
import { logger, validateAppointmentId as baseValidateAppointmentId } from '@/utils/logger';

// Re-export das funções principais do novo logger para compatibilidade
export const logAppointmentAction = logger.appointment.action;
export const logAppointmentError = logger.appointment.error;
export const traceAppointmentFlow = logger.appointment.flow;
export const logUIEvent = logger.ui.event;
export const logDatabaseOperation = logger.database.operation;
export const logStackTrace = logger.trace;
export const validateAppointmentId = baseValidateAppointmentId;

// Funções específicas mantidas para compatibilidade
export const debugAppointmentState = (component: string, state: any) => {
  logger.debug(`[${component}] State:`, state);
};

export const logDialogState = (dialog: string, isOpen: boolean, data?: any) => {
  logger.ui.dialog(dialog, isOpen, data);
};

export const verifyIdConsistency = (componentName: string, expectedId: string | null, actualId: string | null) => {
  const isConsistent = expectedId === actualId;
  const level = isConsistent ? 'info' : 'error';
  
  logger[level](`[ID CONSISTENCY] ${componentName}: ${isConsistent ? 'OK' : 'FALHA'}`, {
    expected: expectedId,
    actual: actualId
  });
  
  return isConsistent;
};

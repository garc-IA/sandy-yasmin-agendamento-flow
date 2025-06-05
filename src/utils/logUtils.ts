
/**
 * Utilitário para logging unificado na aplicação
 * Atualizado para usar o novo sistema consolidado
 */
import { logger } from '@/utils/logger';

// Re-export das funções principais do novo logger
export const logError = logger.error;
export const logWarn = logger.warn;
export const logInfo = logger.info;
export const logDebug = logger.debug;
export const logTrace = logger.trace;

// Funções específicas mantidas
export const logAppointment = logger.appointment.action;
export const logCache = logger.cache.action;

// Timing functions
export const logTiming = (label: string, startTime: number): void => {
  const duration = performance.now() - startTime;
  logger.debug(`TEMPO [${label}] ${duration.toFixed(2)}ms`);
};

export const startTiming = logger.timing.start;

// UI logging
export const logUI = (action: string, component: string, ...details: any[]): void => {
  logger.ui.event(`[${action}] ${component}`, details);
};


/**
 * Sistema de logging consolidado e padronizado
 * Substitui os múltiplos sistemas de log existentes
 */

// Configuração centralizada de níveis de log
const LOG_CONFIG = {
  ERROR: true,
  WARN: true,
  INFO: true,
  DEBUG: process.env.NODE_ENV === 'development',
  TRACE: false
};

// Tipos para melhor tipagem
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
type LogContext = 'APPOINTMENT' | 'UI' | 'DATABASE' | 'CACHE' | 'AUTH' | 'GENERAL';

// Interface para logs estruturados
interface LogEntry {
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: any;
  timestamp: string;
  id?: string;
}

// Função base para logging estruturado
function createLogEntry(level: LogLevel, context: LogContext, message: string, data?: any, id?: string): LogEntry {
  return {
    level,
    context,
    message,
    data,
    timestamp: new Date().toISOString(),
    id
  };
}

// Função base para output do log
function outputLog(entry: LogEntry): void {
  if (!LOG_CONFIG[entry.level]) return;

  const prefix = getLogPrefix(entry.level, entry.context);
  const idSuffix = entry.id ? ` | ID: ${entry.id}` : '';
  
  const logFn = getLogFunction(entry.level);
  logFn(`${prefix} ${entry.message}${idSuffix}`, entry.data || '');
}

// Helpers internos
function getLogPrefix(level: LogLevel, context: LogContext): string {
  const icons = { ERROR: '❌', WARN: '⚠️', INFO: 'ℹ️', DEBUG: '🔍', TRACE: '📋' };
  return `${icons[level]} [${context}]`;
}

function getLogFunction(level: LogLevel): Function {
  switch (level) {
    case 'ERROR': return console.error;
    case 'WARN': return console.warn;
    default: return console.log;
  }
}

// API pública do logger
export const logger = {
  // Logs gerais
  error: (message: string, data?: any) => 
    outputLog(createLogEntry('ERROR', 'GENERAL', message, data)),
  
  warn: (message: string, data?: any) => 
    outputLog(createLogEntry('WARN', 'GENERAL', message, data)),
  
  info: (message: string, data?: any) => 
    outputLog(createLogEntry('INFO', 'GENERAL', message, data)),
  
  debug: (message: string, data?: any) => 
    outputLog(createLogEntry('DEBUG', 'GENERAL', message, data)),

  // Logs específicos por contexto
  appointment: {
    action: (action: string, id: string, data?: any) => 
      outputLog(createLogEntry('INFO', 'APPOINTMENT', action, data, id)),
    
    error: (message: string, id: string, error?: any) => 
      outputLog(createLogEntry('ERROR', 'APPOINTMENT', message, error, id)),
    
    flow: (step: string, id: string, data?: any) => 
      outputLog(createLogEntry('DEBUG', 'APPOINTMENT', step, data, id)),
  },

  ui: {
    event: (event: string, details?: any) => 
      outputLog(createLogEntry('TRACE', 'UI', event, details)),
    
    dialog: (dialog: string, isOpen: boolean, data?: any) => 
      outputLog(createLogEntry('DEBUG', 'UI', `${dialog}: ${isOpen ? 'Aberto' : 'Fechado'}`, data)),
  },

  database: {
    operation: (operation: string, table: string, result: any) => {
      const level = result.error ? 'ERROR' : 'INFO';
      const message = result.error 
        ? `Erro em operação ${operation} na tabela ${table}`
        : `Operação ${operation} na tabela ${table} concluída`;
      
      outputLog(createLogEntry(level, 'DATABASE', message, {
        operation,
        table,
        success: !result.error,
        affectedRows: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
        error: result.error
      }));
    },
  },

  cache: {
    action: (action: string, queryKeys: string[], data?: any) => 
      outputLog(createLogEntry('DEBUG', 'CACHE', `${action} ${queryKeys.join(', ')}`, data)),
    
    refresh: (context: string) => 
      outputLog(createLogEntry('INFO', 'CACHE', `Atualizando cache: ${context}`)),
  },

  // Utilitários
  timing: {
    start: (label: string): (() => void) => {
      const start = performance.now();
      return () => {
        const duration = performance.now() - start;
        outputLog(createLogEntry('DEBUG', 'GENERAL', `TEMPO [${label}] ${duration.toFixed(2)}ms`));
      };
    }
  },

  trace: (message: string) => {
    outputLog(createLogEntry('TRACE', 'GENERAL', message));
    console.trace();
  }
};

// Exportações para compatibilidade com código existente
export const logAppointmentAction = logger.appointment.action;
export const logAppointmentError = logger.appointment.error;
export const traceAppointmentFlow = logger.appointment.flow;
export const logUIEvent = logger.ui.event;
export const logDatabaseOperation = logger.database.operation;
export const logCache = logger.cache.action;
export const logStackTrace = logger.trace;

// Utilitários de validação
export const validateAppointmentId = (id: string | null | undefined): boolean => {
  if (!id) {
    logger.appointment.error("ID inválido", "validation", { providedId: id });
    return false;
  }
  return true;
};

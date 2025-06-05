
/**
 * Utilitário para tratar e logar erros de forma consistente
 * Atualizado para usar o novo sistema de logging consolidado
 */
import { logger } from '@/utils/logger';

// Função para logar erros no console com formatação melhorada
export function logError(
  context: string, 
  error: unknown, 
  additionalInfo?: Record<string, any>
): void {
  logger.error(`Erro em ${context}`, { error, additionalInfo });
}

// Função para logar erros de agendamento
export function logAppointmentError(
  action: string,
  appointmentId: string | null | undefined,
  error: unknown
): void {
  logger.appointment.error(`${action}`, appointmentId || 'unknown', error);
}

// Função para logar operações de banco de dados
export function logDatabaseOperation(
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'RPC',
  table: string,
  result: { data?: any; error?: any; success?: boolean }
): void {
  logger.database.operation(operation, table, result);
}

// Função para obter mensagem de erro amigável
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Tratar erros comuns e dar mensagens mais amigáveis
    if (error.message.includes('foreign key constraint')) {
      return 'Este registro está sendo usado em outro lugar e não pode ser excluído.';
    }
    
    if (error.message.includes('timeout')) {
      return 'A operação demorou muito tempo. Verifique sua conexão e tente novamente.';
    }
    
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Ocorreu um erro inesperado. Tente novamente.';
}


import { format, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Verifica se uma data e hora já passaram com referência a agora
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns true se a data/hora já passou, false caso contrário
 */
export function isInPast(dateStr: string, timeStr: string): boolean {
  try {
    // Obter a data atual
    const now = new Date();
    
    // Criar uma data com a data e hora do agendamento
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Criar a data do agendamento no fuso horário de Brasília (UTC-3)
    // Adicionamos 3 horas ao horário para converter de Brasília para UTC
    const appointmentDate = new Date(Date.UTC(year, month - 1, day, hours + 3, minutes));
    
    console.log(`Verificando se data está no passado:
    - Data atual (UTC): ${now.toISOString()}
    - Data do agendamento ajustado para UTC: ${appointmentDate.toISOString()}
    - Resultado: ${now > appointmentDate ? 'SIM' : 'NÃO'}`);
    
    // Comparar as datas diretamente
    return now > appointmentDate;
  } catch (e) {
    console.error('Erro ao verificar se data está no passado:', e);
    return false;
  }
}

/**
 * Formata uma data para exibição em português
 * @param date Data como string ou objeto Date
 * @param formatStr Formato desejado (padrão: dd 'de' MMMM 'de' yyyy)
 * @returns String formatada
 */
export function formatDate(
  date: string | Date | null | undefined, 
  formatStr: string = "dd 'de' MMMM 'de' yyyy"
): string {
  if (!date) return 'Data inválida';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return 'Data inválida';
  }
}

/**
 * Formata data e hora para exibição em português
 * @param date Data como string ou objeto Date
 * @param time String de hora no formato HH:MM
 * @returns String formatada como "dia de mês de ano às HH:MM"
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  time: string | null | undefined
): string {
  if (!date || !time) return 'Data/hora inválida';
  
  try {
    const formattedDate = formatDate(date);
    return `${formattedDate} às ${time}`;
  } catch (e) {
    console.error('Erro ao formatar data e hora:', e);
    return 'Data/hora inválida';
  }
}

/**
 * Formata uma data para o formato usado no WhatsApp
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns String formatada para WhatsApp (Ex: 01/05/2023 às 14:30)
 */
export function formatDateTimeForWhatsApp(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return '';
  
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
    return `${formattedDate} às ${timeStr}`;
  } catch (e) {
    console.error('Erro ao formatar data e hora para WhatsApp:', e);
    return '';
  }
}

/**
 * Converte uma string de data e hora para um objeto Date no UTC
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns Objeto Date no UTC
 */
export function dateTimeToUTC(dateStr: string, timeStr: string): Date | null {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Criar a data no fuso horário UTC
    // Ajustar para o fuso horário de Brasília (UTC-3)
    return new Date(Date.UTC(year, month - 1, day, hours + 3, minutes));
  } catch (e) {
    console.error('Erro ao converter data e hora para UTC:', e);
    return null;
  }
}

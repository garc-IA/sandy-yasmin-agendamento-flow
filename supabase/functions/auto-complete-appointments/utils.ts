
/**
 * Verifica se uma data e hora já passaram, considerando o fuso horário do Brasil (UTC-3)
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns true se a data/hora já passou, false caso contrário
 */
export function isInPast(dateStr: string, timeStr: string): boolean {
  try {
    // Obter a data atual no fuso horário UTC
    const now = new Date();
    
    // Criar uma data com a data e hora do agendamento
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Criar a data do agendamento no fuso horário UTC
    // Ajustar para o fuso horário de Brasília (UTC-3)
    // Adicionamos 3 horas ao horário UTC para corresponder à hora de Brasília
    const appointmentDate = new Date(Date.UTC(year, month - 1, day, hours + 3, minutes));
    
    console.log(`Comparando:
    - Data/hora agendamento: ${dateStr} ${timeStr} (${appointmentDate.toISOString()})
    - Data/hora atual: ${now.toISOString()}
    - Resultado: ${now > appointmentDate ? 'Passado' : 'Futuro'}`);
    
    // Comparar as datas diretamente
    return now > appointmentDate;
  } catch (e) {
    console.error('Erro ao verificar se data está no passado:', e);
    return false;
  }
}

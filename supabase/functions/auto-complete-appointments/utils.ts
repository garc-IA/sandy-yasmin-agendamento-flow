
/**
 * Verifica se uma data e hora já passaram, usando a mesma lógica da função SQL
 * @param dateStr Data no formato YYYY-MM-DD
 * @param timeStr Hora no formato HH:MM
 * @returns true se a data/hora já passou, false caso contrário
 */
export function isInPast(dateStr: string, timeStr: string): boolean {
  try {
    // Obter a data atual no timezone do Brasil (mesma lógica da função SQL)
    const nowBrazil = new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"});
    const now = new Date(nowBrazil);
    
    // Criar uma data com a data e hora do agendamento
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Criar a data do agendamento no timezone do Brasil
    const appointmentDate = new Date(year, month - 1, day, hours, minutes);
    
    console.log(`🕐 Comparando (Edge Function):
    - Data/hora agendamento: ${dateStr} ${timeStr} (${appointmentDate.toISOString()})
    - Data/hora atual Brasil: ${now.toISOString()}
    - Resultado: ${now > appointmentDate ? 'Passado' : 'Futuro'}`);
    
    // Comparar as datas diretamente
    return now > appointmentDate;
  } catch (e) {
    console.error('Erro ao verificar se data está no passado:', e);
    return false;
  }
}

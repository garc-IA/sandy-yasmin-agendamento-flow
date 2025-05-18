
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { isInPast } from './utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get current date and time in Brasilia time zone (UTC-3)
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    console.log(`🕒 Executando verificação de auto-complete em ${currentDate} ${currentTime} (horário do servidor)`);

    // Find all appointments that are still in "agendado" status
    const { data: scheduledAppointments, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'agendado');

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return new Response(
        JSON.stringify({ error: 'Falha ao buscar agendamentos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Filter appointments that are truly in the past
    const pastAppointments = scheduledAppointments.filter(appointment => 
      isInPast(appointment.data, appointment.hora)
    );
    
    console.log(`📋 Encontrados ${scheduledAppointments.length} agendamentos em status "agendado", ${pastAppointments.length} estão no passado`);

    if (pastAppointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum agendamento passado para completar', updated: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update all past appointments to "concluido" status
    const appointmentIds = pastAppointments.map(apt => apt.id);
    
    console.log(`🔄 Atualizando status de ${appointmentIds.length} agendamentos passados para "concluido"`);
    for (const appointment of pastAppointments) {
      console.log(`   - Agendamento ${appointment.id}: Data: ${appointment.data} Hora: ${appointment.hora}`);
    }
    
    const { data: updatedAppointments, error: updateError } = await supabase
      .from('agendamentos')
      .update({
        status: 'concluido'
      })
      .in('id', appointmentIds)
      .select();

    if (updateError) {
      console.error('Erro ao atualizar agendamentos passados:', updateError);
      return new Response(
        JSON.stringify({ error: 'Falha ao atualizar agendamentos passados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create history entries for each updated appointment
    const historyEntries = appointmentIds.map(id => ({
      agendamento_id: id,
      tipo: 'auto-completado',
      descricao: 'Agendamento marcado como concluído automaticamente',
      novo_valor: 'concluido'
    }));

    if (historyEntries.length > 0) {
      const { error: historyError } = await supabase
        .from('agendamento_historico')
        .insert(historyEntries);

      if (historyError) {
        console.error('Erro ao criar entradas no histórico:', historyError);
        // Não falhar a operação por erro no histórico, apenas logar
      }
    }
    
    console.log(`✅ Auto-completados com sucesso ${appointmentIds.length} agendamentos`);

    return new Response(
      JSON.stringify({ 
        message: 'Agendamentos passados auto-completados com sucesso', 
        updated: appointmentIds.length,
        appointments: updatedAppointments
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Erro inesperado:', err);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

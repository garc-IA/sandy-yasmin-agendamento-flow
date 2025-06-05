
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppointmentWithDetails {
  id: string;
  data: string;
  hora: string;
  cliente: { nome: string; telefone: string };
  servico: { nome: string; valor: number };
  profissional: { nome: string };
  lembrete_enviado_em: string | null;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('⏰ Iniciando verificação de lembretes de agendamentos');
    
    // Horário atual no Brasil
    const now = new Date();
    const nowBrazil = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    
    // Horário 1 hora a partir de agora (janela de lembrete)
    const oneHourFromNow = new Date(nowBrazil.getTime() + (60 * 60 * 1000));
    const reminderTimeStart = new Date(nowBrazil.getTime() + (55 * 60 * 1000)); // 55 min (5 min de tolerância)
    const reminderTimeEnd = new Date(nowBrazil.getTime() + (65 * 60 * 1000)); // 65 min (5 min de tolerância)
    
    console.log(`📅 Buscando agendamentos entre ${reminderTimeStart.toLocaleString('pt-BR')} e ${reminderTimeEnd.toLocaleString('pt-BR')}`);

    // Buscar agendamentos que precisam de lembrete (próximos 1 hora)
    const today = nowBrazil.toISOString().split('T')[0];
    const tomorrow = new Date(nowBrazil.getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    const { data: appointments, error: appointmentsError } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:clientes(*),
        servico:servicos(*),
        profissional:profissionais(*)
      `)
      .in('data', [today, tomorrow])
      .eq('status', 'agendado')
      .is('lembrete_enviado_em', null);

    if (appointmentsError) {
      console.error('❌ Erro ao buscar agendamentos:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`📋 Encontrados ${appointments?.length || 0} agendamentos sem lembrete`);

    let remindersCount = 0;
    const reminders: any[] = [];

    for (const appointment of appointments || []) {
      try {
        // Converter data e hora do agendamento para timestamp
        const appointmentDateTime = new Date(`${appointment.data}T${appointment.hora}:00-03:00`);
        
        console.log(`🔍 Verificando agendamento ${appointment.id}: ${appointmentDateTime.toLocaleString('pt-BR')}`);
        
        // Verificar se está na janela de lembrete (55-65 minutos antes)
        const timeDiff = appointmentDateTime.getTime() - nowBrazil.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        console.log(`⏱️ Diferença: ${minutesDiff.toFixed(1)} minutos`);
        
        if (minutesDiff >= 55 && minutesDiff <= 65) {
          console.log(`✅ Enviando lembrete para ${appointment.cliente.nome}`);
          
          // Gerar mensagem de lembrete
          const message = generateReminderMessage(appointment as AppointmentWithDetails);
          
          // Criar link do WhatsApp
          const whatsappUrl = createWhatsAppLink(appointment.cliente.telefone, message);
          
          // Marcar como lembrete enviado
          await supabase
            .from('agendamentos')
            .update({ lembrete_enviado_em: new Date().toISOString() })
            .eq('id', appointment.id);
          
          reminders.push({
            appointmentId: appointment.id,
            clientName: appointment.cliente.nome,
            clientPhone: appointment.cliente.telefone,
            whatsappUrl,
            message,
            appointmentTime: appointmentDateTime.toLocaleString('pt-BR')
          });
          
          remindersCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar agendamento ${appointment.id}:`, error);
      }
    }

    console.log(`📱 ${remindersCount} lembretes processados`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        remindersCount,
        reminders,
        currentTime: nowBrazil.toISOString(),
        message: `${remindersCount} lembrete(s) de agendamento processado(s)`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na função appointment-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateReminderMessage(appointment: AppointmentWithDetails): string {
  const appointmentDate = new Date(appointment.data + 'T12:00:00');
  const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  let message = `🔔 *Lembrete de Agendamento - Studio Sandy Yasmin*\n\n`;
  message += `Olá, ${appointment.cliente.nome}! 👋\n\n`;
  message += `Você tem um agendamento em *1 hora*:\n\n`;
  message += `📅 *Data:* ${formattedDate}\n`;
  message += `⏰ *Horário:* ${appointment.hora}\n`;
  message += `💅 *Serviço:* ${appointment.servico.nome}\n`;
  message += `👩‍💼 *Profissional:* ${appointment.profissional.nome}\n`;
  message += `💰 *Valor:* R$ ${appointment.servico.valor.toFixed(2)}\n\n`;
  message += `📍 Aguardamos você no *Studio Sandy Yasmin*!\n\n`;
  message += `_Caso precise remarcar, entre em contato conosco._\n\n`;
  message += `✨ *Studio Sandy Yasmin* 💅`;

  return message;
}

function createWhatsAppLink(phoneNumber: string, message: string): string {
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const fullPhone = formattedPhone.startsWith('55') 
    ? formattedPhone 
    : `55${formattedPhone}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
}

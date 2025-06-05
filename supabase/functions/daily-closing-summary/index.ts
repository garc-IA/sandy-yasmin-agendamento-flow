
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
  status: string;
  cliente: { nome: string; telefone: string };
  servico: { nome: string; valor: number };
  profissional: { nome: string };
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
    console.log('🌙 Iniciando resumo de encerramento do dia');
    
    // Buscar configurações do admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('telefone, nome, horario_fechamento')
      .eq('email', 'admin@studio.com')
      .single();

    if (adminError || !adminData?.telefone) {
      console.error('❌ Erro ao buscar dados do admin:', adminError);
      return new Response(
        JSON.stringify({ error: 'Dados do admin não encontrados' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Data de hoje
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Gerando resumo de encerramento para: ${today}`);

    // Buscar todos os agendamentos do dia
    const { data: appointments, error: appointmentsError } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:clientes(*),
        servico:servicos(*),
        profissional:profissionais(*)
      `)
      .eq('data', today)
      .order('hora');

    if (appointmentsError) {
      console.error('❌ Erro ao buscar agendamentos:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`📋 Encontrados ${appointments?.length || 0} agendamentos do dia`);

    // Gerar resumo de encerramento
    const message = generateClosingSummary(appointments as AppointmentWithDetails[], today, adminData.horario_fechamento);
    
    // Criar link do WhatsApp
    const whatsappUrl = createWhatsAppLink(adminData.telefone, message);
    
    console.log('📱 Resumo de encerramento gerado');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        totalAppointments: appointments?.length || 0,
        whatsappUrl,
        message,
        adminName: adminData.nome,
        adminPhone: adminData.telefone,
        closingTime: adminData.horario_fechamento
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na função daily-closing-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateClosingSummary(appointments: AppointmentWithDetails[], date: string, closingTime: string): string {
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const agendados = appointments?.filter(a => a.status === 'agendado') || [];
  const concluidos = appointments?.filter(a => a.status === 'concluido') || [];
  const cancelados = appointments?.filter(a => a.status === 'cancelado') || [];

  let message = `🌙 *Resumo de Encerramento - ${formattedDate}*\n\n`;
  
  message += `📊 *Balanço do Dia:*\n`;
  message += `• Total de agendamentos: ${appointments?.length || 0}\n`;
  message += `• Atendimentos realizados: ${concluidos.length} ✅\n`;
  message += `• Não compareceram: ${agendados.length} ❌\n`;
  if (cancelados.length > 0) {
    message += `• Cancelamentos: ${cancelados.length} 🚫\n`;
  }
  message += `\n`;

  // Faturamento realizado
  const faturamentoRealizado = concluidos.reduce((total, apt) => total + apt.servico.valor, 0);
  const faturamentoPerdido = agendados.reduce((total, apt) => total + apt.servico.valor, 0);
  
  message += `💰 *Faturamento:*\n`;
  message += `• Realizado: R$ ${faturamentoRealizado.toFixed(2)} 💚\n`;
  if (faturamentoPerdido > 0) {
    message += `• Perdido (faltas): R$ ${faturamentoPerdido.toFixed(2)} 💔\n`;
  }
  message += `\n`;

  // Clientes atendidos
  if (concluidos.length > 0) {
    message += `👥 *Clientes Atendidos:*\n`;
    concluidos.forEach((apt, index) => {
      message += `${index + 1}. ${apt.cliente.nome} - ${apt.servico.nome}\n`;
    });
    message += `\n`;
  }

  // Faltas (não compareceram)
  if (agendados.length > 0) {
    message += `⚠️ *Não Compareceram:*\n`;
    agendados.forEach((apt, index) => {
      message += `${index + 1}. ${apt.hora} - ${apt.cliente.nome}\n`;
    });
    message += `\n`;
  }

  // Buscar agendamentos de amanhã
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  
  message += `🗓️ *Próximos Agendamentos (Amanhã):*\n`;
  message += `_Verificar agenda para ${tomorrow.toLocaleDateString('pt-BR')}_\n\n`;

  message += `✨ Ótimo trabalho hoje!\n`;
  message += `Expediente encerrado às ${closingTime} 🏠\n\n`;
  message += `*Studio Sandy Yasmin* 💅`;

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

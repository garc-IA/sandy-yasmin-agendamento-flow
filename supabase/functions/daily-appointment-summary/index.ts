
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
    console.log('🚀 Iniciando resumo diário de agendamentos');
    
    // Buscar configurações do sistema (número da Sandy)
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('telefone, nome')
      .eq('email', 'admin@studio.com')
      .single();

    if (adminError || !adminData?.telefone) {
      console.error('❌ Erro ao buscar dados do admin:', adminError);
      return new Response(
        JSON.stringify({ error: 'Dados do admin não encontrados' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Data de hoje no formato brasileiro
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Buscando agendamentos para: ${today}`);

    // Buscar agendamentos do dia
    const { data: appointments, error: appointmentsError } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:clientes(*),
        servico:servicos(*),
        profissional:profissionais(*)
      `)
      .eq('data', today)
      .in('status', ['agendado', 'concluido'])
      .order('hora');

    if (appointmentsError) {
      console.error('❌ Erro ao buscar agendamentos:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`📋 Encontrados ${appointments?.length || 0} agendamentos`);

    // Gerar resumo da mensagem
    const message = generateDailySummary(appointments as AppointmentWithDetails[], today);
    
    // Enviar mensagem via WhatsApp
    const whatsappUrl = createWhatsAppLink(adminData.telefone, message);
    
    console.log('📱 Resumo gerado, pronto para envio via WhatsApp');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        appointmentsCount: appointments?.length || 0,
        whatsappUrl,
        message,
        adminName: adminData.nome,
        adminPhone: adminData.telefone
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na função daily-appointment-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateDailySummary(appointments: AppointmentWithDetails[], date: string): string {
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!appointments || appointments.length === 0) {
    return `🗓️ *Resumo do Dia - ${formattedDate}*

✨ Que bom! Hoje não há agendamentos marcados. 

Aproveite para:
• Organizar o studio
• Fazer marketing
• Descansar um pouco

*Studio Sandy Yasmin* 💅`;
  }

  const agendados = appointments.filter(a => a.status === 'agendado');
  const concluidos = appointments.filter(a => a.status === 'concluido');
  
  let message = `🗓️ *Resumo do Dia - ${formattedDate}*\n\n`;
  message += `📊 *Resumo Geral:*\n`;
  message += `• Total de agendamentos: ${appointments.length}\n`;
  message += `• Agendados: ${agendados.length}\n`;
  message += `• Concluídos: ${concluidos.length}\n\n`;

  if (agendados.length > 0) {
    message += `⏰ *Agendamentos de Hoje:*\n`;
    agendados.forEach((apt, index) => {
      message += `${index + 1}. ${apt.hora} - ${apt.cliente.nome}\n`;
      message += `   ${apt.servico.nome} (R$ ${apt.servico.valor.toFixed(2)})\n`;
      message += `   Profissional: ${apt.profissional.nome}\n\n`;
    });
  }

  // Calcular faturamento previsto
  const faturamentoPrevisto = agendados.reduce((total, apt) => total + apt.servico.valor, 0);
  const faturamentoRealizado = concluidos.reduce((total, apt) => total + apt.servico.valor, 0);

  message += `💰 *Faturamento:*\n`;
  message += `• Realizado: R$ ${faturamentoRealizado.toFixed(2)}\n`;
  message += `• Previsto hoje: R$ ${(faturamentoPrevisto + faturamentoRealizado).toFixed(2)}\n\n`;

  message += `✨ Tenha um ótimo dia de trabalho!\n\n`;
  message += `*Studio Sandy Yasmin* 💅`;

  return message;
}

function createWhatsAppLink(phoneNumber: string, message: string): string {
  // Formatar número (remover caracteres não numéricos)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  
  // Adicionar código do Brasil se não existir
  const fullPhone = formattedPhone.startsWith('55') 
    ? formattedPhone 
    : `55${formattedPhone}`;
  
  // Codificar mensagem
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
}

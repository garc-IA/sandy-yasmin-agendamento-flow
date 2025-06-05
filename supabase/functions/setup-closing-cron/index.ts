
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Configurando cron job para resumo de encerramento');
    
    // Buscar horário de fechamento do admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('horario_fechamento')
      .eq('email', 'admin@studio.com')
      .single();

    if (adminError || !adminData?.horario_fechamento) {
      return new Response(
        JSON.stringify({ error: 'Horário de fechamento não configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calcular horário do cron (1 hora após o fechamento)
    const [hours, minutes] = adminData.horario_fechamento.split(':');
    const closingHour = parseInt(hours);
    const cronHour = (closingHour + 1) % 24; // 1 hora depois
    
    // Converter para UTC (Brasil está UTC-3)
    const utcHour = (cronHour + 3) % 24;
    
    // Criar expressão cron (0 {hora} * * * = todo dia na hora especificada)
    const cronExpression = `0 ${utcHour} * * *`;
    
    const { data, error } = await supabase.rpc('cron_schedule', {
      job_name: 'daily-closing-summary',
      cron_expression: cronExpression,
      sql_command: `
        SELECT net.http_post(
          url := '${Deno.env.get('SUPABASE_URL')}/functions/v1/daily-closing-summary',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{"source": "cron"}'::jsonb
        );
      `
    });

    if (error) {
      console.error('❌ Erro ao configurar cron job de encerramento:', error);
      throw error;
    }

    console.log('✅ Cron job de encerramento configurado com sucesso');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cron job configurado para ${cronHour}h (1 hora após fechamento às ${adminData.horario_fechamento})`,
        cronExpression,
        closingTime: adminData.horario_fechamento,
        summaryTime: `${cronHour.toString().padStart(2, '0')}:00`,
        data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na configuração do cron job de encerramento:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

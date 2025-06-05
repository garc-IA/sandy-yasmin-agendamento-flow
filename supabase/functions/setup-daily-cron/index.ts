
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
    console.log('🔧 Configurando cron job para notificações diárias');
    
    // Criar/atualizar o cron job para executar às 8h da manhã (horário brasileiro)
    // 0 11 * * * = 11:00 UTC = 8:00 Brasil (UTC-3)
    const cronExpression = '0 11 * * *';
    
    const { data, error } = await supabase.rpc('cron_schedule', {
      job_name: 'daily-appointment-summary',
      cron_expression: cronExpression,
      sql_command: `
        SELECT net.http_post(
          url := '${Deno.env.get('SUPABASE_URL')}/functions/v1/daily-appointment-summary',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{"source": "cron"}'::jsonb
        );
      `
    });

    if (error) {
      console.error('❌ Erro ao configurar cron job:', error);
      throw error;
    }

    console.log('✅ Cron job configurado com sucesso');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron job configurado para executar às 8h da manhã',
        cronExpression,
        data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na configuração do cron job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

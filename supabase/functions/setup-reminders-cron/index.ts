
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
    console.log('🔧 Configurando cron job para lembretes de agendamentos');
    
    // Criar cron job que roda a cada 15 minutos (mais preciso para lembretes)
    const { data, error } = await supabase.rpc('cron_schedule', {
      job_name: 'appointment-reminders',
      cron_expression: '*/15 * * * *', // A cada 15 minutos
      sql_command: `
        SELECT net.http_post(
          url := '${Deno.env.get('SUPABASE_URL')}/functions/v1/appointment-reminders',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{"source": "cron"}'::jsonb
        );
      `
    });

    if (error) {
      console.error('❌ Erro ao configurar cron job de lembretes:', error);
      throw error;
    }

    console.log('✅ Cron job de lembretes configurado com sucesso');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron job de lembretes configurado para rodar a cada 15 minutos',
        cronExpression: '*/15 * * * *',
        description: 'Verifica e envia lembretes 1 hora antes dos agendamentos',
        data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na configuração do cron job de lembretes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

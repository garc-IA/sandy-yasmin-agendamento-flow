
// This Edge Function is designed to be called by a cron job scheduler
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

Deno.serve(async (req) => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 500 }
      );
    }

    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🕒 Cron job iniciado: executando auto-complete-appointments');
    
    // Call the auto-complete-appointments function
    const { data, error } = await supabase.functions.invoke('auto-complete-appointments');
    
    if (error) {
      console.error('Erro ao chamar auto-complete-appointments:', error);
      return new Response(
        JSON.stringify({ error: 'Falha ao executar auto-complete' }),
        { status: 500 }
      );
    }
    
    console.log('🕒 Cron job para auto-complete executado com sucesso:', data);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron job auto-complete executado', 
        result: data,
        timestamp: new Date().toISOString()
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error('Erro inesperado no cron job:', err);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    );
  }
});


// This Edge Function is designed to be called by a cron job scheduler
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

// Adicionar cabeçalhos CORS
const headers = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  
  try {
    console.log('🕒 Cron job iniciado: executando auto-complete-appointments');
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 500, headers }
      );
    }

    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Use the database function directly for better performance and reliability
    const { data, error } = await supabase
      .rpc('auto_complete_past_appointments');
    
    if (error) {
      console.error('Erro ao executar auto_complete_past_appointments:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers }
      );
    }

    // Filter the results to only include updates
    const updated = data ? data.filter((item: any) => item.updated === true) : [];
    const totalUpdated = updated.length;

    console.log(`✅ Cron job auto-complete executado: ${totalUpdated} agendamentos atualizados`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: totalUpdated,
        details: updated,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers }
    );

  } catch (err) {
    console.error('Erro inesperado no cron job:', err);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers }
    );
  }
});

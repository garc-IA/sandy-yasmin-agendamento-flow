
// This Edge Function automatically completes past appointments 
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';
import { isInPast } from './utils.ts';

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
    console.log("🤖 Auto-complete appointments function started");
    
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
    
    // Use the new database function to auto-complete past appointments
    const { data, error } = await supabase
      .rpc('auto_complete_past_appointments');
    
    if (error) {
      console.error('Error running auto_complete_past_appointments:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers }
      );
    }

    // Filter the results to only include updates
    const updated = data ? data.filter((item: any) => item.updated === true) : [];
    const totalUpdated = updated.length;

    console.log(`✅ Auto-complete completed: ${totalUpdated} appointments were updated`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: totalUpdated,
        details: updated,
        timestamp: new Date().toISOString()
      }),
      { headers }
    );

  } catch (err) {
    console.error('Unexpected error in auto-complete function:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers }
    );
  }
});

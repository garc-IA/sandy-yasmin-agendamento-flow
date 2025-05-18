
// Follow imports from https://esm.sh/
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { isInPast } from "./utils.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Define o tipo de resposta da função
interface AutoCompleteResponse {
  success: boolean;
  updated: number;
  errors: string[];
  message: string;
}

// Cabeçalhos para CORS
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
    // Inicialização do cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          updated: 0,
          errors: ["Chaves de ambiente do Supabase não encontradas"],
          message: "Erro de configuração do servidor",
        } as AutoCompleteResponse),
        { status: 500, headers }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("🔍 Buscando agendamentos passados com status 'agendado'...");
    
    // Buscar todos os agendamentos com status "agendado"
    const { data: appointments, error: fetchError } = await supabase
      .from("agendamentos")
      .select("id, data, hora, status")
      .eq("status", "agendado");

    if (fetchError) {
      console.error("❌ Erro ao buscar agendamentos:", fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          updated: 0,
          errors: [fetchError.message],
          message: "Erro ao buscar agendamentos",
        } as AutoCompleteResponse),
        { status: 500, headers }
      );
    }

    console.log(`🔢 Encontrados ${appointments?.length || 0} agendamentos com status 'agendado'`);
    
    // Filtrar agendamentos que estão no passado
    const pastAppointments = appointments?.filter(appointment => 
      isInPast(appointment.data, appointment.hora)
    ) || [];
    
    console.log(`⏱️ Destes, ${pastAppointments.length} estão no passado e precisam ser atualizados`);
    
    if (pastAppointments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          updated: 0,
          errors: [],
          message: "Nenhum agendamento passado encontrado para atualização",
        } as AutoCompleteResponse),
        { status: 200, headers }
      );
    }
    
    // Array para armazenar erros durante a atualização
    const errors: string[] = [];
    let updatedCount = 0;
    
    // Atualizar cada agendamento passado para status "concluido"
    for (const appointment of pastAppointments) {
      console.log(`🔄 Atualizando agendamento ${appointment.id} (${appointment.data} ${appointment.hora}) para 'concluido'`);
      
      // Atualizar o status do agendamento
      const { error: updateError } = await supabase
        .from("agendamentos")
        .update({ status: "concluido" })
        .eq("id", appointment.id);
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar agendamento ${appointment.id}:`, updateError);
        errors.push(`Erro ao atualizar ${appointment.id}: ${updateError.message}`);
      } else {
        updatedCount++;
        
        // Adicionar entrada no histórico
        await supabase
          .from("agendamento_historico")
          .insert({
            agendamento_id: appointment.id,
            tipo: "auto_complete",
            descricao: "Agendamento marcado automaticamente como concluído por estar no passado"
          });
      }
    }
    
    console.log(`✅ Atualização concluída: ${updatedCount} agendamentos atualizados, ${errors.length} erros`);
    
    // Retornar resultado
    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        errors,
        message: `${updatedCount} agendamentos foram automaticamente marcados como concluídos.`,
      } as AutoCompleteResponse),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        updated: 0,
        errors: [error.message || "Erro desconhecido"],
        message: "Ocorreu um erro inesperado durante o processamento",
      } as AutoCompleteResponse),
      { status: 500, headers }
    );
  }
});

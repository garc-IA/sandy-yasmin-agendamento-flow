
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentData } from "@/types/appointment.types";
import { logAppointmentAction, logAppointmentError } from "@/utils/debugUtils";

export const useConfirmation = () => {
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Finds a client by phone number or creates a new one
   * @param client The client data
   * @returns The client ID
   */
  const findOrCreateClient = async (client: AppointmentData["client"]) => {
    if (!client || !client.telefone) {
      logAppointmentError("Cliente ou telefone não informados", "unknown");
      throw new Error("Telefone do cliente é obrigatório.");
    }

    try {
      // Obtenha o ID do admin atual ou o padrão para o Studio Sandy Yasmin
      const adminData = await supabase
        .from("admins")
        .select("id")
        .eq("email", "admin@studio.com")
        .single();
      
      if (!adminData.data?.id) {
        logAppointmentError("Admin não encontrado", "unknown");
        throw new Error("Admin não encontrado.");
      }
      
      const adminId = adminData.data.id;
      
      // Use a função criar_cliente que agora aceita admin_id
      const { data, error } = await supabase
        .rpc('criar_cliente', {
          p_nome: client.nome,
          p_telefone: client.telefone,
          p_email: client.email,
          p_admin_id: adminId
        });

      if (error) {
        logAppointmentError("Erro ao criar/buscar cliente", "unknown", error);
        throw error;
      }

      if (!data) {
        logAppointmentError("Erro ao criar/buscar cliente: nenhum ID retornado", "unknown");
        throw new Error("Erro ao criar/buscar cliente.");
      }

      logAppointmentAction("Cliente encontrado ou criado", data);
      return data;
    } catch (error) {
      logAppointmentError("Erro em findOrCreateClient", "unknown", error);
      throw error;
    }
  };

  /**
   * Creates a new appointment in the database
   * @param appointmentData The appointment data
   * @param clientId The client ID
   * @returns The created appointment ID
   */
  const createAppointment = async (appointmentData: AppointmentData, clientId: string) => {
    // Get professional ID from either property
    const professionalId = appointmentData.professional_id || appointmentData.professional?.id;
    
    if (!professionalId) {
      logAppointmentError("Profissional não informado", "unknown");
      throw new Error("Profissional não selecionado.");
    }

    try {
      // Create the appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("agendamentos")
        .insert({
          cliente_id: clientId,
          servico_id: appointmentData.service.id,
          profissional_id: professionalId,
          data: appointmentData.date,
          hora: appointmentData.time,
          status: "agendado",
        })
        .select()
        .single();

      if (appointmentError) {
        logAppointmentError("Erro ao criar agendamento", "unknown", appointmentError);
        throw appointmentError;
      }

      if (!appointment?.id) {
        logAppointmentError("Agendamento criado sem ID", "unknown");
        throw new Error("Erro ao criar agendamento.");
      }

      // Create history entry for the new appointment
      const { error: historyError } = await supabase
        .from("agendamento_historico")
        .insert({
          agendamento_id: appointment.id,
          tipo: "agendado",
          descricao: "Novo agendamento criado",
          novo_valor: "agendado"
        });

      if (historyError) {
        logAppointmentError("Erro ao registrar histórico", appointment.id, historyError);
        // We don't throw here as the appointment was created successfully
      }

      logAppointmentAction("Novo agendamento criado", appointment.id);
      return appointment.id;
    } catch (error) {
      logAppointmentError("Erro em createAppointment", "unknown", error);
      throw error;
    }
  };

  /**
   * Handles the confirmation of a new appointment
   * @param appointmentData The appointment data
   * @param setIsSubmitting Function to set the submitting state
   * @param setIsComplete Function to set the complete state
   */
  const handleConfirmation = async (
    appointmentData: AppointmentData,
    setIsSubmitting: (value: boolean) => void,
    setIsComplete: (value: boolean) => void
  ) => {
    // Validate required data
    if (!appointmentData.service || !appointmentData.date || !appointmentData.time || !appointmentData.client) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os dados do agendamento.",
        variant: "destructive",
      });
      logAppointmentError("Dados incompletos na confirmação", "unknown", appointmentData);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or find the client
      const clientId = appointmentData.client.id || await findOrCreateClient(appointmentData.client);
      
      // Create the appointment
      const newAppointmentId = await createAppointment(appointmentData, clientId);

      // Update the state with the new appointment ID
      setAppointmentId(newAppointmentId);
      setIsComplete(true);
      
      logAppointmentAction("Confirmação de agendamento bem-sucedida", newAppointmentId);
    } catch (error: unknown) {
      logAppointmentError("Erro ao confirmar agendamento", "unknown", error);

      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
      toast({
        title: "Erro ao confirmar agendamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    appointmentId,
    handleConfirmation,
  };
};

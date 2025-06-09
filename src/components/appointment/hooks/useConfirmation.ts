
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
      // Check if client already exists
      const { data: existingClient, error: checkError } = await supabase
        .from("clientes")
        .select("*")
        .eq("telefone", client.telefone)
        .maybeSingle();

      if (checkError) {
        logAppointmentError("Erro ao verificar cliente existente", "unknown", checkError);
        throw checkError;
      }

      // Return existing client ID if found
      if (existingClient) {
        logAppointmentAction("Cliente existente encontrado", existingClient.id);
        return existingClient.id;
      }

      // Create new client if not found
      const { data: newClient, error: clientError } = await supabase
        .from("clientes")
        .insert({
          nome: client.nome,
          telefone: client.telefone,
          email: client.email,
        })
        .select()
        .single();

      if (clientError) {
        logAppointmentError("Erro ao criar novo cliente", "unknown", clientError);
        throw clientError;
      }

      if (!newClient?.id) {
        logAppointmentError("Cliente criado sem ID", "unknown");
        throw new Error("Erro ao criar novo cliente.");
      }

      logAppointmentAction("Novo cliente criado", newClient.id);
      return newClient.id;
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

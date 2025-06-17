
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentData } from "@/types/appointment.types";

export const useConfirmation = () => {
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const { toast } = useToast();

  const findOrCreateClient = async (client: AppointmentData["client"]) => {
    if (!client || !client.telefone) {
      throw new Error("Telefone do cliente é obrigatório.");
    }

    try {
      const adminData = await supabase
        .from("admins")
        .select("id")
        .eq("email", "admin@studio.com")
        .single();
      
      if (!adminData.data?.id) {
        throw new Error("Admin não encontrado.");
      }
      
      const adminId = adminData.data.id;
      
      const { data, error } = await supabase
        .rpc('criar_cliente', {
          p_nome: client.nome,
          p_telefone: client.telefone,
          p_email: client.email,
          p_admin_id: adminId
        });

      if (error) throw error;
      if (!data) throw new Error("Erro ao criar/buscar cliente.");

      return data;
    } catch (error) {
      console.error("Erro em findOrCreateClient:", error);
      throw error;
    }
  };

  const createAppointment = async (appointmentData: AppointmentData, clientId: string) => {
    const professionalId = appointmentData.professional_id || appointmentData.professional?.id;
    
    if (!professionalId) {
      throw new Error("Profissional não selecionado.");
    }

    try {
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

      if (appointmentError) throw appointmentError;
      if (!appointment?.id) throw new Error("Erro ao criar agendamento.");

      const { error: historyError } = await supabase
        .from("agendamento_historico")
        .insert({
          agendamento_id: appointment.id,
          tipo: "agendado",
          descricao: "Novo agendamento criado",
          novo_valor: "agendado"
        });

      if (historyError) {
        console.warn("Erro ao registrar histórico:", historyError);
      }

      return appointment.id;
    } catch (error) {
      console.error("Erro em createAppointment:", error);
      throw error;
    }
  };

  const handleConfirmation = async (
    appointmentData: AppointmentData,
    setIsSubmitting: (value: boolean) => void,
    setIsComplete: (value: boolean) => void
  ) => {
    if (!appointmentData.service || !appointmentData.date || !appointmentData.time || !appointmentData.client) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os dados do agendamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const clientId = appointmentData.client.id || await findOrCreateClient(appointmentData.client);
      const newAppointmentId = await createAppointment(appointmentData, clientId);

      setAppointmentId(newAppointmentId);
      setIsComplete(true);
      
      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi criado com sucesso.",
      });
    } catch (error: unknown) {
      console.error("Erro ao confirmar agendamento:", error);

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


import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useAppointmentCache } from "@/hooks/appointment/useAppointmentCache";
import { logger } from "@/utils/logger";

export function useAppointmentsData() {
  const queryClient = useQueryClient();
  
  // Estados para filtros
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { forceRefetchAll } = useAppointmentCache();

  // Função para obter o ID do admin
  const getAdminId = async () => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("email", "admin@studio.com")
        .single();
      
      if (error) throw error;
      if (!data?.id) throw new Error("Admin não encontrado");
      
      return data.id;
    } catch (error) {
      logger.error("Erro ao obter ID do admin", error);
      return null;
    }
  };

  // Chave de query estável que inclui todos os filtros
  const appointmentsQueryKey = [
    "appointments",
    selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
    statusFilter,
    professionalFilter,
    searchQuery
  ];

  // Buscar agendamentos
  const { 
    data: appointments = [], 
    isLoading, 
    refetch,
    error
  } = useQuery({
    queryKey: appointmentsQueryKey,
    queryFn: async () => {
      try {
        logger.info("Buscando agendamentos com filtros", { 
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
          status: statusFilter, 
          professional: professionalFilter,
          search: searchQuery
        });
        
        let query = supabase
          .from("agendamentos")
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `);
        
        // Aplicar filtro de data
        if (selectedDate) {
          query = query.eq("data", format(selectedDate, "yyyy-MM-dd"));
        }
        
        // Aplicar filtro de status
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }
        
        // Aplicar filtro de profissional
        if (professionalFilter !== "all") {
          query = query.eq("profissional_id", professionalFilter);
        }
        
        const { data, error } = await query.order("hora");
        
        if (error) {
          logger.error("Erro ao buscar agendamentos", error);
          throw error;
        }
        
        logger.info(`Recuperados ${data?.length || 0} agendamentos`);
        
        // Aplicar filtro de busca no lado do cliente
        if (searchQuery && data) {
          const lowerQuery = searchQuery.toLowerCase();
          return data.filter((appointment: any) => 
            appointment.cliente.nome?.toLowerCase().includes(lowerQuery) ||
            appointment.cliente.telefone?.includes(searchQuery) ||
            appointment.cliente.email?.toLowerCase().includes(lowerQuery) ||
            appointment.servico.nome?.toLowerCase().includes(lowerQuery)
          );
        }
        
        return data || [];
      } catch (err) {
        logger.error("Falha ao buscar agendamentos", err);
        throw err;
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Buscar profissionais para filtro
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profissionais")
          .select("*")
          .order("nome");
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        logger.error("Falha ao buscar profissionais", err);
        return [];
      }
    },
  });

  // Lidar com atualização de agendamento
  const handleAppointmentUpdated = async () => {
    logger.info("Agendamento atualizado, atualizando dados...");
    
    // Forçar atualização completa do cache
    await forceRefetchAll();
    
    // Refetch específico para esta página com filtros atuais
    await refetch();
    
    // Atualizar dados do dashboard
    await queryClient.refetchQueries({ queryKey: ['dashboard-data'] });
    await queryClient.refetchQueries({ queryKey: ['upcoming-appointments'] });
    
    logger.info("Atualização de dados completa");
  };

  return {
    // Estado dos filtros
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    professionalFilter,
    setProfessionalFilter,
    searchQuery,
    setSearchQuery,
    
    // Dados
    appointments: appointments as AppointmentWithDetails[],
    professionals,
    isLoading,
    error,
    
    // Ações
    handleAppointmentUpdated,
    refetch,
    
    // Sempre mostrar todas as seções, independente do filtro
    showAll: true
  };
}

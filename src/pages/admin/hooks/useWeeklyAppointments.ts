
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

interface UseWeeklyAppointmentsProps {
  selectedDate: Date;
  professionalFilter: string;
}

// Retorna estado da semana, profissionais e agendamentos + funções auxiliares
export function useWeeklyAppointments({
  selectedDate,
  professionalFilter,
}: UseWeeklyAppointmentsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Configuração para começar a semana no domingo (0) seguindo padrão brasileiro
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0, locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0, locale: ptBR });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Gerar slots de tempo das 8h às 18h
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  // Buscar profissionais
  const { data: professionals, isLoading: isLoadingProfessionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profissionais")
          .select("*")
          .order("nome");

        if (error) {
          logger.error("Erro ao carregar profissionais", error);
          toast({
            title: "Erro ao carregar profissionais",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        return data || [];
      } catch (err) {
        logger.error("Erro ao buscar profissionais", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  // Buscar agendamentos da semana
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: [
      "week-appointments",
      format(weekStart, "yyyy-MM-dd"),
      format(weekEnd, "yyyy-MM-dd"),
      professionalFilter,
    ],
    queryFn: async () => {
      try {
        let query = supabase
          .from("agendamentos")
          .select(
            `
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `
          )
          .gte("data", format(weekStart, "yyyy-MM-dd"))
          .lte("data", format(weekEnd, "yyyy-MM-dd"))
          .neq("status", "cancelado");

        if (professionalFilter !== "all") {
          query = query.eq("profissional_id", professionalFilter);
        }

        const { data, error } = await query.order("data").order("hora");

        if (error) {
          logger.error("Erro ao carregar agendamentos", error);
          toast({
            title: "Erro ao carregar agendamentos",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        
        return data || [];
      } catch (err) {
        logger.error("Erro ao buscar agendamentos", err);
        throw err;
      }
    },
  });

  // Prefetch próxima semana quando a semana atual é carregada
  useEffect(() => {
    if (!isLoadingAppointments) {
      const nextWeekStart = addDays(weekStart, 7);
      const nextWeekEnd = addDays(weekEnd, 7);
      
      queryClient.prefetchQuery({
        queryKey: [
          "week-appointments",
          format(nextWeekStart, "yyyy-MM-dd"),
          format(nextWeekEnd, "yyyy-MM-dd"),
          professionalFilter,
        ],
        queryFn: async () => {
          let query = supabase
            .from("agendamentos")
            .select(
              `
              *,
              cliente:clientes(*),
              servico:servicos(*),
              profissional:profissionais(*)
            `
            )
            .gte("data", format(nextWeekStart, "yyyy-MM-dd"))
            .lte("data", format(nextWeekEnd, "yyyy-MM-dd"))
            .neq("status", "cancelado");

          if (professionalFilter !== "all") {
            query = query.eq("profissional_id", professionalFilter);
          }

          const { data, error } = await query.order("data").order("hora");
          if (error) throw error;
          return data || [];
        },
      });
    }
  }, [isLoadingAppointments, weekStart, weekEnd, professionalFilter, queryClient]);

  // Funções auxiliares para filtrar agendamentos
  const getAppointmentsForDayAndTime = (day: Date, time: string) => {
    if (!appointments) return [];
    const formattedDay = format(day, "yyyy-MM-dd");
    return appointments.filter(
      (appointment: any) =>
        appointment.data === formattedDay && appointment.hora === time
    );
  };

  const getAppointmentsForDay = (day: Date) => {
    if (!appointments) return [];
    const formattedDay = format(day, "yyyy-MM-dd");
    return appointments.filter(
      (appointment: any) => appointment.data === formattedDay
    );
  };

  return {
    professionals,
    appointments,
    isLoading: isLoadingProfessionals || isLoadingAppointments,
    weekStart,
    weekEnd,
    weekDays,
    timeSlots,
    getAppointmentsForDayAndTime,
    getAppointmentsForDay,
  };
}


import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Professional, Service } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { Block } from "@/pages/admin/blocks/types";

interface UseTimeSlotsProps {
  date: Date | undefined;
  selectedService: Service;
  professional: Professional | undefined;
  appointments: any[];
}

export const useTimeSlots = ({
  date,
  selectedService,
  professional,
  appointments
}: UseTimeSlotsProps) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bloqueios")
        .select("*");

      if (error) throw error;
      return data as Block[];
    },
  });

  useEffect(() => {
    if (!date || !selectedService || !professional) {
      setAvailableTimes([]);
      return;
    }

    const generateTimeSlots = () => {
      console.log("Gerando time slots para:", professional.nome);
      console.log("Dias de atendimento:", professional.dias_atendimento);
      console.log("Horário início:", professional.horario_inicio);
      console.log("Horário fim:", professional.horario_fim);
      
      const dayName = format(date, 'EEEE', { locale: ptBR });
      
      const dayMap: { [key: string]: string } = {
        'domingo': 'domingo',
        'segunda-feira': 'segunda', 
        'terça-feira': 'terca',
        'quarta-feira': 'quarta',
        'quinta-feira': 'quinta',
        'sexta-feira': 'sexta',
        'sábado': 'sabado'
      };
      
      const normalizedDay = dayMap[dayName];
      console.log("Dia selecionado:", dayName, "Dia normalizado:", normalizedDay);
      
      if (!Array.isArray(professional.dias_atendimento)) {
        console.error("dias_atendimento não é um array:", professional.dias_atendimento);
        return [];
      }
      
      if (!professional.dias_atendimento.includes(normalizedDay)) {
        console.log("Profissional não atende neste dia");
        return [];
      }

      const { horario_inicio, horario_fim } = professional;
      const serviceDuration = selectedService.duracao_em_minutos;

      console.log(`Gerando horários disponíveis entre ${horario_inicio} e ${horario_fim} com duração de ${serviceDuration} minutos`);

      const [startHour, startMinute] = horario_inicio.split(':').map(Number);
      const [endHour, endMinute] = horario_fim.split(':').map(Number);

      // Calculate end time in minutes from start of day
      const endTimeInMinutes = endHour * 60 + endMinute;
      
      const slots: string[] = [];
      let currentHour = startHour;
      let currentMinute = startMinute;

      // Filtrar apenas agendamentos do profissional selecionado e com status "agendado"
      const professionalAppointments = appointments?.filter(
        (appointment) => 
          appointment.profissional_id === professional.id && 
          appointment.status === "agendado"
      ) || [];
      
      console.log(`Encontrados ${professionalAppointments.length} agendamentos para o profissional no dia selecionado`);

      // Continue until we reach a point where adding service duration would exceed end time
      while (true) {
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const serviceEndTimeInMinutes = currentTimeInMinutes + serviceDuration;
        
        // Stop if service would end after professional's end time
        if (serviceEndTimeInMinutes > endTimeInMinutes) {
          console.log(`Parando em ${currentHour}:${currentMinute} - serviço terminaria às ${Math.floor(serviceEndTimeInMinutes / 60)}:${(serviceEndTimeInMinutes % 60).toString().padStart(2, '0')}, após horário limite ${horario_fim}`);
          break;
        }

        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Verificar se este horário já está agendado ou se há conflito
        const isSlotBooked = professionalAppointments.some(appointment => {
          const appointmentTime = appointment.hora;
          const [appointmentHour, appointmentMinute] = appointmentTime.split(':').map(Number);
          const appointmentStartMinutes = appointmentHour * 60 + appointmentMinute;
          
          // Assumir que o agendamento existente tem a mesma duração do serviço
          // Em um sistema real, você pegaria isso do serviço do agendamento
          const appointmentEndMinutes = appointmentStartMinutes + serviceDuration;
          
          // Verificar sobreposição: novo agendamento não pode começar antes do fim do existente
          // e não pode terminar depois do início do existente
          return !(serviceEndTimeInMinutes <= appointmentStartMinutes || 
                   currentTimeInMinutes >= appointmentEndMinutes);
        });

        if (!isSlotBooked) {
          slots.push(timeSlot);
        } else {
          console.log(`Horário ${timeSlot} já está ocupado ou em conflito`);
        }

        // Move to next slot (30-minute intervals for better granularity)
        currentMinute += 30;
        while (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
        }
      }
      
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Filter slots that conflict with blocks
      const filteredSlots = slots.filter(time => {
        const currentDateTime = new Date(`${formattedDate}T${time}`);

        return !blocks.some(block => {
          const blockStart = new Date(block.data_inicio);
          const blockEnd = new Date(block.data_fim);

          if (block.hora_inicio && block.hora_fim) {
            const [blockStartHour, blockStartMinute] = block.hora_inicio.split(':').map(Number);
            const [blockEndHour, blockEndMinute] = block.hora_fim.split(':').map(Number);
            
            const timeHour = parseInt(time.split(':')[0]);
            const timeMinute = parseInt(time.split(':')[1]);

            return (
              currentDateTime >= blockStart &&
              currentDateTime <= blockEnd &&
              (
                (timeHour > blockStartHour || (timeHour === blockStartHour && timeMinute >= blockStartMinute)) &&
                (timeHour < blockEndHour || (timeHour === blockEndHour && timeMinute < blockEndMinute))
              )
            );
          }

          return currentDateTime >= blockStart && currentDateTime <= blockEnd;
        });
      });

      console.log(`Horários disponíveis após filtros: ${filteredSlots.join(', ')}`);
      const lastPossibleTime = Math.floor((endTimeInMinutes - serviceDuration) / 60).toString().padStart(2, '0') + ':' + 
                              ((endTimeInMinutes - serviceDuration) % 60).toString().padStart(2, '0');
      console.log(`Último horário possível para serviço de ${serviceDuration}min: ${lastPossibleTime}`);
      
      return filteredSlots;
    };

    setAvailableTimes(generateTimeSlots());
  }, [date, professional, selectedService, appointments, blocks]);

  return availableTimes;
};

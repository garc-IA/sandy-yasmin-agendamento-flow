
import { useState, useEffect } from "react";
import { format, addMinutes, isWithinInterval } from "date-fns";
import { Professional, Service } from "@/lib/supabase";
import { logAppointmentError } from "@/utils/debugUtils";

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

  useEffect(() => {
    if (!date || !selectedService || !professional) {
      setAvailableTimes([]);
      return;
    }

    /**
     * Generates available time slots based on professional's working hours
     * and existing appointments, ensuring service duration is respected
     */
    const generateTimeSlots = () => {
      const { horario_inicio, horario_fim } = professional;
      const serviceDuration = selectedService.duracao_em_minutos;

      console.log(`Gerando horários disponíveis entre ${horario_inicio} e ${horario_fim} com duração de ${serviceDuration} minutos`);

      // Parse start and end times
      const [startHour, startMinute] = horario_inicio.split(':').map(Number);
      const [endHour, endMinute] = horario_fim.split(':').map(Number);

      // Calculate end time in minutes from start of day
      const endTimeInMinutes = endHour * 60 + endMinute;
      
      // Generate time slots
      const slots: string[] = [];
      let currentHour = startHour;
      let currentMinute = startMinute;

      // Continue until we reach a point where adding service duration would exceed end time
      while (true) {
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const serviceEndTimeInMinutes = currentTimeInMinutes + serviceDuration;
        
        // Stop if service would end after professional's end time
        if (serviceEndTimeInMinutes > endTimeInMinutes) {
          break;
        }

        // Format current time as HH:MM
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Check if this time slot conflicts with existing appointments
        const isSlotBooked = appointments?.some(appointment => {
          if (appointment.hora === timeSlot) return true;
          
          // Also check if there's overlap with other appointments
          const appointmentStart = appointment.hora.split(':').map(Number);
          const appointmentStartMinutes = appointmentStart[0] * 60 + appointmentStart[1];
          
          // Assume each appointment has the same duration as the service being scheduled
          // In a real system, you'd get this from the appointment's service
          const appointmentEndMinutes = appointmentStartMinutes + serviceDuration;
          
          // Check for overlap
          return (currentTimeInMinutes < appointmentEndMinutes && 
                  serviceEndTimeInMinutes > appointmentStartMinutes);
        });

        // If not booked and doesn't conflict, add to available slots
        if (!isSlotBooked) {
          slots.push(timeSlot);
        }

        // Move to next slot (typically 30-minute intervals)
        currentMinute += 30;
        while (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
        }
      }
      
      console.log(`Horários disponíveis: ${slots.join(', ')}`);
      console.log(`Último horário possível para serviço de ${serviceDuration}min seria: ${Math.floor((endTimeInMinutes - serviceDuration) / 60).toString().padStart(2, '0')}:${((endTimeInMinutes - serviceDuration) % 60).toString().padStart(2, '0')}`);
      
      return slots;
    };

    try {
      setAvailableTimes(generateTimeSlots());
    } catch (error) {
      logAppointmentError("Erro ao gerar horários disponíveis", "time-slots", error);
      setAvailableTimes([]);
    }
  }, [date, professional, selectedService, appointments]);

  return availableTimes;
};

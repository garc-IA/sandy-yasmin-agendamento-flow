
import { AppointmentStatus, AppointmentWithDetails } from "@/types/appointment.types";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Tipos comuns usados em hooks de agendamento
 */

// Tipos de resultado de operações de banco de dados
export type DatabaseResult<T = any> = {
  data: T | null;
  error: PostgrestError | Error | null;
  success: boolean;
};

// Parâmetros de atualização de status
export type StatusUpdateParams = {
  appointmentId: string;
  status: AppointmentStatus;
  reason?: string;
};

// Parâmetros de reagendamento
export type RescheduleParams = {
  appointmentId: string;
  date: Date;
  time: string;
  professionalId: string;
};

// Tipo de callback para ações de agendamento
export type AppointmentActionCallback = () => void;

// Estado do diálogo para ações de agendamento
export interface AppointmentDialogState {
  selectedAppointment: AppointmentWithDetails | null;
  appointmentToUpdate: { id: string; status: AppointmentStatus } | null;
  appointmentToCancel: string | null;
  isCancelDialogOpen: boolean;
  isRescheduleDialogOpen: boolean;
  cancelReason: string;
  isLoading: boolean;
}

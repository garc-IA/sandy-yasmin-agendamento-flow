import { Client, Service, Professional } from "@/lib/supabase";

export interface AppointmentWithDetails {
  id: string;
  cliente_id: string;
  servico_id: string;
  profissional_id: string;
  data: string;
  hora: string;
  start_time: string | null;
  end_time: string | null;
  status: "agendado" | "concluido" | "cancelado";
  ultima_mensagem_enviada_em: string | null;
  created_at: string;
  motivo_cancelamento?: string | null;
  avaliado: boolean | null;
  cliente: Client;
  servico: Service;
  profissional: Professional;
}

export interface AppointmentData {
  service: Service | null;
  professional_id: string | null;
  date: Date | null;
  time: string | null;
  client: Client | null;
}

export type AppointmentStatus = "agendado" | "concluido" | "cancelado";

export type AppointmentFilter = {
  status?: AppointmentStatus | "all";
  professionalId?: string | "all";
  startDate?: string | null;
  endDate?: string | null;
  clientQuery?: string | null;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  appointments?: AppointmentWithDetails[];
}

export interface DateWithSlots {
  date: Date;
  slots: TimeSlot[];
}


// Tipos centralizados para o sistema de agendamentos
export interface Service {
  id: string;
  nome: string;
  valor: number;
  duracao_em_minutos: number;
  descricao: string;
  created_at: string;
  ativo: boolean;
  categoria_id: string | null;
  imagem_url: string | null;
  admin_id: string | null;
}

export interface Professional {
  id: string;
  nome: string;
  dias_atendimento: string[];
  horario_inicio: string;
  horario_fim: string;
  specialization?: string;
  created_at?: string;
  admin_id?: string | null;
}

export interface Client {
  id?: string;
  nome: string;
  telefone: string;
  email: string;
  created_at?: string;
  admin_id?: string | null;
}

export interface AppointmentData {
  service: Service;
  professional: Professional;
  professional_name: string;
  professional_id: string;
  date: string;
  time: string;
  client: Client;
}

export type AppointmentStatus = 'agendado' | 'concluido' | 'cancelado';

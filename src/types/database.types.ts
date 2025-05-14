export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      owners: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          email: string
          senha: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          email: string
          senha: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          email?: string
          senha?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      agendamentos: {
        Row: {
          id: string
          cliente_id: string
          servico_id: string
          profissional_id: string
          data: string
          hora: string
          start_time: string | null
          end_time: string | null
          status: "agendado" | "concluido" | "cancelado" 
          ultima_mensagem_enviada_em: string | null
          created_at: string
          motivo_cancelamento: string | null
          avaliado: boolean | null
        }
        Insert: {
          id?: string
          cliente_id: string
          servico_id: string
          profissional_id: string
          data: string
          hora: string
          start_time?: string | null
          end_time?: string | null
          status?: "agendado" | "concluido" | "cancelado"
          ultima_mensagem_enviada_em?: string | null
          created_at?: string
          motivo_cancelamento?: string | null
          avaliado?: boolean | null
        }
        Update: {
          id?: string
          cliente_id?: string
          servico_id?: string
          profissional_id?: string
          data?: string
          hora?: string
          start_time?: string | null
          end_time?: string | null
          status?: "agendado" | "concluido" | "cancelado"
          ultima_mensagem_enviada_em?: string | null
          created_at?: string
          motivo_cancelamento?: string | null
          avaliado?: boolean | null
        }
      }
      clientes: {
        Row: {
          id: string
          nome: string
          telefone: string
          email: string
          created_at: string
          admin_id: string | null
        }
        Insert: {
          id?: string
          nome: string
          telefone: string
          email: string
          created_at?: string
          admin_id?: string | null
        }
        Update: {
          id?: string
          nome?: string
          telefone?: string
          email?: string
          created_at?: string
          admin_id?: string | null
        }
      }
      profissionais: {
        Row: {
          id: string
          nome: string
          dias_atendimento: string[] // ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
          horario_inicio: string
          horario_fim: string
          created_at: string
          admin_id: string | null
          specialization: string | null
        }
        Insert: {
          id?: string
          nome: string
          dias_atendimento: string[]
          horario_inicio: string
          horario_fim: string
          created_at?: string
          admin_id?: string | null
          specialization?: string | null
        }
        Update: {
          id?: string
          nome?: string
          dias_atendimento?: string[]
          horario_inicio?: string
          horario_fim?: string
          created_at?: string
          admin_id?: string | null
          specialization?: string | null
        }
      }
      servicos: {
        Row: {
          id: string
          nome: string
          valor: number
          duracao_em_minutos: number
          created_at: string
          ativo: boolean
          descricao: string | null
          categoria_id: string | null
          imagem_url: string | null
          admin_id: string | null
        }
        Insert: {
          id?: string
          nome: string
          valor: number
          duracao_em_minutos: number
          created_at?: string
          ativo?: boolean
          descricao?: string | null
          categoria_id?: string | null
          imagem_url?: string | null
          admin_id?: string | null
        }
        Update: {
          id?: string
          nome?: string
          valor?: number
          duracao_em_minutos?: number
          created_at?: string
          ativo?: boolean
          descricao?: string | null
          categoria_id?: string | null
          imagem_url?: string | null
          admin_id?: string | null
        }
      }
      time_blocks: {
        Row: {
          id: string
          admin_id: string | null
          professional_id: string | null
          start_time: string
          end_time: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          professional_id?: string | null
          start_time: string
          end_time: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          professional_id?: string | null
          start_time?: string
          end_time?: string
          reason?: string | null
          created_at?: string
        }
      }
      saloes: {
        Row: {
          id: string
          nome: string
          email: string
          telefone?: string
          url_personalizado: string
          plano: "trial" | "ativo" | "inativo"
          trial_expira_em?: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          telefone?: string
          url_personalizado: string
          plano?: "trial" | "ativo" | "inativo"
          trial_expira_em?: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string
          url_personalizado?: string
          plano?: "trial" | "ativo" | "inativo"
          trial_expira_em?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_cliente: {
        Args: {
          p_nome: string
          p_telefone: string
          p_email: string
          p_admin_id?: string
        }
        Returns: string
      }
      delete_appointment_with_history: {
        Args: { appointment_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

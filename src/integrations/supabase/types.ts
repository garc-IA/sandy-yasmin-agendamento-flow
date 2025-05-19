export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nome: string | null
          senha: string
          studio_name: string | null
          telefone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          nome?: string | null
          senha: string
          studio_name?: string | null
          telefone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          senha?: string
          studio_name?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      agendamento_historico: {
        Row: {
          agendamento_id: string
          created_at: string
          descricao: string | null
          id: string
          novo_valor: string | null
          tipo: string
        }
        Insert: {
          agendamento_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          novo_valor?: string | null
          tipo: string
        }
        Update: {
          agendamento_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          novo_valor?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_historico_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos: {
        Row: {
          avaliado: boolean | null
          cliente_id: string
          created_at: string
          data: string
          end_time: string | null
          hora: string
          id: string
          motivo_cancelamento: string | null
          profissional_id: string
          servico_id: string
          start_time: string | null
          status: string
          ultima_mensagem_enviada_em: string | null
        }
        Insert: {
          avaliado?: boolean | null
          cliente_id: string
          created_at?: string
          data: string
          end_time?: string | null
          hora: string
          id?: string
          motivo_cancelamento?: string | null
          profissional_id: string
          servico_id: string
          start_time?: string | null
          status?: string
          ultima_mensagem_enviada_em?: string | null
        }
        Update: {
          avaliado?: boolean | null
          cliente_id?: string
          created_at?: string
          data?: string
          end_time?: string | null
          hora?: string
          id?: string
          motivo_cancelamento?: string | null
          profissional_id?: string
          servico_id?: string
          start_time?: string | null
          status?: string
          ultima_mensagem_enviada_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueios: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          observacao: string | null
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          observacao?: string | null
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          observacao?: string | null
        }
        Relationships: []
      }
      categorias_servico: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          admin_id: string | null
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          telefone: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          admin_id: string | null
          created_at: string
          dias_atendimento: string[]
          horario_fim: string
          horario_inicio: string
          id: string
          nome: string
          specialization: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          dias_atendimento: string[]
          horario_fim: string
          horario_inicio: string
          id?: string
          nome: string
          specialization?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          dias_atendimento?: string[]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          nome?: string
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
        }
        Insert: {
          appointment_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
        }
        Update: {
          appointment_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          admin_id: string | null
          ativo: boolean
          categoria: string | null
          categoria_id: string | null
          created_at: string
          descricao: string | null
          duracao_em_minutos: number
          id: string
          imagem_url: string | null
          nome: string
          valor: number
        }
        Insert: {
          admin_id?: string | null
          ativo?: boolean
          categoria?: string | null
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          duracao_em_minutos: number
          id?: string
          imagem_url?: string | null
          nome: string
          valor: number
        }
        Update: {
          admin_id?: string | null
          ativo?: boolean
          categoria?: string | null
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          duracao_em_minutos?: number
          id?: string
          imagem_url?: string | null
          nome?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "servicos_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      time_blocks: {
        Row: {
          admin_id: string | null
          created_at: string
          end_time: string
          id: string
          professional_id: string | null
          reason: string | null
          start_time: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          end_time: string
          id?: string
          professional_id?: string | null
          reason?: string | null
          start_time: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          end_time?: string
          id?: string
          professional_id?: string | null
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_blocks_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_blocks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      appointment_reviews: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          comment: string | null
          created_at: string | null
          id: string | null
          profissional_id: string | null
          profissional_nome: string | null
          rating: number | null
          servico_nome: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_appointment_history: {
        Args: {
          p_agendamento_id: string
          p_tipo: string
          p_descricao: string
          p_novo_valor?: string
        }
        Returns: string
      }
      auto_complete_past_appointments: {
        Args: Record<PropertyKey, never>
        Returns: {
          appointment_id: string
          appointment_date: string
          appointment_time: string
          status: string
          updated: boolean
        }[]
      }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acessos_escola: {
        Row: {
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          crianca_id: string
          crianca_nome: string
          email: string
          escola_nome: string
          expira_em: string
          id: string
          observacao: string | null
          responsavel_cargo: string
          responsavel_nome: string
          status: Database["public"]["Enums"]["status_acesso_escola"]
          telefone: string | null
          token_convite: string
          ultimo_acesso: string | null
          ver_evolucao: boolean
          ver_incidentes: boolean
          ver_programas: boolean
          ver_relatorios: boolean
          ver_sessoes: boolean
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          crianca_id: string
          crianca_nome: string
          email: string
          escola_nome: string
          expira_em: string
          id?: string
          observacao?: string | null
          responsavel_cargo: string
          responsavel_nome: string
          status?: Database["public"]["Enums"]["status_acesso_escola"]
          telefone?: string | null
          token_convite?: string
          ultimo_acesso?: string | null
          ver_evolucao?: boolean
          ver_incidentes?: boolean
          ver_programas?: boolean
          ver_relatorios?: boolean
          ver_sessoes?: boolean
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          crianca_id?: string
          crianca_nome?: string
          email?: string
          escola_nome?: string
          expira_em?: string
          id?: string
          observacao?: string | null
          responsavel_cargo?: string
          responsavel_nome?: string
          status?: Database["public"]["Enums"]["status_acesso_escola"]
          telefone?: string | null
          token_convite?: string
          ultimo_acesso?: string | null
          ver_evolucao?: boolean
          ver_incidentes?: boolean
          ver_programas?: boolean
          ver_relatorios?: boolean
          ver_sessoes?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "acessos_escola_crianca_id_fkey"
            columns: ["crianca_id"]
            isOneToOne: false
            referencedRelation: "criancas"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos: {
        Row: {
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          crianca_id: string
          data_fim: string
          data_inicio: string
          id: string
          observacoes: string | null
          sala: string | null
          status: Database["public"]["Enums"]["status_agendamento"]
          terapeuta_id: string | null
          terapeuta_nome: string
          tipo: Database["public"]["Enums"]["tipo_sessao"]
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          crianca_id: string
          data_fim: string
          data_inicio: string
          id?: string
          observacoes?: string | null
          sala?: string | null
          status?: Database["public"]["Enums"]["status_agendamento"]
          terapeuta_id?: string | null
          terapeuta_nome: string
          tipo?: Database["public"]["Enums"]["tipo_sessao"]
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          crianca_id?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          observacoes?: string | null
          sala?: string | null
          status?: Database["public"]["Enums"]["status_agendamento"]
          terapeuta_id?: string | null
          terapeuta_nome?: string
          tipo?: Database["public"]["Enums"]["tipo_sessao"]
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_crianca_id_fkey"
            columns: ["crianca_id"]
            isOneToOne: false
            referencedRelation: "criancas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          arquivo_url: string | null
          atualizado_em: string
          avaliador_id: string | null
          avaliador_nome: string
          criado_em: string
          criado_por: string | null
          crianca_id: string
          data_avaliacao: string
          id: string
          observacoes: string | null
          pontuacao: number | null
          pontuacao_maxima: number | null
          relatorio: string | null
          status: Database["public"]["Enums"]["status_avaliacao"]
          tipo: Database["public"]["Enums"]["tipo_avaliacao"]
        }
        Insert: {
          arquivo_url?: string | null
          atualizado_em?: string
          avaliador_id?: string | null
          avaliador_nome: string
          criado_em?: string
          criado_por?: string | null
          crianca_id: string
          data_avaliacao: string
          id?: string
          observacoes?: string | null
          pontuacao?: number | null
          pontuacao_maxima?: number | null
          relatorio?: string | null
          status?: Database["public"]["Enums"]["status_avaliacao"]
          tipo: Database["public"]["Enums"]["tipo_avaliacao"]
        }
        Update: {
          arquivo_url?: string | null
          atualizado_em?: string
          avaliador_id?: string | null
          avaliador_nome?: string
          criado_em?: string
          criado_por?: string | null
          crianca_id?: string
          data_avaliacao?: string
          id?: string
          observacoes?: string | null
          pontuacao?: number | null
          pontuacao_maxima?: number | null
          relatorio?: string | null
          status?: Database["public"]["Enums"]["status_avaliacao"]
          tipo?: Database["public"]["Enums"]["tipo_avaliacao"]
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_crianca_id_fkey"
            columns: ["crianca_id"]
            isOneToOne: false
            referencedRelation: "criancas"
            referencedColumns: ["id"]
          },
        ]
      }
      clinica_config: {
        Row: {
          atualizado_em: string
          cep: string | null
          cidade: string | null
          cnpj: string | null
          configuracoes: Json | null
          cor_primaria: string | null
          criado_em: string
          email: string | null
          endereco: string | null
          estado: string | null
          horario_funcionamento: Json | null
          id: string
          logo_url: string | null
          nome: string
          site: string | null
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          configuracoes?: Json | null
          cor_primaria?: string | null
          criado_em?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome?: string
          site?: string | null
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          configuracoes?: Json | null
          cor_primaria?: string | null
          criado_em?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome?: string
          site?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      convites_usuario: {
        Row: {
          aceito_em: string | null
          aceito_por: string | null
          atualizado_em: string
          convidado_por: string | null
          criado_em: string
          email: string
          expira_em: string
          id: string
          nome_completo: string
          observacao: string | null
          papel: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["status_convite"]
          token: string
        }
        Insert: {
          aceito_em?: string | null
          aceito_por?: string | null
          atualizado_em?: string
          convidado_por?: string | null
          criado_em?: string
          email: string
          expira_em?: string
          id?: string
          nome_completo: string
          observacao?: string | null
          papel?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["status_convite"]
          token?: string
        }
        Update: {
          aceito_em?: string | null
          aceito_por?: string | null
          atualizado_em?: string
          convidado_por?: string | null
          criado_em?: string
          email?: string
          expira_em?: string
          id?: string
          nome_completo?: string
          observacao?: string | null
          papel?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["status_convite"]
          token?: string
        }
        Relationships: []
      }
      criancas: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          data_nascimento: string
          diagnostico: string | null
          email_contato: string | null
          foto_url: string | null
          id: string
          nome: string
          observacoes: string | null
          responsavel_principal: string | null
          telefone_contato: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          data_nascimento: string
          diagnostico?: string | null
          email_contato?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          responsavel_principal?: string | null
          telefone_contato?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          data_nascimento?: string
          diagnostico?: string | null
          email_contato?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel_principal?: string | null
          telefone_contato?: string | null
        }
        Relationships: []
      }
      familia_membros: {
        Row: {
          criado_em: string
          crianca_id: string
          id: string
          parentesco: Database["public"]["Enums"]["parentesco_familia"]
          pode_ver_evolucao: boolean
          pode_ver_sessoes: boolean
          user_id: string
        }
        Insert: {
          criado_em?: string
          crianca_id: string
          id?: string
          parentesco?: Database["public"]["Enums"]["parentesco_familia"]
          pode_ver_evolucao?: boolean
          pode_ver_sessoes?: boolean
          user_id: string
        }
        Update: {
          criado_em?: string
          crianca_id?: string
          id?: string
          parentesco?: Database["public"]["Enums"]["parentesco_familia"]
          pode_ver_evolucao?: boolean
          pode_ver_sessoes?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "familia_membros_crianca_id_fkey"
            columns: ["crianca_id"]
            isOneToOne: false
            referencedRelation: "criancas"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          ativo: boolean
          atualizado_em: string
          cargo: Database["public"]["Enums"]["cargo_funcionario"]
          criado_em: string
          data_admissao: string | null
          email: string
          especialidade: string | null
          id: string
          nome_completo: string
          observacoes: string | null
          registro_conselho: string | null
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          cargo?: Database["public"]["Enums"]["cargo_funcionario"]
          criado_em?: string
          data_admissao?: string | null
          email: string
          especialidade?: string | null
          id?: string
          nome_completo: string
          observacoes?: string | null
          registro_conselho?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          cargo?: Database["public"]["Enums"]["cargo_funcionario"]
          criado_em?: string
          data_admissao?: string | null
          email?: string
          especialidade?: string | null
          id?: string
          nome_completo?: string
          observacoes?: string | null
          registro_conselho?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      logs_auditoria: {
        Row: {
          acao: Database["public"]["Enums"]["acao_log"]
          criado_em: string
          descricao: string
          detalhes: Json | null
          entidade: string
          entidade_id: string | null
          id: string
          ip: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          acao: Database["public"]["Enums"]["acao_log"]
          criado_em?: string
          descricao: string
          detalhes?: Json | null
          entidade: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: Database["public"]["Enums"]["acao_log"]
          criado_em?: string
          descricao?: string
          detalhes?: Json | null
          entidade?: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      origens_permitidas: {
        Row: {
          ativo: boolean
          criado_em: string
          descricao: string | null
          id: string
          origem: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          descricao?: string | null
          id?: string
          origem: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          descricao?: string | null
          id?: string
          origem?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          atualizado_em: string
          avatar_url: string | null
          criado_em: string
          id: string
          nome_completo: string
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string
          avatar_url?: string | null
          criado_em?: string
          id: string
          nome_completo?: string
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string
          avatar_url?: string | null
          criado_em?: string
          id?: string
          nome_completo?: string
          telefone?: string | null
        }
        Relationships: []
      }
      programas: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          crianca_id: string
          criterio_mestria: string | null
          data_inicio: string
          descricao: string | null
          dominio: Database["public"]["Enums"]["dominio_programa"]
          id: string
          meta: string | null
          nivel_desempenho: Database["public"]["Enums"]["nivel_desempenho"]
          nome: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          crianca_id: string
          criterio_mestria?: string | null
          data_inicio?: string
          descricao?: string | null
          dominio: Database["public"]["Enums"]["dominio_programa"]
          id?: string
          meta?: string | null
          nivel_desempenho?: Database["public"]["Enums"]["nivel_desempenho"]
          nome: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          crianca_id?: string
          criterio_mestria?: string | null
          data_inicio?: string
          descricao?: string | null
          dominio?: Database["public"]["Enums"]["dominio_programa"]
          id?: string
          meta?: string | null
          nivel_desempenho?: Database["public"]["Enums"]["nivel_desempenho"]
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "programas_crianca_id_fkey"
            columns: ["crianca_id"]
            isOneToOne: false
            referencedRelation: "criancas"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_publico: {
        Row: {
          bloqueado_ate: string | null
          criado_em: string
          endpoint: string
          id: string
          identificador: string
          janela_inicio: string
          tentativas: number
        }
        Insert: {
          bloqueado_ate?: string | null
          criado_em?: string
          endpoint: string
          id?: string
          identificador: string
          janela_inicio?: string
          tentativas?: number
        }
        Update: {
          bloqueado_ate?: string | null
          criado_em?: string
          endpoint?: string
          id?: string
          identificador?: string
          janela_inicio?: string
          tentativas?: number
        }
        Relationships: []
      }
      registros_abc: {
        Row: {
          antecedente: string
          comportamento: string
          consequencia: string
          criado_em: string
          horario: string
          id: string
          intensidade: string | null
          sessao_id: string
        }
        Insert: {
          antecedente: string
          comportamento: string
          consequencia: string
          criado_em?: string
          horario: string
          id?: string
          intensidade?: string | null
          sessao_id: string
        }
        Update: {
          antecedente?: string
          comportamento?: string
          consequencia?: string
          criado_em?: string
          horario?: string
          id?: string
          intensidade?: string | null
          sessao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_abc_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      resultados_programa: {
        Row: {
          acertos: number
          criado_em: string
          id: string
          observacao: string | null
          programa_id: string
          sessao_id: string
          tentativas: number
        }
        Insert: {
          acertos?: number
          criado_em?: string
          id?: string
          observacao?: string | null
          programa_id: string
          sessao_id: string
          tentativas?: number
        }
        Update: {
          acertos?: number
          criado_em?: string
          id?: string
          observacao?: string | null
          programa_id?: string
          sessao_id?: string
          tentativas?: number
        }
        Relationships: [
          {
            foreignKeyName: "resultados_programa_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultados_programa_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          crianca_id: string
          data_sessao: string
          duracao_minutos: number
          humor_final: number | null
          humor_inicial: number | null
          id: string
          observacoes: string | null
          resumo_familia: string | null
          terapeuta_id: string | null
          terapeuta_nome: string
          tipo: Database["public"]["Enums"]["tipo_sessao"]
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          crianca_id: string
          data_sessao: string
          duracao_minutos?: number
          humor_final?: number | null
          humor_inicial?: number | null
          id?: string
          observacoes?: string | null
          resumo_familia?: string | null
          terapeuta_id?: string | null
          terapeuta_nome: string
          tipo?: Database["public"]["Enums"]["tipo_sessao"]
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          crianca_id?: string
          data_sessao?: string
          duracao_minutos?: number
          humor_final?: number | null
          humor_inicial?: number | null
          id?: string
          observacoes?: string | null
          resumo_familia?: string | null
          terapeuta_id?: string | null
          terapeuta_nome?: string
          tipo?: Database["public"]["Enums"]["tipo_sessao"]
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_crianca_id_fkey"
            columns: ["crianca_id"]
            isOneToOne: false
            referencedRelation: "criancas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          criado_em: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consumir_rate_limit: {
        Args: {
          _bloqueio_minutos?: number
          _endpoint: string
          _identificador: string
          _janela_minutos?: number
          _max_tentativas?: number
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      origem_permitida: { Args: { _origem: string }; Returns: boolean }
      tem_acesso_crianca: {
        Args: { _crianca_id: string; _user_id: string }
        Returns: boolean
      }
      validar_forca_senha: { Args: { _senha: string }; Returns: Json }
    }
    Enums: {
      acao_log:
        | "login"
        | "logout"
        | "criar"
        | "editar"
        | "excluir"
        | "visualizar"
        | "exportar"
        | "alterar_papel"
        | "convidar_escola"
        | "falha_login"
      app_role:
        | "admin"
        | "psicologo"
        | "coordenador"
        | "recepcionista"
        | "familia"
      cargo_funcionario:
        | "psicologo"
        | "coordenador"
        | "recepcionista"
        | "admin"
        | "terapeuta"
        | "supervisor"
        | "outro"
      dominio_programa:
        | "comunicacao"
        | "social"
        | "cognitivo"
        | "autocuidado"
        | "academico"
        | "motor"
        | "comportamental"
      nivel_desempenho:
        | "linha_base"
        | "em_aquisicao"
        | "em_manutencao"
        | "generalizado"
        | "independente"
      parentesco_familia:
        | "mae"
        | "pai"
        | "avo"
        | "tio_tia"
        | "responsavel_legal"
        | "outro"
      status_acesso_escola: "ativo" | "pendente" | "expirado" | "revogado"
      status_agendamento:
        | "agendado"
        | "confirmado"
        | "realizado"
        | "cancelado"
        | "faltou"
      status_avaliacao: "agendada" | "em_andamento" | "concluida" | "cancelada"
      status_convite: "pendente" | "aceito" | "expirado" | "revogado"
      tipo_avaliacao:
        | "vbmapp"
        | "ablls"
        | "peak"
        | "denver"
        | "adir"
        | "ados"
        | "outra"
      tipo_sessao:
        | "individual"
        | "grupo"
        | "observacao"
        | "avaliacao"
        | "remota"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acao_log: [
        "login",
        "logout",
        "criar",
        "editar",
        "excluir",
        "visualizar",
        "exportar",
        "alterar_papel",
        "convidar_escola",
        "falha_login",
      ],
      app_role: [
        "admin",
        "psicologo",
        "coordenador",
        "recepcionista",
        "familia",
      ],
      cargo_funcionario: [
        "psicologo",
        "coordenador",
        "recepcionista",
        "admin",
        "terapeuta",
        "supervisor",
        "outro",
      ],
      dominio_programa: [
        "comunicacao",
        "social",
        "cognitivo",
        "autocuidado",
        "academico",
        "motor",
        "comportamental",
      ],
      nivel_desempenho: [
        "linha_base",
        "em_aquisicao",
        "em_manutencao",
        "generalizado",
        "independente",
      ],
      parentesco_familia: [
        "mae",
        "pai",
        "avo",
        "tio_tia",
        "responsavel_legal",
        "outro",
      ],
      status_acesso_escola: ["ativo", "pendente", "expirado", "revogado"],
      status_agendamento: [
        "agendado",
        "confirmado",
        "realizado",
        "cancelado",
        "faltou",
      ],
      status_avaliacao: ["agendada", "em_andamento", "concluida", "cancelada"],
      status_convite: ["pendente", "aceito", "expirado", "revogado"],
      tipo_avaliacao: [
        "vbmapp",
        "ablls",
        "peak",
        "denver",
        "adir",
        "ados",
        "outra",
      ],
      tipo_sessao: ["individual", "grupo", "observacao", "avaliacao", "remota"],
    },
  },
} as const

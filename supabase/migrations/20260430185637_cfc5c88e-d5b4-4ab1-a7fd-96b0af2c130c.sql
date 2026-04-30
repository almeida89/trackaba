
-- ============================================================
-- 1. FOREIGN KEYS (idempotentes via DO blocks)
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fkey') THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'criancas_criado_por_fkey') THEN
    ALTER TABLE public.criancas ADD CONSTRAINT criancas_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'familia_membros_user_id_fkey') THEN
    ALTER TABLE public.familia_membros ADD CONSTRAINT familia_membros_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessoes_terapeuta_id_fkey') THEN
    ALTER TABLE public.sessoes ADD CONSTRAINT sessoes_terapeuta_id_fkey FOREIGN KEY (terapeuta_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'acessos_escola_crianca_id_fkey') THEN
    ALTER TABLE public.acessos_escola ADD CONSTRAINT acessos_escola_crianca_id_fkey FOREIGN KEY (crianca_id) REFERENCES public.criancas(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'acessos_escola_criado_por_fkey') THEN
    ALTER TABLE public.acessos_escola ADD CONSTRAINT acessos_escola_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'logs_auditoria_user_id_fkey') THEN
    ALTER TABLE public.logs_auditoria ADD CONSTRAINT logs_auditoria_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- 2. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sessoes_crianca_id ON public.sessoes(crianca_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_data_sessao ON public.sessoes(data_sessao DESC);
CREATE INDEX IF NOT EXISTS idx_sessoes_terapeuta_id ON public.sessoes(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_programas_crianca_id ON public.programas(crianca_id);
CREATE INDEX IF NOT EXISTS idx_programas_ativo ON public.programas(ativo);
CREATE INDEX IF NOT EXISTS idx_registros_abc_sessao_id ON public.registros_abc(sessao_id);
CREATE INDEX IF NOT EXISTS idx_resultados_programa_sessao_id ON public.resultados_programa(sessao_id);
CREATE INDEX IF NOT EXISTS idx_resultados_programa_programa_id ON public.resultados_programa(programa_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_user_id ON public.logs_auditoria(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_criado_em ON public.logs_auditoria(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_entidade ON public.logs_auditoria(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_familia_membros_crianca_id ON public.familia_membros(crianca_id);
CREATE INDEX IF NOT EXISTS idx_familia_membros_user_id ON public.familia_membros(user_id);
CREATE INDEX IF NOT EXISTS idx_acessos_escola_crianca_id ON public.acessos_escola(crianca_id);
CREATE INDEX IF NOT EXISTS idx_acessos_escola_token ON public.acessos_escola(token_convite);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_criancas_ativo ON public.criancas(ativo);

-- ============================================================
-- 3. ENUMS NOVOS (idempotentes)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_agendamento') THEN
    CREATE TYPE public.status_agendamento AS ENUM ('agendado','confirmado','realizado','cancelado','faltou');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_avaliacao') THEN
    CREATE TYPE public.status_avaliacao AS ENUM ('agendada','em_andamento','concluida','cancelada');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_avaliacao') THEN
    CREATE TYPE public.tipo_avaliacao AS ENUM ('vbmapp','ablls','peak','denver','adir','ados','outra');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cargo_funcionario') THEN
    CREATE TYPE public.cargo_funcionario AS ENUM ('psicologo','coordenador','recepcionista','admin','terapeuta','supervisor','outro');
  END IF;
END $$;

-- ============================================================
-- 4. NOVAS TABELAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id uuid NOT NULL REFERENCES public.criancas(id) ON DELETE CASCADE,
  terapeuta_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  terapeuta_nome text NOT NULL,
  tipo public.tipo_sessao NOT NULL DEFAULT 'individual',
  status public.status_agendamento NOT NULL DEFAULT 'agendado',
  data_inicio timestamptz NOT NULL,
  data_fim timestamptz NOT NULL,
  sala text,
  observacoes text,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agendamentos_crianca ON public.agendamentos(crianca_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_terapeuta ON public.agendamentos(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON public.agendamentos(status);
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Equipe vê agendamentos" ON public.agendamentos;
CREATE POLICY "Equipe vê agendamentos" ON public.agendamentos FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'psicologo') OR has_role(auth.uid(),'coordenador') OR has_role(auth.uid(),'recepcionista'));

DROP POLICY IF EXISTS "Equipe gerencia agendamentos" ON public.agendamentos;
CREATE POLICY "Equipe gerencia agendamentos" ON public.agendamentos FOR ALL TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'coordenador') OR has_role(auth.uid(),'recepcionista'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'coordenador') OR has_role(auth.uid(),'recepcionista'));

DROP POLICY IF EXISTS "Família vê agendamentos da criança" ON public.agendamentos;
CREATE POLICY "Família vê agendamentos da criança" ON public.agendamentos FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM familia_membros WHERE crianca_id = agendamentos.crianca_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id uuid NOT NULL REFERENCES public.criancas(id) ON DELETE CASCADE,
  avaliador_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  avaliador_nome text NOT NULL,
  tipo public.tipo_avaliacao NOT NULL,
  status public.status_avaliacao NOT NULL DEFAULT 'agendada',
  data_avaliacao date NOT NULL,
  pontuacao numeric,
  pontuacao_maxima numeric,
  observacoes text,
  relatorio text,
  arquivo_url text,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_crianca ON public.avaliacoes(crianca_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON public.avaliacoes(data_avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_status ON public.avaliacoes(status);
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso por criança - avaliacoes" ON public.avaliacoes;
CREATE POLICY "Acesso por criança - avaliacoes" ON public.avaliacoes FOR SELECT TO authenticated
USING (tem_acesso_crianca(crianca_id, auth.uid()));

DROP POLICY IF EXISTS "Equipe gerencia avaliacoes" ON public.avaliacoes;
CREATE POLICY "Equipe gerencia avaliacoes" ON public.avaliacoes FOR ALL TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'psicologo') OR has_role(auth.uid(),'coordenador'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'psicologo') OR has_role(auth.uid(),'coordenador'));

CREATE TABLE IF NOT EXISTS public.funcionarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nome_completo text NOT NULL,
  email text NOT NULL UNIQUE,
  telefone text,
  cargo public.cargo_funcionario NOT NULL DEFAULT 'terapeuta',
  especialidade text,
  registro_conselho text,
  data_admissao date DEFAULT CURRENT_DATE,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_funcionarios_ativo ON public.funcionarios(ativo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_cargo ON public.funcionarios(cargo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_user_id ON public.funcionarios(user_id);
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Equipe vê funcionários" ON public.funcionarios;
CREATE POLICY "Equipe vê funcionários" ON public.funcionarios FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'coordenador') OR has_role(auth.uid(),'psicologo') OR has_role(auth.uid(),'recepcionista'));

DROP POLICY IF EXISTS "Admin gerencia funcionários" ON public.funcionarios;
CREATE POLICY "Admin gerencia funcionários" ON public.funcionarios FOR ALL TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'coordenador'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'coordenador'));

CREATE TABLE IF NOT EXISTS public.clinica_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT 'TrackABA',
  cnpj text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  telefone text,
  email text,
  site text,
  logo_url text,
  cor_primaria text,
  horario_funcionamento jsonb,
  configuracoes jsonb,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clinica_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos autenticados veem config" ON public.clinica_config;
CREATE POLICY "Todos autenticados veem config" ON public.clinica_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin gerencia config" ON public.clinica_config;
CREATE POLICY "Admin gerencia config" ON public.clinica_config FOR ALL TO authenticated
USING (has_role(auth.uid(),'admin'))
WITH CHECK (has_role(auth.uid(),'admin'));

-- ============================================================
-- 5. TRIGGERS DE atualizado_em
-- ============================================================
DROP TRIGGER IF EXISTS trg_criancas_upd ON public.criancas;
CREATE TRIGGER trg_criancas_upd BEFORE UPDATE ON public.criancas FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
DROP TRIGGER IF EXISTS trg_profiles_upd ON public.profiles;
CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
DROP TRIGGER IF EXISTS trg_programas_upd ON public.programas;
CREATE TRIGGER trg_programas_upd BEFORE UPDATE ON public.programas FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
DROP TRIGGER IF EXISTS trg_sessoes_upd ON public.sessoes;
CREATE TRIGGER trg_sessoes_upd BEFORE UPDATE ON public.sessoes FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
DROP TRIGGER IF EXISTS trg_acessos_escola_upd ON public.acessos_escola;
CREATE TRIGGER trg_acessos_escola_upd BEFORE UPDATE ON public.acessos_escola FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
DROP TRIGGER IF EXISTS trg_agendamentos_upd ON public.agendamentos;
CREATE TRIGGER trg_agendamentos_upd BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
DROP TRIGGER IF EXISTS trg_avaliacoes_upd ON public.avaliacoes;
CREATE TRIGGER trg_avaliacoes_upd BEFORE UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
DROP TRIGGER IF EXISTS trg_funcionarios_upd ON public.funcionarios;
CREATE TRIGGER trg_funcionarios_upd BEFORE UPDATE ON public.funcionarios FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
DROP TRIGGER IF EXISTS trg_clinica_config_upd ON public.clinica_config;
CREATE TRIGGER trg_clinica_config_upd BEFORE UPDATE ON public.clinica_config FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- ============================================================
-- 6. TRIGGER GENÉRICA DE AUDITORIA
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_auditoria_generica()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acao public.acao_log;
  v_id uuid;
  v_descricao text;
  v_user uuid;
BEGIN
  v_user := auth.uid();
  IF (TG_OP = 'INSERT') THEN
    v_acao := 'criar';
    v_id := (to_jsonb(NEW)->>'id')::uuid;
    v_descricao := 'Criou registro em ' || TG_TABLE_NAME;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_acao := 'editar';
    v_id := (to_jsonb(NEW)->>'id')::uuid;
    v_descricao := 'Editou registro em ' || TG_TABLE_NAME;
  ELSIF (TG_OP = 'DELETE') THEN
    v_acao := 'excluir';
    v_id := (to_jsonb(OLD)->>'id')::uuid;
    v_descricao := 'Removeu registro em ' || TG_TABLE_NAME;
  END IF;

  INSERT INTO public.logs_auditoria (user_id, acao, entidade, entidade_id, descricao, detalhes)
  VALUES (
    v_user, v_acao, TG_TABLE_NAME, v_id, v_descricao,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END
  );

  IF (TG_OP = 'DELETE') THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_criancas ON public.criancas;
CREATE TRIGGER trg_audit_criancas AFTER INSERT OR UPDATE OR DELETE ON public.criancas FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();
DROP TRIGGER IF EXISTS trg_audit_programas ON public.programas;
CREATE TRIGGER trg_audit_programas AFTER INSERT OR UPDATE OR DELETE ON public.programas FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();
DROP TRIGGER IF EXISTS trg_audit_sessoes ON public.sessoes;
CREATE TRIGGER trg_audit_sessoes AFTER INSERT OR UPDATE OR DELETE ON public.sessoes FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();
DROP TRIGGER IF EXISTS trg_audit_agendamentos ON public.agendamentos;
CREATE TRIGGER trg_audit_agendamentos AFTER INSERT OR UPDATE OR DELETE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();
DROP TRIGGER IF EXISTS trg_audit_avaliacoes ON public.avaliacoes;
CREATE TRIGGER trg_audit_avaliacoes AFTER INSERT OR UPDATE OR DELETE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();
DROP TRIGGER IF EXISTS trg_audit_funcionarios ON public.funcionarios;
CREATE TRIGGER trg_audit_funcionarios AFTER INSERT OR UPDATE OR DELETE ON public.funcionarios FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();
DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();
DROP TRIGGER IF EXISTS trg_audit_acessos_escola ON public.acessos_escola;
CREATE TRIGGER trg_audit_acessos_escola AFTER INSERT OR UPDATE OR DELETE ON public.acessos_escola FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();

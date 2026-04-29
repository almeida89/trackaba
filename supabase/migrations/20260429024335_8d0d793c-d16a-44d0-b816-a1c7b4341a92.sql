
-- ============================================================
-- TIPOS ENUMERADOS
-- ============================================================
CREATE TYPE public.parentesco_familia AS ENUM ('mae', 'pai', 'avo', 'tio_tia', 'responsavel_legal', 'outro');
CREATE TYPE public.dominio_programa AS ENUM ('comunicacao', 'social', 'cognitivo', 'autocuidado', 'academico', 'motor', 'comportamental');
CREATE TYPE public.nivel_desempenho AS ENUM ('linha_base', 'em_aquisicao', 'em_manutencao', 'generalizado', 'independente');
CREATE TYPE public.tipo_sessao AS ENUM ('individual', 'grupo', 'observacao', 'avaliacao', 'remota');
CREATE TYPE public.acao_log AS ENUM ('login', 'logout', 'criar', 'editar', 'excluir', 'visualizar', 'exportar', 'alterar_papel', 'convidar_escola', 'falha_login');

-- ============================================================
-- TABELA: criancas
-- ============================================================
CREATE TABLE public.criancas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  data_nascimento date NOT NULL,
  diagnostico text,
  responsavel_principal text,
  telefone_contato text,
  email_contato text,
  observacoes text,
  foto_url text,
  ativo boolean NOT NULL DEFAULT true,
  criado_por uuid,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_criancas_ativo ON public.criancas(ativo);
CREATE INDEX idx_criancas_nome ON public.criancas(nome);

-- ============================================================
-- TABELA: familia_membros (vincula auth.users a criancas)
-- ============================================================
CREATE TABLE public.familia_membros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id uuid NOT NULL REFERENCES public.criancas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  parentesco public.parentesco_familia NOT NULL DEFAULT 'responsavel_legal',
  pode_ver_evolucao boolean NOT NULL DEFAULT true,
  pode_ver_sessoes boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (crianca_id, user_id)
);

CREATE INDEX idx_familia_user ON public.familia_membros(user_id);
CREATE INDEX idx_familia_crianca ON public.familia_membros(crianca_id);

-- ============================================================
-- TABELA: sessoes
-- ============================================================
CREATE TABLE public.sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id uuid NOT NULL REFERENCES public.criancas(id) ON DELETE CASCADE,
  terapeuta_id uuid,
  terapeuta_nome text NOT NULL,
  data_sessao timestamptz NOT NULL,
  duracao_minutos integer NOT NULL DEFAULT 60,
  tipo public.tipo_sessao NOT NULL DEFAULT 'individual',
  observacoes text,
  resumo_familia text,
  humor_inicial integer CHECK (humor_inicial BETWEEN 1 AND 5),
  humor_final integer CHECK (humor_final BETWEEN 1 AND 5),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessoes_crianca ON public.sessoes(crianca_id, data_sessao DESC);

-- ============================================================
-- TABELA: programas
-- ============================================================
CREATE TABLE public.programas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id uuid NOT NULL REFERENCES public.criancas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  dominio public.dominio_programa NOT NULL,
  descricao text,
  meta text,
  criterio_mestria text,
  nivel_desempenho public.nivel_desempenho NOT NULL DEFAULT 'linha_base',
  ativo boolean NOT NULL DEFAULT true,
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_programas_crianca ON public.programas(crianca_id, ativo);

-- ============================================================
-- TABELA: registros_abc
-- ============================================================
CREATE TABLE public.registros_abc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id uuid NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  horario time NOT NULL,
  antecedente text NOT NULL,
  comportamento text NOT NULL,
  consequencia text NOT NULL,
  intensidade text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_abc_sessao ON public.registros_abc(sessao_id);

-- ============================================================
-- TABELA: resultados_programa
-- ============================================================
CREATE TABLE public.resultados_programa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id uuid NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  programa_id uuid NOT NULL REFERENCES public.programas(id) ON DELETE CASCADE,
  tentativas integer NOT NULL DEFAULT 0,
  acertos integer NOT NULL DEFAULT 0,
  observacao text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_resultados_sessao ON public.resultados_programa(sessao_id);
CREATE INDEX idx_resultados_programa ON public.resultados_programa(programa_id);

-- ============================================================
-- TABELA: logs_auditoria
-- ============================================================
CREATE TABLE public.logs_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  acao public.acao_log NOT NULL,
  entidade text NOT NULL,
  entidade_id uuid,
  descricao text NOT NULL,
  detalhes jsonb,
  ip text,
  user_agent text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_data ON public.logs_auditoria(criado_em DESC);
CREATE INDEX idx_logs_user ON public.logs_auditoria(user_id);
CREATE INDEX idx_logs_acao ON public.logs_auditoria(acao);

-- ============================================================
-- FUNÇÃO: tem_acesso_crianca (SECURITY DEFINER, sem recursão de RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.tem_acesso_crianca(_crianca_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'psicologo')
    OR public.has_role(_user_id, 'coordenador')
    OR public.has_role(_user_id, 'recepcionista')
    OR EXISTS (
      SELECT 1 FROM public.familia_membros
      WHERE crianca_id = _crianca_id AND user_id = _user_id
    )
$$;

-- Não expor para usuários autenticados — só usada internamente em policies
REVOKE EXECUTE ON FUNCTION public.tem_acesso_crianca(uuid, uuid) FROM PUBLIC, authenticated, anon;

-- Corrige alerta de segurança: util interna de timestamp não deve ser executável por todo authenticated
REVOKE EXECUTE ON FUNCTION public.update_atualizado_em() FROM PUBLIC, authenticated, anon;

-- ============================================================
-- TRIGGERS de atualizado_em
-- ============================================================
CREATE TRIGGER trg_criancas_atualizado_em BEFORE UPDATE ON public.criancas
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
CREATE TRIGGER trg_sessoes_atualizado_em BEFORE UPDATE ON public.sessoes
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
CREATE TRIGGER trg_programas_atualizado_em BEFORE UPDATE ON public.programas
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- ============================================================
-- HABILITAR RLS
-- ============================================================
ALTER TABLE public.criancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familia_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_abc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: criancas
-- ============================================================
CREATE POLICY "Equipe vê todas crianças"
  ON public.criancas FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
    OR public.has_role(auth.uid(), 'coordenador')
    OR public.has_role(auth.uid(), 'recepcionista')
  );

CREATE POLICY "Família vê suas crianças"
  ON public.criancas FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.familia_membros
    WHERE crianca_id = criancas.id AND user_id = auth.uid()
  ));

CREATE POLICY "Equipe insere crianças"
  ON public.criancas FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
    OR public.has_role(auth.uid(), 'coordenador')
  );

CREATE POLICY "Equipe atualiza crianças"
  ON public.criancas FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
    OR public.has_role(auth.uid(), 'coordenador')
  );

CREATE POLICY "Admin remove criança"
  ON public.criancas FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- POLICIES: familia_membros
-- ============================================================
CREATE POLICY "Equipe vê vínculos família"
  ON public.familia_membros FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
    OR public.has_role(auth.uid(), 'coordenador')
    OR user_id = auth.uid()
  );

CREATE POLICY "Equipe gerencia família"
  ON public.familia_membros FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'coordenador')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'coordenador')
  );

-- ============================================================
-- POLICIES: sessoes / programas / abc / resultados
-- ============================================================
CREATE POLICY "Acesso por criança - sessões"
  ON public.sessoes FOR SELECT TO authenticated
  USING (public.tem_acesso_crianca(crianca_id, auth.uid()));

CREATE POLICY "Equipe gerencia sessões"
  ON public.sessoes FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
    OR public.has_role(auth.uid(), 'coordenador')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
    OR public.has_role(auth.uid(), 'coordenador')
  );

CREATE POLICY "Acesso por criança - programas"
  ON public.programas FOR SELECT TO authenticated
  USING (public.tem_acesso_crianca(crianca_id, auth.uid()));

CREATE POLICY "Equipe gerencia programas"
  ON public.programas FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
    OR public.has_role(auth.uid(), 'coordenador')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
    OR public.has_role(auth.uid(), 'coordenador')
  );

CREATE POLICY "ABC visíveis via sessão"
  ON public.registros_abc FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sessoes s
    WHERE s.id = registros_abc.sessao_id
      AND public.tem_acesso_crianca(s.crianca_id, auth.uid())
  ));

CREATE POLICY "Equipe gerencia ABC"
  ON public.registros_abc FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
  );

CREATE POLICY "Resultados visíveis via sessão"
  ON public.resultados_programa FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sessoes s
    WHERE s.id = resultados_programa.sessao_id
      AND public.tem_acesso_crianca(s.crianca_id, auth.uid())
  ));

CREATE POLICY "Equipe gerencia resultados"
  ON public.resultados_programa FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'psicologo')
  );

-- ============================================================
-- POLICIES: logs_auditoria (somente admin lê, append-only para autenticados)
-- ============================================================
CREATE POLICY "Admin vê logs"
  ON public.logs_auditoria FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Autenticados gravam logs próprios"
  ON public.logs_auditoria FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));

-- Sem UPDATE nem DELETE: append-only.

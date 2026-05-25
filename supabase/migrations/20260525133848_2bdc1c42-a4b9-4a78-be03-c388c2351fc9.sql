
-- 1) Tabela de vínculo profissional <-> criança
CREATE TABLE IF NOT EXISTS public.crianca_responsaveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id uuid NOT NULL,
  funcionario_id uuid NOT NULL,
  papel_clinico text NOT NULL DEFAULT 'responsavel',
  criado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid,
  UNIQUE (crianca_id, funcionario_id)
);

CREATE INDEX IF NOT EXISTS idx_crianca_responsaveis_crianca ON public.crianca_responsaveis(crianca_id);
CREATE INDEX IF NOT EXISTS idx_crianca_responsaveis_funcionario ON public.crianca_responsaveis(funcionario_id);

ALTER TABLE public.crianca_responsaveis ENABLE ROW LEVEL SECURITY;

-- SELECT: admin/coord/recep veem tudo; psicólogo vê suas próprias linhas
CREATE POLICY "Equipe vê vínculos responsáveis"
  ON public.crianca_responsaveis FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordenador'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.funcionarios f
      WHERE f.id = crianca_responsaveis.funcionario_id AND f.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin coord recep gerenciam vínculos"
  ON public.crianca_responsaveis FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordenador'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordenador'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  );

-- 2) Atualizar tem_acesso_crianca para usar vínculo explícito
CREATE OR REPLACE FUNCTION public.tem_acesso_crianca(_crianca_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT
    public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'coordenador')
    OR public.has_role(_user_id, 'recepcionista')
    OR (
      public.has_role(_user_id, 'psicologo')
      AND EXISTS (
        SELECT 1 FROM public.funcionarios f
        JOIN public.crianca_responsaveis cr ON cr.funcionario_id = f.id
        WHERE f.user_id = _user_id AND cr.crianca_id = _crianca_id
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.familia_membros fm
      WHERE fm.crianca_id = _crianca_id AND fm.user_id = _user_id
    )
$function$;

-- 3) Backfill: criar vínculos a partir do histórico (sessões + agendamentos)
INSERT INTO public.crianca_responsaveis (crianca_id, funcionario_id)
SELECT DISTINCT s.crianca_id, s.terapeuta_id
FROM public.sessoes s
WHERE s.terapeuta_id IS NOT NULL
ON CONFLICT (crianca_id, funcionario_id) DO NOTHING;

INSERT INTO public.crianca_responsaveis (crianca_id, funcionario_id)
SELECT DISTINCT a.crianca_id, a.terapeuta_id
FROM public.agendamentos a
WHERE a.terapeuta_id IS NOT NULL
ON CONFLICT (crianca_id, funcionario_id) DO NOTHING;

-- 4) Liberar recepção para criar/editar sessões e gerenciar funcionários
DROP POLICY IF EXISTS "Admin coord gerenciam sessões" ON public.sessoes;
CREATE POLICY "Admin coord recep gerenciam sessões"
  ON public.sessoes FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordenador'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordenador'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  );

DROP POLICY IF EXISTS "Admin gerencia funcionários" ON public.funcionarios;
CREATE POLICY "Admin coord recep gerenciam funcionários"
  ON public.funcionarios FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordenador'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordenador'::app_role)
    OR has_role(auth.uid(), 'recepcionista'::app_role)
  );


-- 1. tem_acesso_crianca: psicologo somente para crianças atribuídas
CREATE OR REPLACE FUNCTION public.tem_acesso_crianca(_crianca_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'coordenador')
    OR public.has_role(_user_id, 'recepcionista')
    OR (
      public.has_role(_user_id, 'psicologo')
      AND EXISTS (
        SELECT 1 FROM public.funcionarios f
        WHERE f.user_id = _user_id
          AND (
            EXISTS (SELECT 1 FROM public.sessoes s
                    WHERE s.crianca_id = _crianca_id AND s.terapeuta_id = f.id)
            OR EXISTS (SELECT 1 FROM public.agendamentos a
                       WHERE a.crianca_id = _crianca_id AND a.terapeuta_id = f.id)
          )
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.familia_membros fm
      WHERE fm.crianca_id = _crianca_id AND fm.user_id = _user_id
    )
$$;

-- 2. criancas: separar policy de equipe ampla vs psicologo escopado
DROP POLICY IF EXISTS "Equipe vê todas crianças" ON public.criancas;

CREATE POLICY "Admin coord recep veem todas crianças"
ON public.criancas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'coordenador')
  OR has_role(auth.uid(), 'recepcionista')
);

CREATE POLICY "Psicologo vê crianças atribuídas"
ON public.criancas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'psicologo')
  AND public.tem_acesso_crianca(id, auth.uid())
);

-- 3. sessoes: tightening "Equipe gerencia sessões"
DROP POLICY IF EXISTS "Equipe gerencia sessões" ON public.sessoes;

CREATE POLICY "Admin coord gerenciam sessões"
ON public.sessoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'));

CREATE POLICY "Psicologo gerencia sessões atribuídas"
ON public.sessoes FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'psicologo')
  AND public.tem_acesso_crianca(crianca_id, auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'psicologo')
  AND public.tem_acesso_crianca(crianca_id, auth.uid())
);

-- 4. programas: tightening
DROP POLICY IF EXISTS "Equipe gerencia programas" ON public.programas;

CREATE POLICY "Admin coord gerenciam programas"
ON public.programas FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'));

CREATE POLICY "Psicologo gerencia programas atribuídos"
ON public.programas FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'psicologo')
  AND public.tem_acesso_crianca(crianca_id, auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'psicologo')
  AND public.tem_acesso_crianca(crianca_id, auth.uid())
);

-- 5. avaliacoes: tightening
DROP POLICY IF EXISTS "Equipe gerencia avaliacoes" ON public.avaliacoes;

CREATE POLICY "Admin coord gerenciam avaliacoes"
ON public.avaliacoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordenador'));

CREATE POLICY "Psicologo gerencia avaliacoes atribuídas"
ON public.avaliacoes FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'psicologo')
  AND public.tem_acesso_crianca(crianca_id, auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'psicologo')
  AND public.tem_acesso_crianca(crianca_id, auth.uid())
);

-- 6. dashboard_estatisticas: escopar psicologo
CREATE OR REPLACE FUNCTION public.dashboard_estatisticas()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_eh_amplo boolean;
  v_eh_psicologo boolean;
  v_func_id uuid;
  v_criancas_ativas int := 0;
  v_criancas_novas_mes int := 0;
  v_sessoes_hoje int := 0;
  v_sessoes_concluidas_hoje int := 0;
  v_avaliacoes_pendentes int := 0;
  v_avaliacoes_urgentes int := 0;
  v_agendamentos_semana int := 0;
  v_agendamentos_confirmados int := 0;
  v_inicio_semana timestamptz := date_trunc('week', now());
  v_fim_semana timestamptz := date_trunc('week', now()) + interval '7 days';
  v_inicio_mes timestamptz := date_trunc('month', now());
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('erro', 'nao_autenticado');
  END IF;

  v_eh_amplo := has_role(v_user, 'admin')
    OR has_role(v_user, 'coordenador')
    OR has_role(v_user, 'recepcionista');
  v_eh_psicologo := has_role(v_user, 'psicologo') AND NOT v_eh_amplo;

  IF v_eh_amplo THEN
    SELECT count(*), count(*) FILTER (WHERE criado_em >= v_inicio_mes)
      INTO v_criancas_ativas, v_criancas_novas_mes
    FROM criancas WHERE ativo = true;

    SELECT count(*), count(*) FILTER (WHERE data_sessao < now())
      INTO v_sessoes_hoje, v_sessoes_concluidas_hoje
    FROM sessoes WHERE data_sessao::date = current_date;

    SELECT count(*), count(*) FILTER (WHERE data_avaliacao <= current_date + 3)
      INTO v_avaliacoes_pendentes, v_avaliacoes_urgentes
    FROM avaliacoes WHERE status IN ('agendada','em_andamento');

    SELECT count(*), count(*) FILTER (WHERE status = 'confirmado')
      INTO v_agendamentos_semana, v_agendamentos_confirmados
    FROM agendamentos
    WHERE data_inicio >= v_inicio_semana AND data_inicio < v_fim_semana;

  ELSIF v_eh_psicologo THEN
    SELECT id INTO v_func_id FROM funcionarios WHERE user_id = v_user LIMIT 1;

    SELECT count(DISTINCT c.id),
           count(DISTINCT c.id) FILTER (WHERE c.criado_em >= v_inicio_mes)
      INTO v_criancas_ativas, v_criancas_novas_mes
    FROM criancas c
    WHERE c.ativo = true
      AND tem_acesso_crianca(c.id, v_user);

    SELECT count(*), count(*) FILTER (WHERE data_sessao < now())
      INTO v_sessoes_hoje, v_sessoes_concluidas_hoje
    FROM sessoes
    WHERE data_sessao::date = current_date
      AND terapeuta_id = v_func_id;

    SELECT count(*), count(*) FILTER (WHERE data_avaliacao <= current_date + 3)
      INTO v_avaliacoes_pendentes, v_avaliacoes_urgentes
    FROM avaliacoes a
    WHERE a.status IN ('agendada','em_andamento')
      AND tem_acesso_crianca(a.crianca_id, v_user);

    SELECT count(*), count(*) FILTER (WHERE status = 'confirmado')
      INTO v_agendamentos_semana, v_agendamentos_confirmados
    FROM agendamentos
    WHERE data_inicio >= v_inicio_semana AND data_inicio < v_fim_semana
      AND terapeuta_id = v_func_id;

  ELSE
    -- Família
    SELECT count(DISTINCT c.id) INTO v_criancas_ativas
    FROM criancas c
    JOIN familia_membros fm ON fm.crianca_id = c.id
    WHERE fm.user_id = v_user AND c.ativo = true;

    SELECT count(*) INTO v_sessoes_hoje
    FROM sessoes s
    JOIN familia_membros fm ON fm.crianca_id = s.crianca_id
    WHERE fm.user_id = v_user AND s.data_sessao::date = current_date;

    SELECT count(*) INTO v_avaliacoes_pendentes
    FROM avaliacoes a
    JOIN familia_membros fm ON fm.crianca_id = a.crianca_id
    WHERE fm.user_id = v_user AND a.status IN ('agendada','em_andamento');

    SELECT count(*) INTO v_agendamentos_semana
    FROM agendamentos ag
    JOIN familia_membros fm ON fm.crianca_id = ag.crianca_id
    WHERE fm.user_id = v_user
      AND ag.data_inicio >= v_inicio_semana AND ag.data_inicio < v_fim_semana;
  END IF;

  RETURN jsonb_build_object(
    'criancas_ativas', v_criancas_ativas,
    'criancas_novas_mes', v_criancas_novas_mes,
    'sessoes_hoje', v_sessoes_hoje,
    'sessoes_concluidas_hoje', v_sessoes_concluidas_hoje,
    'avaliacoes_pendentes', v_avaliacoes_pendentes,
    'avaliacoes_urgentes', v_avaliacoes_urgentes,
    'agendamentos_semana', v_agendamentos_semana,
    'agendamentos_confirmados', v_agendamentos_confirmados
  );
END;
$$;

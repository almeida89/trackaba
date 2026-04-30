CREATE OR REPLACE FUNCTION public.dashboard_estatisticas()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_eh_equipe boolean;
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

  v_eh_equipe := has_role(v_user, 'admin')
    OR has_role(v_user, 'psicologo')
    OR has_role(v_user, 'coordenador')
    OR has_role(v_user, 'recepcionista');

  IF v_eh_equipe THEN
    SELECT count(*), count(*) FILTER (WHERE criado_em >= v_inicio_mes)
      INTO v_criancas_ativas, v_criancas_novas_mes
    FROM criancas WHERE ativo = true;

    SELECT count(*),
           count(*) FILTER (WHERE data_sessao < now())
      INTO v_sessoes_hoje, v_sessoes_concluidas_hoje
    FROM sessoes
    WHERE data_sessao::date = current_date;

    SELECT count(*), count(*) FILTER (WHERE data_avaliacao <= current_date + 3)
      INTO v_avaliacoes_pendentes, v_avaliacoes_urgentes
    FROM avaliacoes
    WHERE status IN ('agendada','em_andamento');

    SELECT count(*), count(*) FILTER (WHERE status = 'confirmado')
      INTO v_agendamentos_semana, v_agendamentos_confirmados
    FROM agendamentos
    WHERE data_inicio >= v_inicio_semana AND data_inicio < v_fim_semana;
  ELSE
    -- Família: limitado às crianças vinculadas
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

GRANT EXECUTE ON FUNCTION public.dashboard_estatisticas() TO authenticated;

-- Sessões e avaliações por mês (últimos 6 meses)
CREATE OR REPLACE FUNCTION public.dashboard_serie_mensal()
RETURNS TABLE(mes_inicio date, sessoes bigint, avaliacoes bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH meses AS (
    SELECT date_trunc('month', now() - (n || ' months')::interval)::date AS mes
    FROM generate_series(0, 5) n
  )
  SELECT
    m.mes,
    (SELECT count(*) FROM sessoes s
       WHERE date_trunc('month', s.data_sessao)::date = m.mes),
    (SELECT count(*) FROM avaliacoes a
       WHERE date_trunc('month', a.data_avaliacao)::date = m.mes)
  FROM meses m
  ORDER BY m.mes ASC;
$$;

GRANT EXECUTE ON FUNCTION public.dashboard_serie_mensal() TO authenticated;

-- Distribuição por nível de desempenho dos programas ativos
CREATE OR REPLACE FUNCTION public.dashboard_distribuicao_niveis()
RETURNS TABLE(nivel text, total bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nivel_desempenho::text, count(*)
  FROM programas
  WHERE ativo = true
  GROUP BY nivel_desempenho
  ORDER BY count(*) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.dashboard_distribuicao_niveis() TO authenticated;
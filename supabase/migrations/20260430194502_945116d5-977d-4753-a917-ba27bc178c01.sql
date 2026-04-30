-- 1. Enum status_sessao (rascunho, finalizada, assinada, cancelada, falta)
DO $$ BEGIN
  CREATE TYPE public.status_sessao AS ENUM ('rascunho','finalizada','assinada','cancelada','falta');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Colunas de estado em sessoes
ALTER TABLE public.sessoes
  ADD COLUMN IF NOT EXISTS status public.status_sessao NOT NULL DEFAULT 'rascunho',
  ADD COLUMN IF NOT EXISTS finalizada_em timestamptz,
  ADD COLUMN IF NOT EXISTS assinada_em timestamptz,
  ADD COLUMN IF NOT EXISTS assinada_por uuid,
  ADD COLUMN IF NOT EXISTS assinatura_hash text,
  ADD COLUMN IF NOT EXISTS reforcadores jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS local text NOT NULL DEFAULT 'clinica',
  ADD COLUMN IF NOT EXISTS sala text,
  ADD COLUMN IF NOT EXISTS nota_incidente text,
  ADD COLUMN IF NOT EXISTS evolucao_diaria text;

-- 3. Persistir nível de desempenho nos resultados
ALTER TABLE public.resultados_programa
  ADD COLUMN IF NOT EXISTS programa_nome text,
  ADD COLUMN IF NOT EXISTS objetivo text,
  ADD COLUMN IF NOT EXISTS nivel text NOT NULL DEFAULT 'AG';

-- 4. Trigger que bloqueia alterações em sessões assinadas (e nos filhos)
CREATE OR REPLACE FUNCTION public.fn_bloquear_sessao_assinada()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status public.status_sessao;
  v_sessao_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'sessoes' THEN
    IF TG_OP = 'UPDATE' THEN
      -- Permite somente a transição para 'cancelada' por admin caso necessário; bloqueia o restante
      IF OLD.status = 'assinada' THEN
        RAISE EXCEPTION 'Sessão assinada não pode ser modificada';
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.status = 'assinada' THEN
        RAISE EXCEPTION 'Sessão assinada não pode ser removida';
      END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Para tabelas filhas
  v_sessao_id := COALESCE((to_jsonb(NEW)->>'sessao_id')::uuid, (to_jsonb(OLD)->>'sessao_id')::uuid);
  IF v_sessao_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  SELECT status INTO v_status FROM public.sessoes WHERE id = v_sessao_id;
  IF v_status = 'assinada' THEN
    RAISE EXCEPTION 'Não é permitido alterar registros de sessão assinada';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trg_bloquear_sessao_assinada ON public.sessoes;
CREATE TRIGGER trg_bloquear_sessao_assinada
  BEFORE UPDATE OR DELETE ON public.sessoes
  FOR EACH ROW EXECUTE FUNCTION public.fn_bloquear_sessao_assinada();

DROP TRIGGER IF EXISTS trg_bloquear_resultados_assinada ON public.resultados_programa;
CREATE TRIGGER trg_bloquear_resultados_assinada
  BEFORE INSERT OR UPDATE OR DELETE ON public.resultados_programa
  FOR EACH ROW EXECUTE FUNCTION public.fn_bloquear_sessao_assinada();

DROP TRIGGER IF EXISTS trg_bloquear_abc_assinada ON public.registros_abc;
CREATE TRIGGER trg_bloquear_abc_assinada
  BEFORE INSERT OR UPDATE OR DELETE ON public.registros_abc
  FOR EACH ROW EXECUTE FUNCTION public.fn_bloquear_sessao_assinada();

-- 5. Trigger atualizado_em em sessoes (caso ainda não tenha)
DROP TRIGGER IF EXISTS trg_sessoes_atualizado_em ON public.sessoes;
CREATE TRIGGER trg_sessoes_atualizado_em
  BEFORE UPDATE ON public.sessoes
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- 6. RPC para finalizar sessão (rascunho -> finalizada)
CREATE OR REPLACE FUNCTION public.finalizar_sessao(_sessao_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status public.status_sessao;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'nao_autenticado'; END IF;
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'psicologo') OR has_role(auth.uid(),'coordenador')) THEN
    RAISE EXCEPTION 'sem_permissao';
  END IF;

  SELECT status INTO v_status FROM sessoes WHERE id = _sessao_id;
  IF v_status IS NULL THEN RAISE EXCEPTION 'sessao_nao_encontrada'; END IF;
  IF v_status = 'assinada' THEN RAISE EXCEPTION 'ja_assinada'; END IF;

  UPDATE sessoes SET status = 'finalizada', finalizada_em = now() WHERE id = _sessao_id;
END $$;

-- 7. RPC para assinar sessão (qualquer status -> assinada)
CREATE OR REPLACE FUNCTION public.assinar_sessao(_sessao_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status public.status_sessao;
  v_hash text;
  v_sessao record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'nao_autenticado'; END IF;
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'psicologo')) THEN
    RAISE EXCEPTION 'sem_permissao';
  END IF;

  SELECT * INTO v_sessao FROM sessoes WHERE id = _sessao_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'sessao_nao_encontrada'; END IF;
  IF v_sessao.status = 'assinada' THEN RAISE EXCEPTION 'ja_assinada'; END IF;

  v_hash := encode(digest(
    concat_ws('|', _sessao_id::text, v_sessao.crianca_id::text,
              v_sessao.data_sessao::text, v_sessao.observacoes,
              v_sessao.resumo_familia, auth.uid()::text, now()::text),
    'sha256'), 'hex');

  UPDATE sessoes
    SET status = 'assinada',
        assinada_em = now(),
        assinada_por = auth.uid(),
        assinatura_hash = v_hash,
        finalizada_em = COALESCE(finalizada_em, now())
    WHERE id = _sessao_id;

  INSERT INTO logs_auditoria (user_id, acao, entidade, entidade_id, descricao, detalhes)
  VALUES (auth.uid(), 'editar', 'sessoes', _sessao_id, 'Sessão assinada digitalmente',
          jsonb_build_object('hash', v_hash));

  RETURN jsonb_build_object('hash', v_hash, 'assinada_em', now());
END $$;

-- 8. Garantir extensão pgcrypto p/ digest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 9. Permissões
GRANT EXECUTE ON FUNCTION public.finalizar_sessao(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assinar_sessao(uuid) TO authenticated;

-- 10. Índices úteis
CREATE INDEX IF NOT EXISTS idx_sessoes_status ON public.sessoes(status);
CREATE INDEX IF NOT EXISTS idx_resultados_sessao ON public.resultados_programa(sessao_id);
CREATE INDEX IF NOT EXISTS idx_abc_sessao ON public.registros_abc(sessao_id);
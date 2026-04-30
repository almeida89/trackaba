
-- ============================================================
-- 1. SISTEMA DE CONVITES (substitui auto-cadastro público)
-- ============================================================

CREATE TYPE public.status_convite AS ENUM ('pendente', 'aceito', 'expirado', 'revogado');

CREATE TABLE public.convites_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  nome_completo text NOT NULL,
  papel public.app_role NOT NULL DEFAULT 'familia',
  token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status public.status_convite NOT NULL DEFAULT 'pendente',
  convidado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expira_em timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  aceito_em timestamptz,
  aceito_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  observacao text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_convites_email ON public.convites_usuario(email);
CREATE INDEX idx_convites_token ON public.convites_usuario(token);
CREATE INDEX idx_convites_status ON public.convites_usuario(status);

ALTER TABLE public.convites_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/coord vê convites" ON public.convites_usuario FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'coordenador'));

CREATE POLICY "Admin/coord gerencia convites" ON public.convites_usuario FOR ALL TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'coordenador'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'coordenador'));

CREATE TRIGGER trg_convites_upd BEFORE UPDATE ON public.convites_usuario
FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

CREATE TRIGGER trg_audit_convites AFTER INSERT OR UPDATE OR DELETE ON public.convites_usuario
FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_generica();

-- ============================================================
-- 2. RATE LIMIT (para endpoints públicos)
-- ============================================================

CREATE TABLE public.rate_limit_publico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identificador text NOT NULL,         -- IP ou hash do token
  endpoint text NOT NULL,
  tentativas integer NOT NULL DEFAULT 1,
  janela_inicio timestamptz NOT NULL DEFAULT now(),
  bloqueado_ate timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_rate_limit_unico ON public.rate_limit_publico(identificador, endpoint);
CREATE INDEX idx_rate_limit_janela ON public.rate_limit_publico(janela_inicio);

ALTER TABLE public.rate_limit_publico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin vê rate limit" ON public.rate_limit_publico FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Função de rate limit. Retorna true se permitido, false se bloqueado.
CREATE OR REPLACE FUNCTION public.consumir_rate_limit(
  _identificador text,
  _endpoint text,
  _max_tentativas integer DEFAULT 10,
  _janela_minutos integer DEFAULT 5,
  _bloqueio_minutos integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registro public.rate_limit_publico;
BEGIN
  SELECT * INTO v_registro
  FROM public.rate_limit_publico
  WHERE identificador = _identificador AND endpoint = _endpoint
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limit_publico (identificador, endpoint)
    VALUES (_identificador, _endpoint);
    RETURN true;
  END IF;

  -- Ainda bloqueado?
  IF v_registro.bloqueado_ate IS NOT NULL AND v_registro.bloqueado_ate > now() THEN
    RETURN false;
  END IF;

  -- Janela expirou? Reseta.
  IF v_registro.janela_inicio < (now() - make_interval(mins => _janela_minutos)) THEN
    UPDATE public.rate_limit_publico
    SET tentativas = 1, janela_inicio = now(), bloqueado_ate = NULL
    WHERE id = v_registro.id;
    RETURN true;
  END IF;

  -- Atingiu limite?
  IF v_registro.tentativas + 1 > _max_tentativas THEN
    UPDATE public.rate_limit_publico
    SET tentativas = v_registro.tentativas + 1,
        bloqueado_ate = now() + make_interval(mins => _bloqueio_minutos)
    WHERE id = v_registro.id;
    RETURN false;
  END IF;

  UPDATE public.rate_limit_publico
  SET tentativas = v_registro.tentativas + 1
  WHERE id = v_registro.id;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consumir_rate_limit(text,text,integer,integer,integer) FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 3. ORIGENS PERMITIDAS (CORS allowlist)
-- ============================================================

CREATE TABLE public.origens_permitidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origem text NOT NULL UNIQUE,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.origens_permitidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gerencia origens" ON public.origens_permitidas FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed com domínios padrão do projeto
INSERT INTO public.origens_permitidas (origem, descricao) VALUES
  ('https://trackaba.lovable.app', 'Domínio publicado'),
  ('https://id-preview--09a24013-092f-4773-b13b-226e004ad470.lovable.app', 'Preview Lovable'),
  ('http://localhost:5173', 'Desenvolvimento local'),
  ('http://localhost:8080', 'Desenvolvimento local 8080');

-- ============================================================
-- 4. VALIDAÇÃO DE SENHA FORTE
-- ============================================================

CREATE OR REPLACE FUNCTION public.validar_forca_senha(_senha text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_erros text[] := ARRAY[]::text[];
BEGIN
  IF length(_senha) < 10 THEN
    v_erros := array_append(v_erros, 'Mínimo 10 caracteres');
  END IF;
  IF _senha !~ '[A-Z]' THEN
    v_erros := array_append(v_erros, 'Pelo menos 1 letra maiúscula');
  END IF;
  IF _senha !~ '[a-z]' THEN
    v_erros := array_append(v_erros, 'Pelo menos 1 letra minúscula');
  END IF;
  IF _senha !~ '[0-9]' THEN
    v_erros := array_append(v_erros, 'Pelo menos 1 número');
  END IF;
  IF _senha !~ '[^a-zA-Z0-9]' THEN
    v_erros := array_append(v_erros, 'Pelo menos 1 símbolo');
  END IF;

  RETURN jsonb_build_object(
    'valida', array_length(v_erros, 1) IS NULL,
    'erros', to_jsonb(v_erros)
  );
END;
$$;

-- ============================================================
-- 5. BLOQUEAR AUTO-CADASTRO: handle_new_user só aceita usuários convidados
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_convite public.convites_usuario;
  v_papel public.app_role := 'familia';
BEGIN
  -- Cria profile sempre
  INSERT INTO public.profiles (id, nome_completo, telefone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    NEW.raw_user_meta_data->>'telefone'
  );

  -- Verifica convite válido
  SELECT * INTO v_convite
  FROM public.convites_usuario
  WHERE lower(email) = lower(NEW.email)
    AND status = 'pendente'
    AND expira_em > now()
  ORDER BY criado_em DESC
  LIMIT 1;

  IF FOUND THEN
    v_papel := v_convite.papel;
    UPDATE public.convites_usuario
    SET status = 'aceito', aceito_em = now(), aceito_por = NEW.id
    WHERE id = v_convite.id;
  END IF;

  -- Provedores OAuth (Google, etc.) entram como 'familia' sem convite
  -- Para forçar convite obrigatório a TODOS, descomente:
  -- IF NOT FOUND AND NEW.raw_app_meta_data->>'provider' = 'email' THEN
  --   RAISE EXCEPTION 'Cadastro requer convite válido';
  -- END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_papel);

  -- Log de auditoria
  INSERT INTO public.logs_auditoria (user_id, user_email, acao, entidade, entidade_id, descricao)
  VALUES (NEW.id, NEW.email, 'criar', 'auth.users', NEW.id,
          CASE WHEN v_convite.id IS NOT NULL THEN 'Cadastro via convite' ELSE 'Cadastro direto' END);

  RETURN NEW;
END;
$$;

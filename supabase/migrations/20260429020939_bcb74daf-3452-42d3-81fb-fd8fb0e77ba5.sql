-- Enum de status (reaproveita se já existir)
DO $$ BEGIN
  CREATE TYPE public.status_acesso_escola AS ENUM ('ativo', 'pendente', 'expirado', 'revogado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.acessos_escola (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id uuid NOT NULL,
  crianca_nome text NOT NULL,
  escola_nome text NOT NULL,
  responsavel_nome text NOT NULL,
  responsavel_cargo text NOT NULL,
  email text NOT NULL,
  telefone text,
  status public.status_acesso_escola NOT NULL DEFAULT 'pendente',
  criado_em timestamptz NOT NULL DEFAULT now(),
  expira_em timestamptz NOT NULL,
  ultimo_acesso timestamptz,
  ver_sessoes boolean NOT NULL DEFAULT true,
  ver_evolucao boolean NOT NULL DEFAULT true,
  ver_programas boolean NOT NULL DEFAULT false,
  ver_relatorios boolean NOT NULL DEFAULT false,
  ver_incidentes boolean NOT NULL DEFAULT false,
  observacao text,
  token_convite uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_acessos_escola_crianca ON public.acessos_escola(crianca_id);
CREATE INDEX idx_acessos_escola_status ON public.acessos_escola(status);
CREATE INDEX idx_acessos_escola_token ON public.acessos_escola(token_convite);

ALTER TABLE public.acessos_escola ENABLE ROW LEVEL SECURITY;

-- Admins e psicólogos: acesso total
CREATE POLICY "Admins veem todos os acessos"
  ON public.acessos_escola FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'psicologo') OR public.has_role(auth.uid(), 'coordenador'));

CREATE POLICY "Admins inserem acessos"
  ON public.acessos_escola FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'psicologo') OR public.has_role(auth.uid(), 'coordenador'));

CREATE POLICY "Admins atualizam acessos"
  ON public.acessos_escola FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'psicologo'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'psicologo'));

CREATE POLICY "Admins removem acessos"
  ON public.acessos_escola FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para atualizar atualizado_em
CREATE TRIGGER trg_acessos_escola_atualizado
  BEFORE UPDATE ON public.acessos_escola
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();
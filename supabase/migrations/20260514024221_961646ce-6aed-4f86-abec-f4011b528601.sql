ALTER TABLE public.criancas
  ADD COLUMN IF NOT EXISTS pediatra_nome text,
  ADD COLUMN IF NOT EXISTS pediatra_telefone text,
  ADD COLUMN IF NOT EXISTS neurologista_nome text,
  ADD COLUMN IF NOT EXISTS alergias text,
  ADD COLUMN IF NOT EXISTS medicacoes text,
  ADD COLUMN IF NOT EXISTS escola_nome text,
  ADD COLUMN IF NOT EXISTS escola_serie text,
  ADD COLUMN IF NOT EXISTS escola_professor text,
  ADD COLUMN IF NOT EXISTS escola_telefone text;
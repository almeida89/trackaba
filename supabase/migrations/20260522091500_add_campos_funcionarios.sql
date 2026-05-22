-- Adiciona colunas usadas pelo formulário de funcionários.
ALTER TABLE public.funcionarios
  ADD COLUMN IF NOT EXISTS nivel_acesso text,
  ADD COLUMN IF NOT EXISTS carga_horaria_semanal integer,
  ADD COLUMN IF NOT EXISTS data_admissao date;

-- Backfill simples para não deixar nulo em registros antigos.
UPDATE public.funcionarios
SET nivel_acesso = COALESCE(nivel_acesso, 'operacional')
WHERE nivel_acesso IS NULL;

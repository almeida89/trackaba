-- Refatora cargos: `cargo` passa a armazenar categoria macro e `sub_cargo` a opção detalhada do formulário.
ALTER TABLE public.funcionarios
  ADD COLUMN IF NOT EXISTS sub_cargo text;

-- Se `cargo` ainda for enum, converte para text para armazenar apenas macro categoria.
ALTER TABLE public.funcionarios
  ALTER COLUMN cargo TYPE text USING cargo::text;

-- Backfill de sub_cargo a partir do cargo antigo, quando aplicável.
UPDATE public.funcionarios
SET sub_cargo = COALESCE(sub_cargo,
  CASE
    WHEN cargo IN ('psicologo') THEN 'Psicólogo(a)'
    WHEN cargo IN ('terapeuta') THEN 'Analista do Comportamento'
    WHEN cargo IN ('coordenador') THEN 'Coordernador(a) Clínico(a)'
    WHEN cargo IN ('supervisor') THEN 'Supervisor(a)'
    WHEN cargo IN ('recepcionista') THEN 'Recepção'
    WHEN cargo IN ('admin') THEN 'Administrativo'
    ELSE 'Analista do Comportamento'
  END
);

-- Backfill do macro cargo para as duas categorias novas.
UPDATE public.funcionarios
SET cargo = CASE
  WHEN sub_cargo IN ('Analista do Comportamento','Terapeuta ABA','Psicólogo(a)','Fonoaudiologo(a)','Terapeuta Ocupacional') THEN 'terapeuta'
  ELSE 'administracao'
END;

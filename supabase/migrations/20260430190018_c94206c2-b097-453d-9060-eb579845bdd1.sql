
REVOKE EXECUTE ON FUNCTION public.validar_forca_senha(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.origem_permitida(_origem text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.origens_permitidas
    WHERE ativo = true AND origem = _origem
  );
$$;

REVOKE EXECUTE ON FUNCTION public.origem_permitida(text) FROM PUBLIC, anon, authenticated;

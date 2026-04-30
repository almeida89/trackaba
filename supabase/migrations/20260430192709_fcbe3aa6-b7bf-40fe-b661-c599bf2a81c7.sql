REVOKE EXECUTE ON FUNCTION public.tem_acesso_crianca(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.consumir_rate_limit(text, text, integer, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.origem_permitida(text) FROM anon, authenticated;
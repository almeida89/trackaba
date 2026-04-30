GRANT EXECUTE ON FUNCTION public.tem_acesso_crianca(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.origem_permitida(text) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.consumir_rate_limit(text, text, integer, integer, integer) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.validar_forca_senha(text) TO authenticated, anon, service_role;
GRANT SELECT ON public.vw_criancas_listagem TO authenticated;
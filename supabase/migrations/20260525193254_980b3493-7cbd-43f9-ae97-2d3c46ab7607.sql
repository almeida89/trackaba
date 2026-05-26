DROP POLICY IF EXISTS "Equipe vê agendamentos" ON public.agendamentos;

CREATE POLICY "Equipe vê agendamentos"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'coordenador'::app_role)
  OR has_role(auth.uid(), 'recepcionista'::app_role)
  OR (
    has_role(auth.uid(), 'psicologo'::app_role)
    AND tem_acesso_crianca(crianca_id, auth.uid())
  )
);
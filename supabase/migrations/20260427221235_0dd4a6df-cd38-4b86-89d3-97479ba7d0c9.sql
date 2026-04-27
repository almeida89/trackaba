DROP POLICY IF EXISTS "Admins atualizam papéis" ON public.user_roles;

CREATE POLICY "Admins atualizam papéis"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.criancas
  ADD COLUMN IF NOT EXISTS acomp_escolar_nome text,
  ADD COLUMN IF NOT EXISTS acomp_escolar_horario text,
  ADD COLUMN IF NOT EXISTS acomp_escolar_objetivos text,
  ADD COLUMN IF NOT EXISTS acomp_escolar_observacoes text;

-- Storage policies for anexos-criancas (path format: {crianca_id}/filename)
DROP POLICY IF EXISTS "Anexos: equipe vê" ON storage.objects;
DROP POLICY IF EXISTS "Anexos: equipe envia" ON storage.objects;
DROP POLICY IF EXISTS "Anexos: equipe atualiza" ON storage.objects;
DROP POLICY IF EXISTS "Anexos: equipe remove" ON storage.objects;
DROP POLICY IF EXISTS "Anexos: família vê" ON storage.objects;

CREATE POLICY "Anexos: equipe vê"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'anexos-criancas' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordenador') OR
    public.has_role(auth.uid(), 'psicologo') OR
    public.has_role(auth.uid(), 'recepcionista')
  )
);

CREATE POLICY "Anexos: família vê"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'anexos-criancas' AND
  EXISTS (
    SELECT 1 FROM public.familia_membros fm
    WHERE fm.user_id = auth.uid()
      AND fm.crianca_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Anexos: equipe envia"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'anexos-criancas' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordenador') OR
    public.has_role(auth.uid(), 'psicologo')
  )
);

CREATE POLICY "Anexos: equipe atualiza"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'anexos-criancas' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordenador') OR
    public.has_role(auth.uid(), 'psicologo')
  )
);

CREATE POLICY "Anexos: equipe remove"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'anexos-criancas' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordenador')
  )
);


-- ============================================================
-- 1. VIEW DE LISTAGEM (última sessão calculada no banco)
-- ============================================================

CREATE OR REPLACE VIEW public.vw_criancas_listagem
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.nome,
  c.data_nascimento,
  c.diagnostico,
  c.responsavel_principal,
  c.foto_url,
  c.ativo,
  c.criado_em,
  EXTRACT(YEAR FROM age(c.data_nascimento))::int AS idade,
  ult.data_sessao AS ultima_sessao_data,
  ult.terapeuta_nome AS ultima_sessao_terapeuta
FROM public.criancas c
LEFT JOIN LATERAL (
  SELECT s.data_sessao, s.terapeuta_nome
  FROM public.sessoes s
  WHERE s.crianca_id = c.id
  ORDER BY s.data_sessao DESC
  LIMIT 1
) ult ON true;

GRANT SELECT ON public.vw_criancas_listagem TO authenticated;

-- Índice para busca por nome (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_criancas_nome_lower ON public.criancas (lower(nome));

-- ============================================================
-- 2. STORAGE: bucket de fotos
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-criancas',
  'fotos-criancas',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Equipe vê todas as fotos
CREATE POLICY "Equipe vê fotos crianças"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'fotos-criancas' AND (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'psicologo') OR
    has_role(auth.uid(),'coordenador') OR
    has_role(auth.uid(),'recepcionista')
  )
);

-- Família vê fotos das crianças vinculadas (pasta = id da criança)
CREATE POLICY "Família vê fotos da criança"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'fotos-criancas'
  AND EXISTS (
    SELECT 1 FROM public.familia_membros fm
    WHERE fm.user_id = auth.uid()
      AND fm.crianca_id::text = (storage.foldername(name))[1]
  )
);

-- Equipe envia / atualiza / remove
CREATE POLICY "Equipe envia fotos crianças"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'fotos-criancas' AND (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'psicologo') OR
    has_role(auth.uid(),'coordenador') OR
    has_role(auth.uid(),'recepcionista')
  )
);

CREATE POLICY "Equipe atualiza fotos crianças"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'fotos-criancas' AND (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'psicologo') OR
    has_role(auth.uid(),'coordenador')
  )
);

CREATE POLICY "Equipe remove fotos crianças"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'fotos-criancas' AND (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'coordenador')
  )
);

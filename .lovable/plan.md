## Objetivo

Deixar o TrackABA pronto para uma **reunião de demonstração comercial** com donos de clínica em 1-2 dias de trabalho. Não é versão vendável ainda — é uma demo polida com dados realistas e narrativa clara, suficiente para validar interesse e cobrar pré-venda.

## Os 4 módulos que precisam estar impecáveis

1. **Pasta da Criança + Sessões** — coração clínico do produto
2. **Programas + Gráficos de evolução** — diferencial técnico ABA
3. **Visão da Escola** (convite + portal externo) — diferencial competitivo
4. **Visão da Família** (portal dos pais) — argumento de retenção

---

## Entregas

### 1. Landing/Login com pitch de venda
- Substituir tela `/auth` atual por uma versão com **hero institucional** à esquerda (logo TrackABA, headline "O CRM clínico feito para terapia ABA", 3 bullets de benefícios) e formulário à direita.
- Botão grande **"Entrar como demonstração"** que faz login automático com `admin@clinica.com` / `Admin@2025` — para o cliente não ter que digitar nada na reunião.
- Rodapé com selo "Compatível com LGPD" e contato.

### 2. Remover trilha de auditoria fake (bloqueador de credibilidade)
- Apagar os 15 logs hardcoded em `PaginaLogs.tsx`.
- Criar tabela `logs_auditoria` no banco com RLS (apenas admin lê).
- Registrar eventos reais: login, logout, criação de criança, convite de escola, alteração de papel.
- Página `/logs` passa a ler do banco — começa vazia e vai populando conforme o cliente navega na demo (isso impressiona).

### 3. Seed de dados de exemplo realistas
- Migrar Crianças, Sessões, Programas e Família dos arquivos `dados*.ts` para o banco com seed inicial.
- Criar **3 crianças-demo** com nomes fictícios brasileiros, idades variadas, com:
  - 8-12 sessões cada (últimos 60 dias)
  - 3-4 programas ativos por criança em níveis de desempenho diferentes
  - Registros ABC de exemplo
  - Família vinculada (pai + mãe)
  - 1 escola já convidada com permissões variadas
- Gráficos passam a refletir esses dados reais → linhas de evolução fazem sentido.

### 4. Portal da Família (novo)
- Criar role `familia` que ao logar é redirecionado para `/familia/portal` (não vê barra lateral admin).
- Tela mostra: foto e nome do filho, próxima sessão agendada, últimas 5 evoluções em linguagem simples (sem jargão técnico), gráfico simplificado de progresso, botão "Falar com a equipe".
- Criar **conta de família-demo** (`familia@demo.com` / `Familia@2025`) já vinculada a uma das crianças do seed → na reunião você abre uma janela anônima e mostra a visão dos pais ao vivo.

### 5. Portal externo da Escola (completar o que falta)
- Rota pública `/escola/visao/:token` que valida o `token_convite` da tabela `acessos_escola` sem exigir login na clínica.
- Mostra apenas o que as permissões do convite autorizam (sessões, evolução, programas).
- Banner no topo: "Acesso concedido por [Clínica X] — válido até [data]".
- Na reunião você abre o link em outra aba mostrando "como o professor enxerga".

### 6. Polimento de UI
- Empty states bonitos em todas as listas (ilustração + texto + CTA), substituindo listas vazias.
- Skeletons de carregamento em vez de telas em branco enquanto o Supabase responde.
- Toasts de sucesso em todas as ações principais.
- Revisar dashboard inicial (`/`): substituir números mock por contagens reais (`SELECT count(*)`).

### 7. Material de apoio para a reunião
Gerar e salvar em `/mnt/documents/`:
- **Roteiro de demo** (PDF, ~2 páginas) — passo a passo de 25 minutos cobrindo os 4 módulos na ordem certa, com falas sugeridas.
- **One-pager comercial** (PDF, 1 página) — problema, solução, diferenciais, próximos passos, valor sugerido.
- **Checklist pré-reunião** — abrir 3 abas (admin, família, escola), limpar logs, etc.

---

## Detalhes técnicos

**Tabelas novas:**
```text
logs_auditoria    (id, user_id, acao, entidade, entidade_id, detalhes jsonb, criado_em)
criancas          (id, nome, data_nasc, responsavel_id, ativo, criado_em, ...)
sessoes           (id, crianca_id, terapeuta_id, data, duracao, observacoes, ...)
programas         (id, crianca_id, nome, dominio, nivel_desempenho, ...)
familia_membros   (id, crianca_id, user_id, parentesco)
```
Todas com RLS por `user_id`/papel + função `tem_acesso_crianca(uuid)` (SECURITY DEFINER) para simplificar policies.

**Função SECURITY DEFINER exposta** (alerta atual): adicionar `REVOKE EXECUTE ... FROM authenticated` nas funções utilitárias internas, mantendo apenas `has_role` exposta.

**Novos arquivos principais:**
- `src/paginas/PaginaPortalFamilia.tsx`
- `src/paginas/PaginaVisaoEscolaPublica.tsx` (rota pública)
- `src/componentes/EmptyState.tsx`
- `src/hooks/useLogAuditoria.tsx`
- `supabase/migrations/<nova>_logs_auditoria_e_seed.sql`

**Rota pública:** adicionar `/escola/visao/:token` em `App.tsx` FORA do `<RotaProtegida>`.

---

## O que NÃO entra nesta etapa

- Envio real de e-mail de convite (escola fica com link copiável apenas)
- Termo de consentimento LGPD assinável
- Backup automatizado e exportação LGPD
- 2FA, criptografia de campos
- Pagamento/assinatura

Esses ficam para a fase "MVP vendável" (1-2 semanas), após validar interesse na demo.

---

## Resultado esperado

Ao final, você consegue:
1. Abrir a reunião com a landing nova → dono entende o produto em 30 segundos
2. Login automático → entra direto numa clínica com 3 crianças, dados ricos, gráficos bonitos
3. Demonstrar os 4 módulos seguindo o roteiro impresso
4. Abrir aba anônima e mostrar a visão da família e a visão da escola ao vivo
5. Encerrar com o one-pager comercial impresso na mão do cliente
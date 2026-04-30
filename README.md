# TrackABA

CRM clínico desenhado especificamente para clínicas que oferecem terapia **ABA (Análise do Comportamento Aplicada)**. O sistema centraliza o acompanhamento de crianças, sessões, programas, evolução, agenda, equipe, escola parceira e família — com portais dedicados para cada perfil.

> Projeto construído com **Lovable** + **Lovable Cloud** (Supabase gerenciado), publicado em [trackaba.lovable.app](https://trackaba.lovable.app).

---

## 📋 Sumário

- [Visão geral](#-visão-geral)
- [Stack](#-stack)
- [Requisitos](#-requisitos)
- [Setup local](#-setup-local)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Scripts disponíveis](#-scripts-disponíveis)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Fluxo de desenvolvimento](#-fluxo-de-desenvolvimento)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Troubleshooting](#-troubleshooting)
- [Licença](#-licença)

---

## 🎯 Visão geral

O TrackABA atende três perfis principais:

- **Equipe clínica** (admin, psicólogos, terapeutas, supervisores) — gestão completa: pasta da criança, registro de sessões, programas, gráficos de evolução, agenda, avaliações, relatórios em PDF, funcionários e configurações.
- **Família** — portal simplificado (`/familia/portal`) com próximas sessões, evoluções em linguagem acessível e gráfico de progresso.
- **Escola parceira** — portal público via token (`/escola/visao/:token`) com permissões granulares definidas no convite.

Funcionalidades centrais:

- Pasta da criança com dados clínicos, responsáveis e histórico
- Registro de sessões com programas, reforçadores e formulário ABC
- Programas ABA com níveis de desempenho (linha base → independente)
- Gráficos de evolução, acertos e distribuição (Recharts)
- Agenda com agendamentos e detalhes
- Convite de escolas com link público e permissões configuráveis
- Trilha de auditoria persistida em banco
- Relatórios em PDF (jsPDF)
- Autenticação completa (login, cadastro, recuperação e troca de senha) com mensagens em PT-BR
- Controle de papéis via tabela `user_roles` + RLS

---

## 🧱 Stack

**Frontend**
- React 18 + TypeScript 5
- Vite 5 (`@vitejs/plugin-react-swc`)
- Tailwind CSS 3 + tokens semânticos (HSL) em `src/index.css`
- shadcn/ui (Radix primitives) em `src/components/ui`
- React Router v6
- TanStack Query v5
- React Hook Form + Zod
- Framer Motion
- Recharts
- jsPDF + jspdf-autotable
- date-fns, sonner, lucide-react, dnd-kit, embla-carousel

**Backend (Lovable Cloud / Supabase)**
- PostgreSQL com Row-Level Security
- Supabase Auth (e-mail/senha)
- Edge Functions em Deno (`supabase/functions/admin-users`, `validar-token-escola`)
- Migrações SQL versionadas em `supabase/migrations`

**Qualidade**
- Vitest 3 + Testing Library + jsdom
- ESLint 9 + typescript-eslint
- GitHub Actions (testes de segurança RLS diários)

---

## ✅ Requisitos

- **Node.js** ≥ 18 (recomendado 20+)
- **Bun** ≥ 1.0 (gerenciador padrão — `bun.lockb` no repositório) **ou** npm/pnpm equivalente
- Navegador moderno (Chrome, Edge, Firefox, Safari)
- Acesso ao projeto no [Lovable](https://lovable.dev) ou conexão GitHub para clonar localmente

> O backend (Lovable Cloud) já está provisionado e configurado — não é necessário subir Supabase local para desenvolvimento.

---

## 🚀 Setup local

```bash
# 1. Clone o repositório (após conectar GitHub no Lovable)
git clone <url-do-repo>
cd trackaba

# 2. Instale as dependências
bun install
# ou: npm install

# 3. Verifique se o arquivo .env existe na raiz (gerado automaticamente pelo Lovable Cloud)
cat .env

# 4. Suba o servidor de desenvolvimento
bun run dev
# ou: npm run dev
```

A aplicação ficará disponível em **http://localhost:8080** (porta definida em `vite.config.ts`).

---

## 🔐 Variáveis de ambiente

O arquivo `.env` é **gerado e mantido automaticamente** pelo Lovable Cloud. Não edite manualmente.

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL pública do backend Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anônima (publishable) usada no cliente |
| `VITE_SUPABASE_PROJECT_ID` | Identificador do projeto no Lovable Cloud |

Segredos sensíveis (chaves de serviço, tokens externos) **nunca** ficam no `.env` — são configurados como secrets das Edge Functions no painel do Lovable Cloud.

---

## 📜 Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `vite` | Servidor de desenvolvimento com HMR (porta 8080) |
| `build` | `vite build` | Build de produção (saída em `dist/`) |
| `build:dev` | `vite build --mode development` | Build em modo desenvolvimento (sourcemaps) |
| `preview` | `vite preview` | Pré-visualiza o build local |
| `lint` | `eslint .` | Análise estática com ESLint |
| `test` | `vitest run` | Executa toda a suíte de testes |
| `test:watch` | `vitest` | Testes em modo observador |
| `test:security` | `vitest run src/test/security` | Roda apenas os testes de RLS/segurança |

---

## 🗂️ Estrutura de pastas

```
trackaba/
├── public/                       # Estáticos (favicon, robots.txt, placeholders)
├── src/
│   ├── componentes/              # Componentes de domínio em PT-BR
│   │   ├── agenda/               # Grade, diálogo e tipos de agenda
│   │   ├── avaliacoes/           # Diálogo e dados de avaliações
│   │   ├── configuracoes/        # Abas de configurações (ex.: usuários)
│   │   ├── escola/               # Convite, visão e relatório PDF da escola
│   │   ├── familia/              # Diálogo e seção familiar da criança
│   │   ├── funcionarios/         # CRUD de funcionários
│   │   ├── graficos/             # Gráficos de evolução, acertos, distribuição
│   │   ├── programas/            # Cartões e diálogo de programas ABA
│   │   ├── relatorios/           # Geração de relatórios em PDF
│   │   ├── sessoes/              # Sessão, ABC, reforçadores, registros
│   │   ├── BarraLateral.tsx      # Navegação principal
│   │   ├── LayoutPrincipal.tsx   # Shell com sidebar
│   │   ├── RotaProtegida.tsx     # Guard de autenticação
│   │   ├── RotaEquipe.tsx        # Guard para perfis internos
│   │   └── RotaAdmin.tsx         # Guard de admin
│   ├── components/ui/            # shadcn/ui (Radix primitives)
│   ├── hooks/                    # useAuth, useCrianca(s), useUserRole, useLogAuditoria, ...
│   ├── integrations/supabase/    # client.ts e types.ts (auto-gerados — NÃO editar)
│   ├── lib/                      # Utilitários compartilhados
│   ├── paginas/                  # Páginas em PT-BR (rotas)
│   │   ├── PainelPrincipal.tsx
│   │   ├── ListaCriancas.tsx
│   │   ├── PastaCrianca.tsx
│   │   ├── PaginaAuth.tsx
│   │   ├── PaginaPortalFamilia.tsx
│   │   ├── PaginaVisaoEscolaPublica.tsx
│   │   └── ...
│   ├── pages/                    # Páginas auxiliares (NotFound, Index)
│   ├── test/                     # Testes (Vitest)
│   │   ├── navegacao.test.tsx    # Cobertura de navegação
│   │   ├── security/             # Testes de RLS
│   │   └── setup.ts
│   ├── App.tsx                   # Definição de rotas
│   ├── main.tsx                  # Bootstrap React
│   └── index.css                 # Tokens de design (HSL)
├── supabase/
│   ├── functions/                # Edge Functions (Deno)
│   │   ├── admin-users/
│   │   └── validar-token-escola/
│   ├── migrations/               # Migrações SQL versionadas
│   └── config.toml               # Config das functions
├── .github/workflows/            # CI (security-tests.yml)
├── tailwind.config.ts
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

> **Convenção:** todo o código de domínio é escrito em **português (pt-BR)** — nomes de arquivos, componentes, variáveis, rotas e textos de UI. Apenas os componentes shadcn em `src/components/ui` permanecem em inglês por compatibilidade.

---

## 🌿 Fluxo de desenvolvimento

O repositório usa **sincronização bidirecional com o Lovable**. Mudanças feitas no editor Lovable sobem automaticamente para o GitHub e vice-versa.

### Branch e PR

1. Crie uma branch a partir de `main`:
   ```bash
   git checkout -b feat/nome-da-feature
   ```
2. Convenção de nomes:
   - `feat/...` — nova funcionalidade
   - `fix/...` — correção
   - `chore/...` — tarefa interna (build, deps, ci)
   - `docs/...` — documentação
   - `refactor/...` — refatoração sem mudança de comportamento
3. Commits no padrão **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
4. Antes de abrir o PR, rode localmente:
   ```bash
   bun run lint
   bun run test
   bun run build
   ```
5. Abra o Pull Request para `main`. O workflow de segurança (`.github/workflows/security-tests.yml`) roda os testes de RLS automaticamente.
6. Aguarde revisão e CI verde antes do merge (squash recomendado).

### Mudanças no banco

- **Sempre** crie uma migração em `supabase/migrations` — não edite o schema diretamente.
- Nunca altere `src/integrations/supabase/client.ts` nem `types.ts` (gerados automaticamente).
- Toda nova tabela deve ter **RLS habilitado** com policies explícitas.

---

## 🧪 Testes

A suíte usa **Vitest 3** com `jsdom` e `@testing-library/react`. Setup global em `src/test/setup.ts`.

```bash
bun run test            # Toda a suíte
bun run test:watch      # Modo watch
bun run test:security   # Apenas testes de RLS
```

**Cobertura atual:**

- `src/test/navegacao.test.tsx` — valida que todos os botões de acesso rápido do `PainelPrincipal` e os 15 links da `BarraLateral` redirecionam para as rotas corretas.
- `src/test/security/rlsSeguranca.test.ts` — verifica isolamento por `user_id` e papéis nas tabelas críticas (executado também diariamente no GitHub Actions).
- `src/test/example.test.ts` — sanity check do ambiente Vitest.

Ao adicionar uma nova feature com regra de acesso, **adicione um teste de RLS** correspondente.

---

## 🚢 Deploy

### Frontend

1. Abra o projeto no [Lovable](https://lovable.dev).
2. Clique em **Publish** (canto superior direito).
3. As mudanças de frontend exigem clicar em **Update** no diálogo de publicação para irem ao ar.
4. URL pública padrão: **https://trackaba.lovable.app**.
5. Para domínio customizado: **Project Settings → Domains** (após o primeiro publish).

### Backend (Edge Functions e migrações)

- **Deploy automático**: ao salvar uma Edge Function ou criar uma migração SQL, o Lovable Cloud aplica imediatamente em produção.
- Verifique logs em tempo real no painel do Lovable Cloud.

### Hospedagem alternativa

O projeto é Vite puro — pode ser hospedado em Vercel, Netlify, Cloudflare Pages ou qualquer estático após `bun run build` (saída em `dist/`). As variáveis de ambiente `VITE_SUPABASE_*` precisam estar configuradas no provedor.

---

## 🛠️ Troubleshooting

| Problema | Solução |
|---|---|
| **Tela em branco após login** | Verifique no console se `VITE_SUPABASE_URL` está definido. O `.env` deve existir na raiz. |
| **`useAuth deve ser usado dentro de AuthProvider`** | A página foi renderizada fora do `<AuthProvider>` em `App.tsx`. |
| **404 ao recarregar uma rota interna** | Em hospedagem própria, configure o fallback SPA para `index.html`. No Lovable já é nativo. |
| **Erro 401/403 ao consultar tabela** | RLS bloqueando. Verifique se o usuário tem o papel correto em `user_roles` e se a policy permite a operação. |
| **Mensagens de auth em inglês** | Adicione a tradução em `traduzirErro()` em `src/hooks/useAuth.tsx`. |
| **Build falha por tipo do Supabase** | NÃO edite `src/integrations/supabase/types.ts` manualmente. Aplique uma migração e o tipo é regerado. |
| **Porta 8080 ocupada** | Altere `server.port` em `vite.config.ts` ou libere a porta. |
| **Testes não encontram `expect`** | Confirme `types: ["vitest/globals"]` em `tsconfig.app.json` e o setup em `src/test/setup.ts`. |
| **Edge function retorna CORS** | Verifique cabeçalhos `Access-Control-Allow-Origin` na resposta da function. |
| **Cliente não recebe atualização realtime** | Confirme `ALTER PUBLICATION supabase_realtime ADD TABLE ...` na migração e a policy de SELECT. |

---

## 📄 Licença

Projeto **proprietário**. Todos os direitos reservados © 2026 TrackABA.

Uso, redistribuição ou modificação requerem autorização prévia por escrito dos mantenedores.

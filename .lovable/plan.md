## Objetivo

Criar uma tela inicial de **Login / Cadastro** (e-mail e senha), proteger as rotas internas do sistema, armazenar dados de perfil dos usuários e implementar um sistema de **papéis** (admin, psicólogo, coordenador, recepcionista, família) com controle de acesso seguro. Criar também a conta admin de teste `admin@clinica.com` / `Admin@2025`.

---

## O que será entregue

1. **Tela `/auth`** — página inicial pública com duas abas:
   - **Entrar** (e-mail + senha)
   - **Criar conta** (nome completo, e-mail, telefone, senha)
   - Mensagens de erro amigáveis em português (credenciais inválidas, e-mail já cadastrado, e-mail não confirmado, etc.)
   - Aviso ao se cadastrar: "Confirme seu e-mail antes de entrar".

2. **Proteção de rotas** — todas as páginas internas (`/`, `/pacientes`, `/agenda`, `/avaliacoes`, `/configuracoes`, `/logs`, etc.) só são acessíveis para usuários autenticados. Quem não estiver logado é redirecionado para `/auth`.

3. **Cabeçalho/Sidebar** — exibe nome do usuário logado, papel (badge), e botão **Sair**.

4. **Conta admin de teste** — criada automaticamente via migration:
   - E-mail: `admin@clinica.com`
   - Senha: `Admin@2025`
   - Papel: `admin`
   - Já confirmada (pulando verificação de e-mail apenas para esta conta seed).

5. **Página `/configuracoes` → aba Usuários** (apenas admin) — listar usuários cadastrados e alterar o papel de cada um.

---

## Arquitetura técnica (banco de dados)

### Enum `app_role`
```
admin | psicologo | coordenador | recepcionista | familia
```

### Tabela `profiles`
- `id` (uuid, PK, FK → `auth.users.id`, ON DELETE CASCADE)
- `nome_completo` (text)
- `telefone` (text, nullable)
- `avatar_url` (text, nullable)
- `criado_em`, `atualizado_em` (timestamps)
- RLS: cada usuário lê/atualiza somente o próprio perfil; admins leem todos.

### Tabela `user_roles` (separada — segurança crítica)
- `id` (uuid PK)
- `user_id` (uuid → `auth.users.id`, ON DELETE CASCADE)
- `role` (`app_role`)
- UNIQUE (`user_id`, `role`)
- RLS: usuário lê o próprio papel; apenas admin pode inserir/alterar/remover papéis.

### Função `has_role(_user_id uuid, _role app_role) returns boolean`
- `SECURITY DEFINER`, `STABLE`, `search_path = public`
- Usada em todas as policies de admin para evitar recursão de RLS.

### Trigger `handle_new_user`
- Após `INSERT` em `auth.users`, cria automaticamente:
  - linha em `profiles` (nome vindo do `raw_user_meta_data.nome_completo`)
  - linha em `user_roles` com papel padrão `familia` (admin promove depois)

### Seed do admin
- Inserir usuário diretamente em `auth.users` com `email_confirmed_at = now()`, senha hasheada (`crypt('Admin@2025', gen_salt('bf'))`), e atribuir papel `admin` em `user_roles`.

---

## Arquitetura técnica (frontend)

### Novos arquivos
- `src/paginas/PaginaAuth.tsx` — formulários de login e cadastro (Tabs do shadcn)
- `src/hooks/useAuth.tsx` — provider/contexto com `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`. Usa `onAuthStateChange` configurado **antes** de `getSession()` para evitar deadlocks.
- `src/hooks/useUserRole.tsx` — busca o papel do usuário em `user_roles`
- `src/componentes/RotaProtegida.tsx` — wrapper que redireciona para `/auth` se não houver sessão
- `src/componentes/RotaAdmin.tsx` — wrapper extra que exige papel `admin`
- `src/componentes/configuracoes/AbaUsuarios.tsx` — listagem + alteração de papéis (somente admin)

### Edits
- `src/App.tsx` — envolver tudo no `AuthProvider`, adicionar rota pública `/auth` e proteger as demais com `<RotaProtegida>`
- `src/componentes/layout/` (sidebar/header existente) — exibir nome + papel + botão Sair
- `src/paginas/PaginaConfiguracoes.tsx` — adicionar aba "Usuários" visível apenas para admin

---

## Fluxo de uso

1. Usuário abre o app → vê a tela `/auth`.
2. **Cadastro:** preenche nome/e-mail/senha → recebe e-mail de confirmação → confirma → faz login.
3. **Login:** entra e é redirecionado para `/` (dashboard).
4. **Admin de teste:** entra direto com `admin@clinica.com` / `Admin@2025` (já confirmado), acessa Configurações → Usuários para promover outros usuários (ex.: definir alguém como `psicologo`).
5. **Sair:** botão no header limpa a sessão e volta para `/auth`.

---

## Pontos de segurança aplicados

- Papéis em **tabela separada** (`user_roles`), nunca em `profiles` — evita escalonamento de privilégio.
- Função `has_role` com `SECURITY DEFINER` para policies sem recursão.
- RLS habilitado em **todas** as tabelas novas, com policies explícitas por operação.
- Senha do admin de teste é apenas para desenvolvimento — recomendarei trocar antes de publicar.
- Confirmação de e-mail mantida ativa (escolha do usuário).

---

## O que NÃO será feito agora

- Login com Google (você optou por apenas e-mail/senha).
- Recuperação de senha (`/reset-password`) — posso adicionar depois se desejar.
- E-mails de confirmação com domínio próprio — usaremos o template padrão da Lovable; podemos personalizar depois.

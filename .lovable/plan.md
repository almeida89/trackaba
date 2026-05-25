# Refactor — Criação interna de funcionários + Atribuição de crianças

Fluxo final: **Admin/Coord/Recepção cria funcionário → senha definida ali mesmo, login imediato → atribui crianças no cadastro da criança → profissional entra e vê só o que é dele.**

---

## 1. Mudanças no banco (1 migração)

### 1.1 Nova tabela `crianca_responsaveis`

Vínculo explícito profissional ↔ criança, substituindo o esquema atual (que infere acesso por sessão/agendamento já existente — origem do problema "psicólogo novo não vê ninguém").

```text
crianca_responsaveis
  id uuid pk
  crianca_id uuid not null
  funcionario_id uuid not null
  papel_clinico text  -- "responsavel" | "apoio" (opcional, default 'responsavel')
  criado_em timestamptz
  criado_por uuid
  UNIQUE (crianca_id, funcionario_id)
```

RLS:

- SELECT: admin/coord/recepção (todos) + funcionário vê suas linhas
- INSERT/DELETE: admin/coord/recepção

### 1.2 Atualizar `tem_acesso_crianca`

Substituir a parte "psicólogo via sessão/agendamento" por **vínculo direto** em `crianca_responsaveis`:

```sql
... OR (
  has_role(_user_id,'psicologo')
  AND EXISTS (
    SELECT 1 FROM crianca_responsaveis cr
    JOIN funcionarios f ON f.id = cr.funcionario_id
    WHERE cr.crianca_id = _crianca_id AND f.user_id = _user_id
  )
)
```

### 1.3 Policies que precisam destravar para recepção

- `sessoes` INSERT/UPDATE: incluir `recepcionista` (hoje só admin/coord)
- `programas`, `avaliacoes`: manter como está

### 1.4 `handle_new_user` — fechar autocadastro público

Manter convites para escola/família, **mas** o caminho oficial de funcionário interno passa pela edge `admin-users` (já existe). Garantir que signup direto sem convite NÃO cria mais role `psicologo`/`coordenador`/`recepcionista` (cai sempre em `familia` por padrão — já é o comportamento atual).

---

## 2. Edge function `admin-users` — ajustes

### 2.1 Liberar acesso a coordenador e recepção

Hoje: `if (!ehAdmin) return 403`. Trocar por: aceitar `admin`, `coordenador`, `recepcionista`.

### 2.2 Novo payload `criar` aceita `funcionario_id` opcional

- Se vier, faz `UPDATE funcionarios SET user_id = criado.user.id WHERE id = funcionario_id`.
- Caso contrário, segue só criando user + role.

### 2.3 Mapear cargo → papel automático

No próprio dialog do funcionário, ao definir cargo:

- Terapeuta/Psicólogo/Fono/TO/Analista → role `psicologo`
- Coordenador/Supervisor → `coordenador`
- Recepção → `recepcionista`
- Administrativo → `admin` (opcional, com confirm)

`email_confirm: true` já está no código → login imediato sem precisar abrir e-mail. ✅

---

## 3. UI — Funcionários

### 3.1 `DialogoFuncionario` ganha aba/sessão "Acesso ao sistema"

Campos extras quando **criando**:

- `criarAcesso: boolean` (default ON)
- `senhaInicial: string` (mínimo 10 chars, regras do `validar_forca_senha`)
- Visual: aviso "O profissional poderá entrar imediatamente com este e-mail e senha"

Quando **editando** funcionário que já tem `user_id`:

- Mostrar badge "Acesso ativo · papel X"
- Botão "Redefinir senha" (chama `admin-users` com nova ação `redefinir_senha`)
- Botão "Revogar acesso" (chama `admin-users` ação `remover`)

### 3.2 Fluxo de salvar (no `PaginaFuncionarios.salvar`)

1. INSERT em `funcionarios` (como hoje).
2. Se `criarAcesso` marcado e novo: chamar edge `admin-users` { acao: "criar", email, senha, nome_completo, papel: derivado do cargo, funcionario_id: linhaSalva.id }.
3. Toast: "Funcionário cadastrado. Acesso liberado para login."

---

## 4. UI — Atribuição de crianças

### 4.1 Novo componente `SeletorResponsaveis`

- Multi-select dos `funcionarios ativos` (com cargo clínico).
- Estado: array de `funcionario_id`.
- Visual: chips removíveis + combobox para adicionar.

### 4.2 Onde usar

**(a) `DialogoNovaCrianca**` — após criar a criança, fazer INSERT em `crianca_responsaveis` para cada selecionado.

**(b) Pasta da criança → aba "Cadastro"** — adicionar seção "Profissionais responsáveis" com `SeletorResponsaveis`:

- Carrega vínculos atuais.
- Adicionar = INSERT; remover = DELETE.
- Visível só para admin/coord/recepção (esconder para psicólogo).

### 4.3 Hook `useResponsaveisCrianca(criancaId)`

- `listar()` → join `crianca_responsaveis` × `funcionarios`
- `adicionar(funcionarioId)`
- `remover(vinculoId)`

---

## 5. Limpezas

- `**PaginaUsuarios**` (`/usuarios`): manter para admin, mas adicionar nota "Para criar profissionais clínicos, use Funcionários". Sem mudança funcional.
- **Sidebar**: deixar `Funcionários` como ponto único de criação de profissionais. Esconder "Usuários" exceto admin (já está).
- **Confirmações duplas**: ao desativar funcionário com `user_id`, perguntar se revoga acesso também.

---

## 6. Ordem de execução (PRs pequenos)

1. **Migração**: tabela `crianca_responsaveis` + RLS + atualizar `tem_acesso_crianca` + abrir RLS de `sessoes` para recepção.
2. **Edge `admin-users**`: aceitar coord/recep; adicionar parâmetro `funcionario_id` e ação `redefinir_senha`.
3. `**DialogoFuncionario` + `PaginaFuncionarios.salvar**`: aba acesso + chamada à edge.
4. `**SeletorResponsaveis` + hook**: componente isolado.
5. `**DialogoNovaCrianca**`: integrar seletor (atribuição no cadastro).
6. **Pasta da criança → Cadastro**: seção editável de responsáveis (adiciona/remove).
7. **Smoke test manual**: criar psicólogo → atribuir criança → logar como psicólogo → verificar isolamento.

---

## 7. Critérios de aceite

- ✅ Recepção cria funcionário com senha; profissional faz login no ato (sem e-mail).
- ✅ Profissional clínico só vê crianças com vínculo em `crianca_responsaveis`.
- ✅ Profissional clínico **não** vê `/funcionarios`, `/usuarios`, `/configuracoes` admin (já garantido pela sidebar + RotaAdmin).
- ✅ Admin/Coord/Recepção continuam vendo todas as crianças.
- ✅ Adicionar/remover vínculo na pasta da criança funciona e é refletido no acesso do profissional em tempo real (após reload).
- ✅ Sessões antigas continuam acessíveis (a função `tem_acesso_crianca` mantém fallbacks via sessões/agendamentos preexistentes ou os migramos para vínculos).
- ✅ Nenhuma quebra em portal família ou visão escola.

---

## 8. Decisões pendentes (preciso confirmar antes de codar)

1. **Migrar histórico**: quero criar automaticamente vínculos em `crianca_responsaveis` para todos os pares (`crianca_id`, `terapeuta_id` de funcionarios) já existentes em `sessoes`/`agendamentos`? Recomendo **sim**, para não quebrar acesso de profissionais que já atendem. 
  Sim.
2. **Recepcionista pode criar admin?** Recomendo **não** — apenas admin cria admin. Coord/Recep criam psicólogo/coord/recep.  
Não.
3. **Senha inicial**: gerada automaticamente pelo sistema (mais simples, copia e cola) **ou** digitada pelo gestor? Recomendo **gerada + opção "mostrar/copiar"**, evita senhas fracas.  
**Não - digitada pelo gestor.**
4. **Cargos "Administrativo" e "Supervisor"** mapeiam para qual `app_role`? Sugiro Administrativo→`recepcionista`, Supervisor→`coordenador`.  
Administrativo→`recepcionista`, Supervisor→`coordenador`

Aguardando aprovação do plano (ou ajustes nas 4 decisões acima) para começar pela migração.
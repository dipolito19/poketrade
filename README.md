# PKMD Trade

Plataforma de anúncios de Pokémon com parser automático, painel admin e design escuro temático.

## Stack

- **Next.js 14** (App Router, Server Components)
- **Tailwind CSS** — design dark, tema Pokémon
- **Supabase** — PostgreSQL como banco de dados
- **TypeScript**

---

## Configuração

### 1. Clone e instale

```bash
git clone <seu-repo>
cd poketrade
npm install
```

### 2. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito.
2. No painel do Supabase, vá em **SQL Editor** e execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).
3. Copie as credenciais em **Settings → API**:
   - `Project URL`
   - `anon public key`

### 3. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
ADMIN_PASSWORD=sua-senha-secreta
```

### 4. Rode localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

Painel admin: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Funcionalidades

### Página pública (`/`)

- Grid responsivo de anúncios com miniatura do Pokémon
- Busca por **nome** ou **ability** (debounced 300ms)
- Filtro por **tier** (S++, S+, S, A++, ...)
- Clique no card → modal com todos os detalhes

### Painel Admin (`/admin`)

- Login por senha simples (variável `ADMIN_PASSWORD`)
- Sessão via cookie httpOnly (8 horas)
- **Parser automático**: cole o texto bruto do Pokémon → campos preenchidos automaticamente
- Criar, editar e excluir anúncios
- Formulário completo com todos os campos

### Parser

O parser extrai automaticamente do texto bruto:

| Campo | Exemplo |
|-------|---------|
| Nome | `Sawsbuck` |
| Tier | `S++` |
| Pokébola | `hogwarts ball` |
| Bônus pokébola | `25% ATK/DEF Dark/Ghost` |
| Awakened | `(A)` → `true` |
| Tag sazonal | `YULE` |
| Boost level | `[+200]` → `200` |
| Upgrade level | `Upgrade: [5]` → `5` |
| Sexo | `female` |
| Stats (IV + bônus) | `Hp: 28 (+500)` |
| Perfection | `80.645%` |
| Ability | `Sniper` |
| Held Item | `Soft Sand` |
| TMs | `Sketch(100), X-Scissor(114)` |
| Move Upgrades | `Rock Cannon: [11]` |
| Vitamins | `(10/30)` + detalhes |

---

## Deploy na Vercel

### 1. Push para GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/seu-usuario/poketrade.git
git push -u origin main
```

### 2. Importe na Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**
2. Importe o repositório do GitHub
3. Em **Environment Variables**, adicione as três variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
4. Clique em **Deploy**

### 3. Configure o Supabase para produção

No Supabase, vá em **Authentication → URL Configuration** e adicione o domínio da Vercel à lista de URLs permitidas (se necessário).

---

## Estrutura do projeto

```
poketrade/
├── app/
│   ├── layout.tsx          # Layout global com header
│   ├── page.tsx            # Página pública com grid
│   ├── globals.css         # Estilos globais + Tailwind
│   ├── admin/
│   │   ├── page.tsx        # Login admin
│   │   └── dashboard/
│   │       └── page.tsx    # Painel admin (CRUD)
│   └── api/
│       ├── ads/
│       │   ├── route.ts    # GET (lista) + POST (criar)
│       │   └── [id]/
│       │       └── route.ts # GET + PUT + DELETE
│       └── auth/
│           └── route.ts    # Login/logout por cookie
├── components/
│   ├── PokemonCard.tsx     # Card do grid público
│   ├── PokemonModal.tsx    # Modal com detalhes
│   ├── SearchFilter.tsx    # Barra de busca + filtro tier
│   ├── TierBadge.tsx       # Badge colorido por tier
│   ├── AdminForm.tsx       # Formulário admin (criar/editar)
│   └── ParserInput.tsx     # Área de texto para parser
├── lib/
│   ├── supabase.ts         # Cliente Supabase + tipos
│   └── parser.ts           # Parser de texto bruto
└── supabase/
    └── schema.sql          # SQL de criação da tabela
```

---

## Segurança

- A senha admin **nunca** vai para o cliente — é comparada server-side na API Route.
- O cookie `admin_auth` é `httpOnly` e `sameSite: strict`.
- As rotas `POST`, `PUT`, `DELETE` de `/api/ads` verificam o cookie antes de qualquer operação.
- Para produção, considere usar `sameSite: 'lax'` e `secure: true` no cookie (adicionando `secure: process.env.NODE_ENV === 'production'`).

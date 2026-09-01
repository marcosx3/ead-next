# EAD Next — Plataforma de Ensino a Distância (Frontend)

Frontend de uma plataforma EAD (Ensino a Distância), construído com **Next.js 16** (App Router) e **React 19**. A aplicação consome uma API externa (NestJS) via REST, tratando autenticação, cursos, matrículas, aulas, questionários e controle de acesso por permissões.

## ✨ Funcionalidades

- **Autenticação** com JWT (login, registro, recuperação de senha) e sessão persistida em `localStorage`, com verificação periódica de expiração do token.
- **Dashboard do aluno** com listagem de cursos e progresso.
- **Gestão de cursos**: criação, módulos e aulas, questionários/quizzes e avaliações (`components/courses`).
- **Matrícula em cursos** (gratuitos e pagos, com redirecionamento para checkout).
- **Player de aulas** (`courses/watch`) e acompanhamento de aprendizado (`learn/[courseSlug]`).
- **Gestão de usuários** (criação, edição e listagem) para perfis administrativos.
- **Controle de permissões** baseado em papéis (`admin`, `editor`, `viewer`) por recurso e ação (`lib/auth.ts`, `settings/permissions`).
- **Emissão de certificado** ao concluir um curso.
- **Perfil do usuário** com edição de dados e exclusão de conta.
- Tema claro/escuro via `next-themes` e notificações via `sonner`.

## 🛠️ Stack

- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (componentes em `components/ui`, baseados em [Radix UI](https://www.radix-ui.com/))
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para formulários e validação
- [TanStack Table](https://tanstack.com/table) para tabelas (usuários, cursos)
- [Axios](https://axios-http.com/) / `fetch` para chamadas HTTP
- [jwt-decode](https://github.com/auth0/jwt-decode) para leitura do token JWT
- [Lucide React](https://lucide.dev/) (ícones) e [Sonner](https://sonner.emilkowal.ski/) (toasts)

## 📂 Estrutura do projeto

```
app/
├── (auth)/                    # Rotas públicas: login, registro, reset de senha
│   ├── login/
│   ├── register/
│   └── reset_password/
├── (dashboard)/               # Área logada (sidebar + header)
│   ├── home/                  # Dashboard principal
│   ├── courses/               # Listagem, criação e player de cursos
│   ├── learn/[courseSlug]/    # Fluxo de aprendizado do aluno
│   ├── profile/                # Perfil do usuário
│   ├── settings/permissions/  # Matriz de permissões
│   └── users/                  # CRUD de usuários
├── context/auth-context.tsx   # Contexto de autenticação (JWT, sessão)
├── hooks/                      # Hooks de dados (useCourses, useEnrollments)
├── services/                   # Chamadas à API (courseService)
└── types/                      # Tipos de domínio (course, lessons, modules, question, user)

components/
├── courses/                    # Formulários e tabelas de cursos, módulos, aulas e quizzes
├── dashboard/                   # Header, sidebar e navegação
├── profile/                     # Formulário de perfil e exclusão de conta
├── settings/                    # Matriz de permissões
├── users/                       # Tabela de usuários
└── ui/                          # Componentes de UI reutilizáveis (shadcn/ui)

lib/
├── auth.ts                     # Lógica de autorização (roles/permissions)
└── utils.ts
```

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 20+
- npm
- Uma API backend compatível (NestJS) rodando e acessível

### Passo a passo

1. Clone o repositório e instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env.local` na raiz com a URL da API:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/
   ```

   > Certifique-se de manter a barra final (`/`), pois as chamadas concatenam o path diretamente (ex.: `auth/login`, `courses/inscricao`).

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000).

### Scripts disponíveis

| Comando         | Descrição                                  |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Inicia o servidor de desenvolvimento         |
| `npm run build` | Gera o build de produção                     |
| `npm run start` | Inicia o servidor com o build de produção    |
| `npm run lint`  | Executa o ESLint                             |

## 🐳 Docker

O projeto inclui `Dockerfile` e `docker-compose.yml` para rodar em modo de desenvolvimento com hot-reload:

```bash
docker-compose up --build
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000). O `docker-compose.yml` já configura polling de arquivos (`WATCHPACK_POLLING`) para garantir o hot-reload em ambientes Windows/macOS.

## 🔐 Autenticação e permissões

- O login é feito via `POST {NEXT_PUBLIC_API_BASE_URL}auth/login`, retornando um `access_token` (JWT) armazenado em `localStorage`.
- O `AuthProvider` (`app/context/auth-context.tsx`) decodifica o token, expõe `user`, `permissions` e `isAuthenticated`, e verifica a expiração a cada minuto, redirecionando para `/login` quando o token expira.
- O controle de acesso por permissão (`lib/auth.ts`) usa uma matriz `Role -> Resource -> Action[]` (ex.: `users.create`, `settings.update`) para decidir o que cada papel pode acessar.

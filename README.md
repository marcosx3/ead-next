app/
├── (auth)/             # Grupo de rotas (login, register) - layout sem sidebar
│   ├── login/
│   └── register/
├── (dashboard)/        # Área logada do aluno
│   ├── layout.tsx      # Sidebar global + Header
│   ├── page.tsx        # Dashboard principal (Meus cursos, progresso)
│   ├── browse/         # Catálogo de cursos
│   └── courses/
│       └── [courseId]/ 
│           ├── layout.tsx    # Layout específico do curso (barra de progresso)
│           ├── page.tsx      # Visão geral do curso
│           └── lessons/
│               └── [lessonId]/
│                   └── page.tsx # Player de vídeo + Conteúdo
└── api/                # Route Handlers (se precisar de proxy para o NestJS)
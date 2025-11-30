-- =========================================================
-- 1. AUTORIZAÇÃO E USUÁRIOS (RBAC)
-- =========================================================

-- Tabela de Funções (Roles)
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- Tabela de Usuários
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL, -- Chave estrangeira para Funções
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('interno', 'externo') NOT NULL DEFAULT 'externo',
    status ENUM('active', 'pending', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabela de Permissões de Funções (Matriz RBAC)
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_key VARCHAR(100) NOT NULL, -- Ex: 'users.create', 'courses.delete'
    PRIMARY KEY (role_id, permission_key),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
-- =========================================================
-- 2. CONTEÚDO DO CURSO (Estrutura Modular) - ATUALIZADO
-- =========================================================

-- Tabela de Cursos
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    
    -- NOVAS COLUNAS PARA CONTROLE DE ACESSO/PREÇO
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,          -- TRUE = Pago, FALSE = Gratuito
    price DECIMAL(10, 2) DEFAULT 0.00,             -- Preço do curso (NULL/0.00 se for gratuito)
    
    is_published BOOLEAN DEFAULT FALSE,
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Tabela de Módulos (Agrupa Aulas)
CREATE TABLE modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL, -- Ordem dentro do curso
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_module_order (course_id, order_index)
);

-- Tabela de Aulas (Lessons)
CREATE TABLE lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    lesson_type ENUM('video', 'text', 'quiz') NOT NULL,
    video_url VARCHAR(255), -- Para vídeos hospedados ou via CDN
    content TEXT, -- Para aulas do tipo 'text' ou links embutidos
    order_index INT NOT NULL,
    is_free_preview BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lesson_order (module_id, order_index)
);

-- =========================================================
-- 3. AVALIAÇÃO E GAMIFICAÇÃO (Perguntas e Pontuação)
-- =========================================================

-- Tabela de Perguntas (para fixação/quiz)
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL, -- Pergunta ligada a uma aula específica
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false') NOT NULL,
    points_value INT DEFAULT 10, -- Pontuação por acerto
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Tabela de Opções de Resposta
CREATE TABLE answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    answer_text VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Tabela de Pontuação de Usuários (Gamificação)
CREATE TABLE user_points (
    user_id INT PRIMARY KEY,
    total_points INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 4. PROGRESÃO E MATRÍCULA
-- =========================================================

-- Tabela de Matrículas (Enrollments)
-- Para cursos pagos, uma linha aqui significa pagamento confirmado.
-- Para cursos gratuitos, uma linha aqui significa inscrição (acesso imediato).
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    
    -- Opcional: Rastrear se o pagamento foi concluído para cursos pagos
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'completed', 
    
    status ENUM('active', 'completed', 'dropped') NOT NULL DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_enrollment (user_id, course_id)
);
-- Tabela de Progresso do Usuário (Rastreamento por Aula)
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (user_id, lesson_id)
);

-- Tabela de Respostas do Usuário (Rastreamento de Quiz)
CREATE TABLE user_quiz_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer_id INT NOT NULL, -- ID da resposta que o usuário selecionou
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE RESTRICT,
    FOREIGN KEY (selected_answer_id) REFERENCES answers(id) ON DELETE RESTRICT
);
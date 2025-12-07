// app/profile/schema.ts
import * as z from 'zod';

// Tipos de dados de entrada para o formulário de Perfil
export const ProfileSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('E-mail inválido.').min(1, 'O e-mail é obrigatório.'),
    cpf: z.string().optional(), // CPF opcional, pode não ser editável ou pode ser nulo
    password: z.string().min(6, 'Mínimo de 6 caracteres.').optional().or(z.literal('')), // Senha opcional
});

// Tipo de dados de saída da API (o que você recebe)
export type UserProfileFromAPI = {
    id: number;
    name: string;
    email: string;
    cpf?: string | null;
    user_type: string;
    // Não incluímos a senha
}

export type ProfileFormData = z.infer<typeof ProfileSchema>;
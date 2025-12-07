"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Dados Mock ou de API (Para Roles) ---
// Em uma aplicação real, você faria um fetchRoles aqui, mas vamos simular para a UI
const availableRoles = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'instructor' },
    { id: 3, name: 'student' },
];

// --- 1. Definição do Schema de Validação com Zod (Atualizado) ---
const UserTypeBase = z.enum(['interno', 'externo']);

const CreateUserSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório.'),
    email: z.string().email('E-mail inválido.').min(1, 'O e-mail é obrigatório.'),
    cpf: z.string().min(11, 'CPF inválido (mínimo 11 dígitos).'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    // Adicionando Role e User Type
    roleId: z.number().min(1, 'A função (role) é obrigatória.'),
    user_type: UserTypeBase.optional(),
});

type CreateUserFormData = z.infer<typeof CreateUserSchema>;

export default function CreateUserPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateUserFormData>({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: {
            name: '',
            email: '',
            cpf: '',
            password: '',
            roleId: undefined, // undefined para forçar a seleção
            user_type: undefined,
        },
    });

    const onSubmit = async (data: CreateUserFormData) => {
        const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
        const API_URL = baseAPI + "/users";
        setIsSubmitting(true);

        // O Payload deve incluir todos os campos, mapeando roleId e user_type.
        const payload = {
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            password: data.password,
            roleId: data.roleId,
            user_type: data.user_type,
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Em um ambiente real, você provavelmente precisaria de um token de ADMIN aqui
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
                 // Tenta extrair mensagem de erro da API
                const errorMessage = responseData.message || responseData.error || "Erro desconhecido ao criar usuário.";
                throw new Error(errorMessage);
            }

            toast.success("Usuário criado com sucesso! ✅");
            router.push("/dashboard");

        } catch (error) {
            console.error('Erro de Cadastro:', error);
            const errorMessage = error instanceof Error ? error.message : "Falha ao cadastrar usuário.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>➕ Cadastro de Novo Usuário</CardTitle>
                <CardDescription>
                    Preencha todos os campos para criar uma nova conta de usuário no sistema.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* --- Seção 1: Dados Pessoais (Grid 2 Colunas) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* NOME */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome Completo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* EMAIL */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@exemplo.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* CPF */}
                            <FormField
                                control={form.control}
                                name="cpf"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CPF</FormLabel>
                                        <FormControl>
                                            <Input placeholder="xxx.xxx.xxx-xx" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* SENHA */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* --- Seção 2: Permissões/Tipo (Grid 2 Colunas) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            
                            {/* ROLE (FUNÇÃO) */}
                            <FormField
                                control={form.control}
                                name="roleId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Função (Role)</FormLabel>
                                        <Select 
                                            // Converte o valor de string (do Select) para Number (do Schema)
                                            onValueChange={(value) => field.onChange(Number(value))} 
                                            value={field.value ? String(field.value) : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a Função" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableRoles.map((role) => (
                                                    <SelectItem key={role.id} value={String(role.id)}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* USER TYPE (TIPO DE USUÁRIO) */}
                            <FormField
                                control={form.control}
                                name="user_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Usuário</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o Tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="interno">Interno</SelectItem>
                                                <SelectItem value="externo">Externo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        {/* --- Botão de Submissão --- */}
                        <Button 
                            type="submit" 
                            className="w-full mt-6" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
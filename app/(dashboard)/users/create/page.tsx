"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 1. Definição do Schema de Validação com Zod
const CreateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.email('E-mail inválido.').min(1, 'O e-mail é obrigatório.'),
  cpf: z.string().min(5, 'CPF é obrigatório.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type CreateUserFormData = z.infer<typeof CreateUserSchema>;
export default function CreateUserPage() {
  const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<CreateUserFormData>({
      resolver: zodResolver(CreateUserSchema),
    });
    const onSubmit = async (data: CreateUserFormData) => {
        console.log('Dados submetidos:', data);

        try {
        // 💡 FUTURO: Chamar API NestJS
        // const response = await fetch('http://seu-nest-api/auth/login', { ... });
        // const { token } = await response.json();
        console.log('Dados submetidos:', data);
        // Simulação de sucesso com um token dummy
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência de rede


        } catch (error) {
        console.error('Erro de Login:', error);
        // Aqui você lidaria com erros de credenciais inválidas vindos do NestJS
        alert('Login ou senha incorretos. (Simulação)');
        }
    };
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nome</label>
                <input id="name"   {...register('name')} type="text" placeholder="Nome Completo" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input id="email"   {...register('email')} type="email" placeholder="email@exemplo.com" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
                <label htmlFor="cpf"  className="text-sm font-medium">CPF</label>
                <input id="cpf" {...register('cpf')} type="text" placeholder="xxx.xxx.xxx-xx" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /> 
               {errors.cpf && <p className="text-sm text-red-500">{errors.cpf.message}</p>}
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Senha</label>
                <input id="password"   {...register('password')} type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full">
                Cadastrar
            </Button>
          </form>
          
        
    </div>
  );
}
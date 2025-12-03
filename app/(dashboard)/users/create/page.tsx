"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// 1. Definição do Schema de Validação com Zod
const CreateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.email('E-mail inválido.').min(1, 'O e-mail é obrigatório.'),
  cpf: z.string().min(5, 'CPF é obrigatório.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type CreateUserFormData = z.infer<typeof CreateUserSchema>;
export default function CreateUserPage() {
  const router = useRouter();
  const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<CreateUserFormData>({
      resolver: zodResolver(CreateUserSchema),
    });
    const onSubmit = async (data: CreateUserFormData) => {
      const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
  		const API_URL = baseAPI! + "/users";

        try {
        const response = await fetch(API_URL, { 
          method: "POST",
				  headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),});
        if (!response.ok) throw new Error("Erro ao criar usuário");

        const { token } = await response.json();
        
        toast.success("usuario criado com sucesso!");
        router.push("/dashboard");
        } catch (error) {
        console.error('Erro de Login:', error);
        toast.error("Usuário não cadastrado");
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
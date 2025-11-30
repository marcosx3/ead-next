'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

// 1. Definição do Schema de Validação com Zod
const RegisterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.email('E-mail inválido.').min(1, 'O e-mail é obrigatório.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
      resolver: zodResolver(RegisterSchema),
    });

   const onSubmit = async (data: RegisterFormData) => {
     try {
      console.log('Dados submetidos:', data);
      // Simulação de sucesso 
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência de rede

    } catch (error) {
      console.error('Erro de Login:', error);
      alert('Cadastro nao realizado. (Simulação)');
    }
   };

  return (
    <Card className="w-[380px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crie sua Conta Grátis</CardTitle>
        <CardDescription>
          Comece sua jornada de aprendizado agora mesmo.
        </CardDescription>
      </CardHeader>
         <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name"  type="text" placeholder="Seu nome" required   {...register('name')} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email"  {...register('email')} type="email" placeholder="nome@exemplo.com" required />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password"  {...register('password')}  type="password" required />
                 {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
        </CardContent>
        <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Cadastrar'}
            </Button>
            <p className="mt-4 text-sm text-center text-gray-500">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-medium hover:underline text-primary">
                    Fazer Login
                </Link>
            </p>
        </CardFooter>
      </form>
    </Card>
  );
}
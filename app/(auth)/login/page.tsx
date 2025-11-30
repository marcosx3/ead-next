// app/(auth)/login/page.tsx
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/auth-context'; // Importa o hook de autenticação

// 1. Definição do Schema de Validação com Zod
const LoginSchema = z.object({
  email: z.email('E-mail inválido.').min(1, 'O e-mail é obrigatório.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { login } = useAuth(); // Obtém a função de login do contexto

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  // 2. Função de Submissão
  const onSubmit = async (data: LoginFormData) => {
  
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Envia { email, password }
      });

      if (!response.ok) {
        
        throw new Error("Credenciais inválidas");
      }

      const { token } = await response.json();

      // Atualiza o estado global com token JWT
      login(token);

    } catch (error) {
      console.error("Erro de Login:", error);
      alert( "Erro ao conectar ao servidor.");
    }
  };

  return (
    <Card className="w-[380px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Bem-vindo(a) de volta</CardTitle>
        <CardDescription>Acesse sua conta para continuar seus estudos.</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          {/* Campo E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nome@exemplo.com" 
              {...register('email')} // Conecta o input ao React Hook Form
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          
          {/* Campo Senha */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="#" className="text-sm font-medium hover:underline text-primary">Esqueceu a senha?</Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              {...register('password')} // Conecta o input ao React Hook Form
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="mt-4 text-sm text-center text-gray-500">
                Ainda não tem conta?{' '}
                <Link href="/register" className="font-medium hover:underline text-primary">Cadastre-se</Link>
            </p>
        </CardFooter>
      </form>
    </Card>
  );
}
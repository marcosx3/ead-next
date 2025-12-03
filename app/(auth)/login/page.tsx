'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Importação de componentes (UI)
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Importa o hook de autenticação com a função signIn
// 💡 Lembre-se que renomeamos 'login' para 'signIn' no AuthContext para incluir a lógica da API
import { useAuth } from '@/app/context/auth-context'; 

// 1. Definição do Schema de Validação com Zod (inalterada)
const LoginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório.').email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  // 💡 USANDO A FUNÇÃO signIn DO CONTEXTO (que já faz o fetch e o setAuthToken)
  const { signIn } = useAuth(); 

  const {
    register,
    handleSubmit,
    setError, // Adicionamos setError para exibir mensagens de erro do servidor
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  // 2. Função de Submissão (simplificada)
  const onSubmit = async (data: LoginFormData) => {
    try {
      // 🚀 Chama a função de autenticação do AuthContext, passando email e password
      await signIn(data.email, data.password);

      // O AuthContext cuidará de salvar o token no localStorage e redirecionar para '/home'.

    } catch (error) {
      // 🚨 Tratamento de Erro: Se o AuthContext lançar um erro (ex: 401 Unauthorized)
      console.error("Erro de Login:", error);
      
      // Define um erro genérico no formulário para ser exibido ao usuário
      setError("root", {
        type: "manual",
        message: "Credenciais inválidas. Verifique seu e-mail e senha.",
      });
      // Opcionalmente, defina o erro diretamente nos campos:
      // setError("password", { message: "Senha incorreta." }); 
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
          
          {/* MENSAGEM DE ERRO GERAL (root error) */}
          {errors.root && (
            <p className="text-sm text-red-500 text-center font-semibold border border-red-300 p-2 rounded">
              {errors.root.message}
            </p>
          )}

          {/* Campo E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nome@exemplo.com" 
              {...register('email')} 
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
              {...register('password')} 
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
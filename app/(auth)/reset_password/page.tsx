'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lógica de registro com a API NestJS virá aqui!
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    // Lógica de login com a API NestJS virá aqui!
    console.log('Tentativa de login...');
    console.log("Email:", email);
   };

  return (
    <Card className="w-[380px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Esqueceu sua senha?</CardTitle>
        <CardDescription>
         Informe seu email abaixo
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

            <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="nome@exemplo.com" required />
            </div>
           
        </CardContent>
        <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full mt-2">
                Buscar
            </Button>
            <p className="mt-4 text-sm text-center text-gray-500">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-medium hover:underline text-primary">
                    Voltar
                </Link>
            </p>
        </CardFooter>
      </form>
    </Card>
  );
}
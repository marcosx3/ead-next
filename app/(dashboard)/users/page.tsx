import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { UsersTable } from '@/components/users/UsersTable'; // <-- Importe o componente

export default function ListUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista de Usuários</h1>
        
        {/* Botão para Cadastro: Navega para /users/create */}
        <Button asChild>
          <Link href="/users/create">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Link>
        </Button>
      </div>
      
      {/* Substituindo o placeholder pela tabela real.
      */}
      <UsersTable />
      
    </div>
  );
}
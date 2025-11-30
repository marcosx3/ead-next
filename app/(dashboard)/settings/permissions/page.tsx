// app/(Dashboard)/settings/permissions/page.tsx (Server Component)

import { ShieldCheck } from 'lucide-react';
// Remova o Button e o Save daqui, pois o PermissionsMatrix os importa
// import { Button } from '@/components/ui/button';
// import { Save } from 'lucide-react';
import { PermissionsMatrix } from '@/components/settings/PermissionsMatrix';

export default function PermissionsPage() {
    
    // REMOVA: const handleSavePermissions = () => { ... }
    // As funções de handler NÃO podem ser definidas aqui!

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheck className="w-6 h-6 mr-3 text-primary" /> Gerenciamento de Permissões
                </h1>
                
                {/* REMOVA ISTO COMPLETAMENTE: */}
                {/* <Button onClick={handleSavePermissions}>
                    <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                </Button> */}
                {/* O botão AGORA é renderizado DENTRO do PermissionsMatrix */}

            </div>
            
            <p className="text-gray-600 dark:text-gray-400">
                Marque as caixas para conceder a Permissão (Ação) para a respectiva Função (Role).
            </p>

            <PermissionsMatrix />
            
        </div>
    );
}
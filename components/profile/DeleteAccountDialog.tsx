// app/profile/DeleteAccountDialog.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    // 🛑 CORREÇÃO AQUI: Usando o componente Dialog e seus subcomponentes
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'; // Certifique-se de que este caminho está correto

const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = baseAPI + "/auth/profile"; // Rota DELETE para o usuário logado

export default function DeleteAccountDialog() {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Para controlar o estado do Dialog

    const handleDelete = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        setIsDeleting(true);
        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Falha ao excluir a conta.');

            // Limpa o token, fecha o diálogo e redireciona
            localStorage.removeItem('access_token');
            setIsDialogOpen(false); // Fecha o Dialog antes de redirecionar
            toast.success("Conta excluída com sucesso. Adeus!");
            router.push('/'); 

        } catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error("Erro ao tentar excluir a conta.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        // 🛑 CORREÇÃO: Usando o componente Dialog
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            
            {/* O trigger abre o diálogo */}
            <DialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? 'Excluindo...' : 'Excluir Conta'}
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    {/* Substitui AlertDialogTitle por DialogTitle */}
                    <DialogTitle>Tem certeza absoluta?</DialogTitle>
                    
                    {/* Substitui AlertDialogDescription por DialogDescription */}
                    <DialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.
                    </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                    {/* Botão de Cancelar */}
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Cancelar
                    </Button>
                    
                    {/* Botão de Ação (Excluir) */}
                    <Button
                        type="button" 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Continuar e Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
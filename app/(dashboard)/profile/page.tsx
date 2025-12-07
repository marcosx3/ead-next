// app/profile/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Form } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ProfileSchema, ProfileFormData, UserProfileFromAPI } from './schema';
import ProfileFormFields from '@/components/profile/ProfileFormFields';
import DeleteAccountDialog from '@/components/profile/DeleteAccountDialog';

const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = baseAPI + 'auth/profile';

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: '',
            email: '',
            cpf: '',
            password: '',
        },
        mode: 'onChange',
    });
    const [userId, setUserId] = useState<string | null>(null);
    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            toast.warning("Você precisa estar logado.");
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                toast.error("Sessão expirada ou usuário não encontrado.");
                localStorage.removeItem('access_token');
                router.push('/users');
                return;
            }

            const data: UserProfileFromAPI = await response.json();
            setUserId(data.id.toString());
            form.reset({
                name: data.name,
                email: data.email,
                cpf: data.cpf || '',
                password: '', // nunca preencher a senha
            });
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            toast.error("Não foi possível carregar os dados do perfil.");
        } finally {
            setIsLoading(false);
        }
    }, [form, router]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const onSubmit = async (data: ProfileFormData) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const UpdateAPI_URL = `${baseAPI}auth/profile`; 
        const payload: Partial<ProfileFormData> = {
            ...data,
            password: data.password || undefined,
            cpf: data.cpf || undefined,
        };

        try {
            const response = await fetch(UpdateAPI_URL, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Erro ao atualizar o perfil.');

            toast.success("Perfil atualizado com sucesso!");
            fetchUserProfile();
        } catch (error) {
            console.error('Erro de atualização:', error);
            toast.error("Falha ao salvar as alterações do perfil.");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Carregando perfil...</div>;
    }

    return (
        <Card className="max-w-4xl mx-auto my-8">
            <CardHeader>
                <CardTitle>👤 Meu Perfil</CardTitle>
                <CardDescription>
                    Gerencie suas informações pessoais e credenciais de acesso.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <ProfileFormFields control={form.control} />
                        <div className="flex justify-between items-center pt-4 border-t">
                            <DeleteAccountDialog />
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

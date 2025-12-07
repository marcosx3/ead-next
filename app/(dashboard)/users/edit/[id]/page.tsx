'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Tipos e Schemas ---
type RoleAPI = { id: number; name: string; description?: string };

// Tipo de dado esperado da API
type UserFromAPI = {
	id: number;
	role: RoleAPI;
	name: string;
	email: string;
	user_type: z.infer<typeof UserTypeEnum>;
	cpf?: string;
	password_hash: string;
};

type Role = { id: number; name: string };
const UserTypeEnum = z.enum(['interno', 'externo']);

const EditUserSchema = z.object({
	id: z.number(),
	name: z.string().min(1, 'Nome é obrigatório.'),
	email: z.string().email('E-mail inválido.').min(1, 'O e-mail é obrigatório.'),
	cpf: z.string().optional(),
	roleId: z.number().min(1, 'A função é obrigatória.'),
	user_type: UserTypeEnum,
	password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.').optional().or(z.literal('')),
});

type EditUserFormData = z.infer<typeof EditUserSchema>;

async function fetchUser(userId: number): Promise<EditUserFormData> {
    const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
    const API_URL = `${baseAPI}users/${userId}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;


    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
        throw new Error(errorData.message || `Erro ${response.status}: Falha ao buscar usuário.`);
    }

   let data: UserFromAPI;
    try {
        data = await response.json();
    } catch (e) {
        throw new Error(`Resposta da API para o usuário com ID ${userId} não é um JSON válido.`);
    }

    // CHECAGEM DE OBJETO VAZIO/INVÁLIDO
    if (!data || !data.id) { // Verifica se o objeto principal está vazio ou não tem ID
        throw new Error(`Objeto de usuário vazio ou inválido retornado pela API para ID ${userId}.`); 
    }
    
    if (!data.role || !data.role.id) { 
        throw new Error(`Dados do usuário incompletos: Propriedade 'role' ausente para o usuário ${userId}.`);
    }

    // Mapeia os dados da API para o formato do formulário
    return {
        id: Number(data.id),
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        roleId: Number(data.role.id), // Agora data.role.id funciona
        user_type: data.user_type,
        password: '', 
    } as EditUserFormData;
}
/**
 * 2. Busca a lista completa de Funções (Roles) para popular o Select.
 */
async function fetchRoles(): Promise<Role[]> {
	const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
	const API_URL = `${baseAPI}roles`; // Endpoint assumido para todas as roles
	const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

	const response = await fetch(API_URL, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			"Authorization": `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao buscar roles.' }));
		throw new Error(errorData.message || `Erro ${response.status}: Falha ao buscar funções.`);
	}

	const roles: Role[] = await response.json();
	return roles;
}

// --- Componente de Edição ---
export default function EditUserPage() {
	const params = useParams();
	const userId = Number(params.id);
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [currentUser, setCurrentUser] = useState<EditUserFormData | null>(null);
	const [roles, setRoles] = useState<Role[]>([]);

	const form = useForm<EditUserFormData>({
		resolver: zodResolver(EditUserSchema),
	});

	// Função para carregar os dados (só precisa do usuário e das roles)
	const loadData = useCallback(async () => {
		if (!userId || isNaN(userId)) {
			toast.error("ID do usuário não fornecido ou inválido.");
			router.push('/users');
			return;
		}

		try {
			setIsLoading(true);

			// Carrega os dados do usuário e a lista de Roles em paralelo
			const [userData, rolesData] = await Promise.all([
				fetchUser(userId),
				fetchRoles(),
			]);

			setCurrentUser(userData);
			setRoles(rolesData);

			form.reset(userData);

		} catch (error: any) {
			toast.error("Erro ao carregar dados: " + (error.message || "Verifique sua conexão e o ID do usuário."));
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, [userId, form, router]);


	// Efeito para iniciar o carregamento dos dados
	useEffect(() => {
		loadData();
	}, [loadData]);


	const onSubmit = async (data: EditUserFormData) => {
		const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
		const API_URL = `${baseAPI}users/${data.id}`;
		const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

		const payload = {
			name: data.name,
			email: data.email,
			roleId: data.roleId,
			user_type: data.user_type,
			...(data.password && data.password.trim() !== '' && { password: data.password }),
		};

		try {
			const response = await fetch(API_URL, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
				throw new Error(errorData.message || `Erro ao atualizar: ${response.status}`);
			}

			toast.success("Usuário atualizado com sucesso! ✅");
			router.push("/users");

		} catch (error) {
			console.error('Erro na atualização:', error);
			const errorMessage = error instanceof Error ? error.message : "Falha ao salvar as alterações do usuário.";
			toast.error(errorMessage);
		}
	};

	if (isLoading || !currentUser) return <div className="py-8 text-center text-lg font-medium text-blue-600">Carregando dados do usuário... ⚙️</div>;


	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-4xl shadow-lg">
				<CardHeader className="pb-2">
					<CardTitle className="text-3xl font-bold">
						Usuário: {currentUser.name}
					</CardTitle>
				</CardHeader>

				<CardContent className="pt-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

							{/* Nome */}
							<FormField control={form.control} name="name" render={({ field }) => (
								<FormItem>
									<FormLabel>Nome</FormLabel>
									<FormControl><Input placeholder="Nome Completo" {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />

							{/* Email */}
							<FormField control={form.control} name="email" render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl><Input placeholder="email@exemplo.com" {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />

							{/* Senha */}
							<FormField control={form.control} name="password" render={({ field }) => (
								<FormItem>
									<FormLabel>Nova Senha (deixe vazio para não alterar)</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Mínimo 6 caracteres" {...field} value={field.value || ''} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />

							{/* Função (Role) */}
							<FormField
								control={form.control}
								name="roleId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Função (Role)</FormLabel>
										<Select
											onValueChange={(val) => field.onChange(Number(val))}
											defaultValue={String(field.value)}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecione a função" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{roles.map((role) => (
													<SelectItem key={role.id} value={String(role.id)}>
														{role.name.toUpperCase()}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Tipo de Usuário */}
							<FormField
								control={form.control}
								name="user_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo de Usuário</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecione o tipo" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="interno">Interno</SelectItem>
												<SelectItem value="externo">Externo</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full py-3" disabled={isLoading}>
								Salvar Alterações
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);

}
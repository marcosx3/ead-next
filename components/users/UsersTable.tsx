'use client';

import { useEffect, useState } from "react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
	PaginationState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/app/types/user";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Link from 'next/link';
import { toast } from "sonner";
// 1. Definição das Colunas
export const columns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: "Nome",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "user_type",
		header: "Tipo",
		cell: ({ row }) => {
			// 1. Obtém o valor. Se for null/undefined, usa 'desconhecido' como fallback.
			const type = row.getValue("user_type") as User['user_type'] || 'desconhecido';

			// 2. A variante depende do valor real (ou do fallback)
			const variant = type === 'interno' ? "default" : "outline";

			// 3. Aplica o método com segurança
			return <Badge variant={variant}>{type.toUpperCase()}</Badge>;
		},
	},
	{
		accessorKey: "role",
		header: "Função",
		cell: ({ row }) => {
			const role = row.getValue("role");
			
			// 1. Verifica se 'role' é um objeto e acessa a propriedade 'name'
			// Se não for um objeto (ou for null/undefined), retorna uma string vazia ("") ou um fallback.
			const roleName = (typeof role === 'object' && role !== null && 'name' in role) 
							? role.name 
							: (role as string || ''); // Fallback seguro para caso 'role' já seja uma string ou seja nulo
			
			// 2. Renderiza apenas a string
			return <Badge variant="secondary">{roleName as string}</Badge>;
		},
	},
	// usersTable.tsx (Dentro de export const columns: ColumnDef<User>[])
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			// Adiciona um fallback ('inactive') se o status for nulo ou indefinido
			const status = (row.getValue("status") as User['status']) || 'inactive';

			const variantMap = {
				active: "default",
				pending: "outline",
				inactive: "destructive",
				// Adiciona o fallback 'inactive' ao mapeamento se você usá-lo como fallback
			} as const;

			// Garantimos que o status é uma chave válida (mesmo que usemos 'inactive' como fallback se o status original for inválido)
			const safeStatus = (status in variantMap) ? status : 'inactive';

			// Usamos o safeStatus para a variante e o status (agora garantido) para toUpperCase
			return <Badge variant={variantMap[safeStatus]}>{status.toUpperCase()}</Badge>;
		},
	},

	{
		id: "actions",
		header: "Ações",
		// O parâmetro 'row' agora é usado para obter os dados do usuário
		cell: ({ row }) => {
			const user = row.original; // Acessa o objeto de dados original do usuário
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Abrir menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{/* Ação de Editar: Navega para a rota de edição usando o ID do usuário */}
						<DropdownMenuItem asChild>
							<Link href={`/users/edit/${user.id}`}>Editar</Link>
						</DropdownMenuItem>

						{/* Ação de Excluir (apenas um exemplo simples) */}
						<DropdownMenuItem asChild >
							<Link href={`/users/inative/${user.id}`}>Inativar</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild >
							<Link href={`/users/delete/${user.id}`}>Excluir</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
// 2. Componente da Tabela
export function UsersTable() {
	const [data, setData] = useState<User[]>([]);
	const [globalFilter, setGlobalFilter] = useState('');
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10
	})


	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
	const API_URL = baseUrl! + "users";
	useEffect(() => {
		async function loadUsers() {
			const token = localStorage.getItem("access_token");
			if (!token) {
				toast.error("Sessão expirada ou não autenticada. Faça login novamente.");
				setLoading(false);
				return;
			}
			try {
				const res = await fetch(API_URL, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					}
				});
				const users = await res.json();
				setData(users);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}
		loadUsers();
	}, []);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			globalFilter,
			pagination
		},
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination
	});
	if (loading) return <div className="py-8 text-center">Carregando usuários...</div>;
	return (
		<div>
			{/* NOVO CAMPO DE BUSCA */}
			<div className="flex items-center py-4">
				<Input
					placeholder="Buscar por nome, email ou função..."
					value={globalFilter ?? ''}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Nenhum resultado encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{/* CONTROLES DE PAGINAÇÃO */}
			<div className="flex items-center justify-end space-x-2 py-4">
				{/* Informação da Página */}
				<div className="flex-1 text-sm text-muted-foreground">
					Página {table.getState().pagination.pageIndex + 1} de{" "}
					{table.getPageCount()}
				</div>

				{/* Botões de Navegação */}
				<div className="space-x-2">
					{/* Primeira Página */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Ir para a primeira página</span>
						<ChevronsLeft className="h-4 w-4" />
					</Button>

					{/* Página Anterior */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Ir para a página anterior</span>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					{/* Próxima Página */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Ir para a próxima página</span>
						<ChevronRight className="h-4 w-4" />
					</Button>

					{/* Última Página */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Ir para a última página</span>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
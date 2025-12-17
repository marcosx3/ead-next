"use client";
import { Menu, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";
import { useAuth } from "@/app/context/auth-context";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Header() {
	const { logout } = useAuth();

	const [xp, setXp] = useState(0);
	const [loadingXp, setLoadingXp] = useState(true);
	const XP_PER_LEVEL = 1000;
	const level = Math.floor(xp / XP_PER_LEVEL);
	const expPercent = (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

	useEffect(() => {
		const fetchXp = async () => {
			try {
				const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
				const token = localStorage.getItem('access_token');
				if (!token) {
					toast.error("Sessão expirada ou não autenticada. Faça login novamente.");
					setLoadingXp(false);
					return; 
				}
				const response = await fetch(`${baseAPI}progress/point`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error(`Erro ao buscar XP: ${response.statusText}`);
				}

					// Se retornar um objeto (ex: { total_points: 1250 }), use:
					const data = await response.json();
					setXp(data.total_points?.total_points ?? 0);

			} catch (error) {
				console.error("Erro ao buscar XP:", error);
				// Trata erros de rede ou o erro lançado acima
				toast.error("Não foi possível carregar os pontos de experiência.");
			} finally {
				setLoadingXp(false);
			}
		};
		fetchXp();
	}, []);


	return (
		<header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">

			{/* 1. Menu Mobile */}
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline" size="icon" className="shrink-0 md:hidden">
						<Menu className="h-5 w-5" />
						<span className="sr-only">Toggle navigation menu</span>
					</Button>
				</SheetTrigger>

				<SheetContent side="left" className="flex flex-col w-[300px]">
					<SheetTitle className="sr-only">Menu Principal do Dashboard</SheetTitle>
					<h1 className="text-xl font-bold p-4">Dashboard</h1>

					<SidebarNav isCollapsed={false} dropdownSide="bottom" />
				</SheetContent>
			</Sheet>

			{/* 2. Conteúdo Central */}
			<div className="w-full flex-1"></div>

			{/* ---- NOVO: ÍCONE DE NOTIFICAÇÕES ---- */}
			<Button
				variant="ghost"
				size="icon"
				className="relative"
			>
				<Bell className="h-5 w-5" />
				<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
					3
				</span>
			</Button>

 {/* Barra de XP */}
      <div className="hidden md:flex flex-col items-end w-36">
        <span className="text-xs text-muted-foreground">
          {loadingXp ? "Carregando..." : `Nível ${level}`}
        </span>
        <Progress value={expPercent} className="h-2 w-full" />
      </div>

			{/* 3. Menu do Usuário */}
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Avatar className="cursor-pointer">
						<AvatarImage src="/avatar.png" />
						<AvatarFallback><User /></AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => location.href = "/profile"}>
						Meu Perfil
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={logout}
						className="text-red-600 focus:text-red-600"
					>
						Sair
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

		</header>
	);
}

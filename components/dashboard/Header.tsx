// components/dashboard/Header.tsx (REVISADO)

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";


export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      
      {/* 1. Menu Mobile (Sheet e Botão Toggle) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col w-[300px]">
          <SheetTitle className="sr-only">Menu Principal de Navegação do Dashboard</SheetTitle> 
          <h1 className="text-xl font-bold p-4">Dashboard</h1>
          
          {/* CORREÇÃO AQUI: Passando dropdownSide="bottom" */}
          <SidebarNav 
            isCollapsed={false} // O menu mobile está sempre expandido
            dropdownSide="bottom" // Abre o dropdown para baixo no mobile
          /> 
        </SheetContent>
      </Sheet>
      
      {/* 2. Conteúdo do Header (ex: Busca, Notificações) */}
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      
    </header>
  );
}
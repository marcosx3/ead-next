'use client'; // Necessário para usar useState e interações de cliente

import React, { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { SidebarToggle } from '@/components/dashboard/SidebarToggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Estado para controlar se a sidebar está colapsada ou expandida
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleToggle = () => setIsCollapsed(!isCollapsed);

  // Define as larguras baseadas no estado:
  // Colapsado: 60px (apenas ícones)
  // Expandido: 280px (links completos)
  const sidebarWidth = isCollapsed ? 'w-[60px]' : 'w-[280px]';
  const gridTemplate = isCollapsed ? 'md:grid-cols-[60px_1fr]' : 'md:grid-cols-[280px_1fr]';
  
  return (
    <div className={`grid min-h-screen w-full ${gridTemplate} transition-all duration-300 ease-in-out`}>
      
      {/* 1. Sidebar Fixo (Desktop) */}
      <div className={`hidden border-r bg-muted/40 md:block ${sidebarWidth} transition-all duration-300 ease-in-out`}>
        <div className="flex h-full max-h-screen flex-col gap-2 sticky top-0">
          
          <div className={`flex h-16 items-center border-b px-4 lg:px-6 justify-between ${isCollapsed ? 'px-2' : ''}`}>
            {/* Título só aparece se não estiver colapsado */}
            {!isCollapsed && <span className="font-semibold">Meu Projeto</span>}
            
            {/* Botão de Toggle da Sidebar (Desktop) */}
            <SidebarToggle 
              isCollapsed={isCollapsed} 
              onToggle={handleToggle}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Passa o estado para a SidebarNav, se você quiser esconder os textos dos links */}
            <SidebarNav isCollapsed={isCollapsed} dropdownSide="right"/> 
          </div>
        </div>
      </div>
      
      {/* 2. Conteúdo Principal */}
      <div className="flex flex-col">
        {/* O Header ainda contém o menu Sheet para mobile */}
        <Header />
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
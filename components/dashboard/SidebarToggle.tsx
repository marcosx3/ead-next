'use client';

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  // O ícone muda dependendo do estado
  const Icon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <Button
      variant="ghost" // Estilo discreto
      size="icon"
      onClick={onToggle}
      className="hidden md:flex" // Visível APENAS em desktop (md: e acima)
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
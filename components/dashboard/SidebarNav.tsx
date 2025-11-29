import Link from "next/link";
import { Home, Settings, Users, LineChart, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Definição dos navItems (use o array de exemplo acima)
export const navItems = [
  // ... (Seu array navItems)
  { href: "/", label: "Dashboard", icon: Home, type: "link" }, 
  { href: "/analytics", label: "Analytics", icon: LineChart, type: "link" },
  { 
    label: "Users", 
    icon: Users, 
    type: "dropdown", 
    subItems: [
      { href: "/users", label: "Listar", icon: List },
      { href: "/users/create", label: "Criar", icon: Plus },
    ]
  },
  { href: "/settings", label: "Settings", icon: Settings, type: "link" },
];

interface SidebarNavProps {
  isCollapsed?: boolean;
  // Nova prop: 'right' para desktop, 'bottom' para mobile
  dropdownSide: 'right' | 'bottom'; 
}

export function SidebarNav({ isCollapsed, dropdownSide }: SidebarNavProps) {
  
  // Se estiver colapsado, o DropdownMenu não deve funcionar,
  // mas o botão principal ainda deve levar a algum lugar (ex: /users)
  // Neste caso, vamos tornar o link principal o primeiro subItem: /users
  // Dentro de components/dashboard/SidebarNav.tsx

if (isCollapsed) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        // 1. Determina a URL principal
        // Se for um dropdown E tiver sub-itens, usa o href do primeiro sub-item.
        // Se for um link simples, usa item.href.
        // Caso contrário, será undefined.
        const mainHref = item.type === 'dropdown' && item.subItems && item.subItems.length > 0
          ? item.subItems[0].href
          : item.href;

        // 2. Garante que o 'href' é sempre uma string válida, usando '#' como fallback.
        // Isso resolve o erro de tipagem 'string | undefined' -> 'Url'.
        const safeHref = mainHref ?? '#'; 

        const IconComponent = item.icon;

        return (
          <Button
            key={item.label}
            asChild
            variant="ghost"
            className="w-full justify-center"
            size="icon"
          >
            {/* Usa safeHref para garantir a compatibilidade com next/link */}
            <Link href={safeHref}> 
              <IconComponent className="h-4 w-4" />
              {/* Mantém o label oculto, apenas para leitores de tela */}
              <span className="sr-only">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
  
  // Lógica para Sidebar Expandida
 // Lógica para Sidebar Expandida (Corrigida)
return (
  <nav className="flex flex-col gap-1 p-4">
    {navItems.map((item) => {
      const IconComponent = item.icon;

      if (item.type === "link") {
        // 1. Renderiza um Link/Button simples
        // Usamos 'item.href ?? "#"' para garantir que o href seja string, 
        // mesmo que a tipagem esteja incompleta e permita undefined.
        const safeHref = item.href ?? '#'; 

        return (
          <Button
            // Usamos item.label como key, pois item.href pode ser undefined para dropdowns (embora não aqui).
            key={item.label} 
            asChild 
            variant="ghost"
            className="w-full justify-start"
          >
            {/* O TypeScript agora aceita safeHref */}
            <Link href={safeHref}> 
              <IconComponent className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </Button>
        );
      }

      if (item.type === "dropdown" && item.subItems) {
        // 2. Renderiza o Dropdown Menu
        return (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start"
              >
                <IconComponent className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side={dropdownSide}
              align="start"
              className={`w-48 ${dropdownSide === 'right' ? 'ml-2' : ''}`}
            >
              {item.subItems.map((subItem) => { // Removi 'index' se não for usado
                const SubIcon = subItem.icon;
                return (
                  <DropdownMenuItem key={subItem.href} asChild>
                    <Link href={subItem.href} className="flex items-center">
                      <SubIcon className="mr-2 h-4 w-4" />
                      {subItem.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }

      return null;
    })}
  </nav>
);
}
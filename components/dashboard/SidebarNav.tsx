'use client';

import Link from "next/link";
import { Home, Settings, Users, LineChart, List, Plus, ShieldCheck, Video, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/context/auth-context";

export interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  type: "link" | "dropdown";
  permission?: string;
  subItems?: NavItem[];
}

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home, type: "link" },
  { href: "/analytics", label: "Analytics", icon: LineChart, type: "link" },
  {
    label: "Usuários",
    icon: Users,
    type: "dropdown",
    subItems: [
      { href: "/users", label: "Listar", icon: List, type: "link", permission: "users.read" },
      { href: "/users/create", label: "Criar", icon: Plus, type: "link", permission: "users.create" },
    ],
  },
  {
    label: "Meus Cursos",
    icon: Video,
    type: "link",
    href: "/courses/my-courses"
  },
  {
    label: "Cursos",
    icon: Video,
    type: "dropdown",
    subItems: [
      { href: "/courses", label: "Listar", icon: List, type: "link", permission: "courses.read" },
      { href: "/courses/create", label: "Criar", icon: Video, type: "link", permission: "courses.create" },
    ],
  },
  {
    label: "Configurações",
    icon: Settings,
    type: "dropdown",
    subItems: [
      { href: "/settings/permissions", label: "Permissões", icon: ShieldCheck, type: "link", permission: "settings.permissions" },
    ],
  },
];

interface SidebarNavProps {
  isCollapsed?: boolean;
  dropdownSide: 'right' | 'bottom';
}

export function SidebarNav({ isCollapsed, dropdownSide }: SidebarNavProps) {
  const { permissions } = useAuth();

  const filteredNavItems: NavItem[] = navItems
    .map(item => {
      if (item.subItems) {
        const filteredSubItems = item.subItems
          .filter(sub => !sub.permission || permissions.includes(sub.permission))
          .map(sub => ({ ...sub, type: sub.type ?? "link" }));
        if (!filteredSubItems.length) return null;
        return { ...item, subItems: filteredSubItems, type: "dropdown" };
      }
      if (!item.permission || permissions.includes(item.permission)) {
        return { ...item, type: "link" };
      }
      return null;
    })
    .filter(Boolean) as NavItem[];

  if (isCollapsed) {
    return (
      <nav className="flex flex-col gap-1 p-4">
        {filteredNavItems.map(item => {
          const mainHref = item.type === 'dropdown' && item.subItems?.length
            ? item.subItems[0].href
            : item.href;
          const safeHref = mainHref ?? '#';
          const IconComponent = item.icon;

          return (
            <Button key={item.label} asChild variant="ghost" className="w-full justify-center" size="icon">
              <Link href={safeHref}>
                <IconComponent className="h-4 w-4" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 p-4">
      {filteredNavItems.map(item => {
        const IconComponent = item.icon;

        if (item.type === "link") {
          const safeHref = item.href ?? '#';
          return (
            <Button key={item.label} asChild variant="ghost" className="w-full justify-start">
              <Link href={safeHref}>
                <IconComponent className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        }

        if (item.type === "dropdown" && item.subItems?.length) {
          return (
            <DropdownMenu key={item.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <IconComponent className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side={dropdownSide} align="start" className={`w-48 ${dropdownSide === 'right' ? 'ml-2' : ''}`}>
                {item.subItems.map(subItem => {
                  const SubIcon = subItem.icon;
                  return (
                    <DropdownMenuItem key={subItem.href} asChild>
                      <Link href={subItem.href ?? '#'} className="flex items-center">
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

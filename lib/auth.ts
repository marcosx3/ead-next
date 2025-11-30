// ===============================================
// Tipagem
// ===============================================

export type Action = 'read' | 'create' | 'update' | 'delete';

export const RESOURCES = ['users', 'settings', 'analytics'] as const;
export type Resource = typeof RESOURCES[number];

export const ROLES = ['admin', 'editor', 'viewer'] as const;
export type Role = typeof ROLES[number];

export type Permission = `${Resource}.${Action}`;

// ===============================================
// Dados Mock (Matriz de Permissões)
// ===============================================

// Mapeamento de Funções (Roles) para Permissões (Actions por Resource)
export const ROLE_PERMISSION_MAP: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    users: ['read', 'create', 'update', 'delete'],
    settings: ['read', 'update', 'create', 'delete'],
    analytics: ['read'],
  },
  editor: {
    users: ['read', 'create', 'update'],
    settings: ['read'],
    analytics: ['read'],
  },
  viewer: {
    users: ['read'],
    settings: [],
    analytics: ['read'],
  },
};

// ===============================================
// Lógica de Autorização (Authorization Guard)
// ===============================================

/**
 * Retorna o papel (Role) do usuário logado.
 * Em produção, essa informação viria de um contexto de autenticação global.
 */
function getCurrentUserRole(): Role {
  // Simulação: Retorne 'editor' ou 'viewer' para testar o AuthorizationGuard
  return 'editor'; 
}

/**
 * Converte a Matriz de Permissões (Role, Resource, Action) em uma lista simples
 * de strings no formato "resource.action" (ex: "users.create").
 * Esta é a lista de permissões que o guard verifica.
 */
function getFlattenedPermissions(role: Role): Permission[] {
  const resourceActions = ROLE_PERMISSION_MAP[role];
  const permissions: Permission[] = [];

  for (const resource in resourceActions) {
    if (resourceActions.hasOwnProperty(resource)) {
      resourceActions[resource as Resource].forEach(action => {
        permissions.push(`${resource}.${action}` as Permission);
      });
    }
  }
  return permissions;
}


/**
 * Verifica se o papel atual do usuário possui a permissão necessária.
 * @param requiredPermission A permissão a ser verificada (ex: 'users.create').
 * @returns true se o usuário tiver a permissão, false caso contrário.
 */
export function canAccess(requiredPermission: Permission): boolean {
  const userRole = getCurrentUserRole();
  
  // Se o ambiente for de desenvolvimento, você pode adicionar um log para debug:
  // console.log(`Verificando '${requiredPermission}' para o Role: ${userRole}`);

  const userPermissions = getFlattenedPermissions(userRole);

  return userPermissions.includes(requiredPermission);
}
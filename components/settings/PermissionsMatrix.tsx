'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button'; // <-- IMPORTAR BUTTON
import { Save } from 'lucide-react'; // <-- IMPORTAR SAVE
import { RESOURCES, ROLE_PERMISSION_MAP, ROLES } from '@/lib/auth';
import { Action } from '@/lib/auth';
import { Role } from '@/lib/auth';
import { Resource } from '@/lib/auth';

// Importe os dados de simulação (ajuste o caminho conforme necessário)

// Ações que serão exibidas como colunas
const ACTIONS: Action[] = ['read', 'create', 'update', 'delete'];

export function PermissionsMatrix() {
  // 1. Estado para simular as permissões que podem ser alteradas
  const [permissions, setPermissions] = useState(ROLE_PERMISSION_MAP);

  // 2. Função para alternar (toggle) uma permissão específica
  const togglePermission = (role: Role, resource: Resource, action: Action, isChecked: boolean) => {
    setPermissions(prev => {
      // ... (lógica de toggle permanece a mesma) ...
      const currentActions = prev[role][resource];
      let newActions;

      if (isChecked) {
        newActions = [...currentActions, action];
      } else {
        newActions = currentActions.filter(a => a !== action);
      }

      return {
        ...prev,
        [role]: {
          ...prev[role],
          [resource]: newActions,
        }
      };
    });
  };
  
  // 3. FUNÇÃO DE SALVAMENTO NO CLIENTE (NOVO)
  const handleSavePermissions = () => {
    console.log("Salvar Permissões. Dados enviados:", permissions);
    // Aqui você faria o POST/PUT para a API com o objeto 'permissions'
    alert("Permissões salvas (simulação)!");
  };

  return (
    <div className="space-y-6">
        {/* BOTÃO DE SALVAR - AGORA DENTRO DO CLIENT COMPONENT */}
        <div className="flex justify-end">
            <Button onClick={handleSavePermissions}>
                <Save className="w-4 h-4 mr-2" /> Salvar Alterações
            </Button>
        </div>

        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    {/* ... (cabeçalho da tabela) ... */}
                    <TableRow>
                        <TableHead className="w-[150px] font-bold">Recurso</TableHead>
                        {ROLES.map(role => (
                          <TableHead key={role} className="text-center font-bold capitalize border-l">
                            {role}
                          </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                
                <TableBody>
                    {/* ... (corpo da tabela com checkboxes) ... */}
                    {RESOURCES.map(resource => (
                      <React.Fragment key={resource}>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={ROLES.length + 1} className="font-semibold capitalize">
                            {resource}
                          </TableCell>
                        </TableRow>
                        
                        {ACTIONS.map(action => (
                          <TableRow key={`${resource}-${action}`}>
                            <TableCell className="pl-8 text-sm capitalize">{action}</TableCell>
                            
                            {ROLES.map(role => {
                              const isChecked = permissions[role][resource].includes(action);
                              
                              return (
                                <TableCell key={role} className="text-center border-l">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked: boolean) => togglePermission(role, resource, action, checked)}
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
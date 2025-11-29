// app/context/auth-context.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Definição da Interface do Contexto
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Provedor de Autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Função que simula o login (no futuro, você fará a chamada NestJS aqui)
  const login = (token: string) => {
    // 💡 Simulação: Armazena o token (no futuro use Cookies HttpOnly)
    localStorage.setItem('lms_token', token); 
    setIsAuthenticated(true);
    
    // Redireciona para a página inicial (Dashboard)
    router.push('/home'); 
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook Personalizado para uso fácil
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
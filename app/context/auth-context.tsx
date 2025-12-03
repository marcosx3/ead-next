'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Definição da Interface do Contexto
interface AuthContextType {
  isAuthenticated: boolean;
  // Nova função para realizar a chamada da API (signIn)
  signIn: (email: string, password: string) => Promise<void>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL base da  API 
const API_URL = 'http://localhost:3001/auth/login'; 

// 2. Provedor de Autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Função interna para salvar o token e mudar o estado (mantida)
  const setAuthToken = (token: string) => {
    // 💡 Armazena o token (use Cookies HttpOnly em produção!)
    localStorage.setItem('lms_token', token); 
    setIsAuthenticated(true);
    router.push('/home'); 
  };
  
  // Função para fazer a chamada real à API (o novo núcleo)
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Lança um erro se a resposta não for 2xx (por exemplo, 401 Unauthorized)
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao autenticar.');
      }

      // Se for bem-sucedido, obtém o token
      const data = await response.json();
      const token = data.access_token;
      
      // Salva o token e redireciona
      setAuthToken(token); 

    } catch (error) {
      console.error('Erro de Login:', error);
      // Você pode querer exibir uma notificação para o usuário aqui
      throw error; // Re-lança para que o componente de Login possa lidar com isso
    }
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook Personalizado (inalterado)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
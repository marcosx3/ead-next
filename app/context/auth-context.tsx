"use client";

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // corrigido o import

interface JwtPayload {
  sub: string; // ID do usuário
  email: string;
  role: string;
  permissions?: string[]; // pode vir undefined
}

interface AuthContextType {
  isAuthenticated: boolean;
  permissions: string[];
  user: JwtPayload | null; // Novo campo user
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthState {
  user: { sub: string } | null;
  authLoading: boolean;          // <- novo
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [user, setUser] = useState<JwtPayload | null>(null); // Estado para o user
  const router = useRouter();

  // Carrega token do localStorage ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      applyToken(token);
    }
  }, []);

  const applyToken = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);

    try {
      const decoded: JwtPayload = jwtDecode(token);
      setUser(decoded); // Define o user com base no token decodificado
      setPermissions(decoded.permissions ?? []);
    } catch (err) {
      console.error("Erro ao decodificar token:", err);
      setPermissions([]);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao autenticar.');
      }

      const data = await response.json();
      applyToken(data.access_token);
      router.push('/home');
    } catch (err) {
      console.error("Erro de login:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setPermissions([]);
    setUser(null); // Limpa o user ao fazer logout
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, permissions, user, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

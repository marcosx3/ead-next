"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions?: string[];
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  permissions: string[];
  user: JwtPayload | null;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const router = useRouter();

  const isTokenExpired = (exp: number) => Date.now() >= exp * 1000;

  const clearAuth = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setPermissions([]);
    setUser(null);
  };

  const applyToken = (token: string) => {
    try {
      const decoded: JwtPayload = jwtDecode(token);

      if (isTokenExpired(decoded.exp)) {
        clearAuth();
        router.replace("/login");
        return;
      }

      localStorage.setItem("access_token", token);
      setIsAuthenticated(true);
      setUser(decoded);
      setPermissions(decoded.permissions ?? []);
    } catch (err) {
      console.error("Erro ao decodificar token:", err);
      clearAuth();
      router.replace("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) applyToken(token);
  }, []);

  // 🔥 Verificação periódica da expiração
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const decoded: JwtPayload = jwtDecode(token);
        if (isTokenExpired(decoded.exp)) {
          clearAuth();
          router.replace("/login");
        }
      } catch {
        clearAuth();
        router.replace("/login");
      }
    }, 60_000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Falha ao autenticar.");
    }

    const data = await response.json();
    applyToken(data.access_token);
    router.push("/home");
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, permissions, user, signIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used dentro de AuthProvider");
  return context;
}

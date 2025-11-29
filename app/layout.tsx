// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/auth-context';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* AuthProvider deve ser um Client Component ('use client') */}
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
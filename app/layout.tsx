// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/auth-context';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* AuthProvider deve ser um Client Component ('use client') */}
        <AuthProvider>
            <Toaster richColors closeButton position='top-right'/>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
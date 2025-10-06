import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'sonIA - Gestión de Tratamiento Médico',
  description: 'Plataforma digital inteligente para gestionar el tratamiento médico y apoyar a los cuidadores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider 
      localization={esES}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="es">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
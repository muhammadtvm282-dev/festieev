import './globals.css';
import type { Metadata } from 'next';
import { Inter, Amiri } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const amiri = Amiri({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-arabic', display: 'swap' });

export const metadata: Metadata = {
  title: 'Hidayathul Islam  Madrasa — Annual Program',
  description: 'Madrasa Program Management System — Programs, Schedule, Participants, Results, and Live updates.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

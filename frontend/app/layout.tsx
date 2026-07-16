import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import AutumnBackground from '@/components/theme/AutumnBackground';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata = {
  title: 'Innovation & Collaboration Hub',
  description: 'A platform for students, mentors, and innovators to collaborate on projects.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
      </head>
      <body className={`${inter.variable} ${outfit.variable} bg-transparent text-foreground min-h-screen antialiased font-sans relative`}>
        <AutumnBackground>
          {/* Subtle high-end texture overlay */}
          <div className="noise-overlay" />
          {children}
        </AutumnBackground>
      </body>
    </html>
  );
}

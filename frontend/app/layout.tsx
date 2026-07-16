import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import AutumnBackground from '@/components/theme/AutumnBackground';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
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
    <html lang="en">
      <head>
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-transparent text-foreground min-h-screen antialiased font-sans relative`}>
        <AutumnBackground>
          {/* Subtle high-end texture overlay */}
          <div className="noise-overlay" />
          {children}
        </AutumnBackground>
      </body>
    </html>
  );
}

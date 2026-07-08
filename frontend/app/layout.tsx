import './globals.css';
import { Inter, Outfit } from 'next/font/google';

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
        <script dangerouslySetInnerHTML={{__html: `
          try {
            var saved = localStorage.getItem('theme');
            if (saved === 'light') {
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
            }
          } catch (_) {}
        `}} />
      </head>
      <body className={`${inter.variable} ${outfit.variable} bg-background text-foreground min-h-screen antialiased font-sans relative`}>
        {/* Subtle high-end texture overlay */}
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}

import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} bg-background text-foreground min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}

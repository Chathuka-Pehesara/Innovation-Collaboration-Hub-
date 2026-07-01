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
      <body className={`${inter.className} bg-[#0F1117] text-gray-100 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}

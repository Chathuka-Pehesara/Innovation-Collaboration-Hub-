'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageWrapper from '@/components/layout/PageWrapper';
import MentorChat from '@/components/ai/MentorChat';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, initializeSession } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setHydrated(true);
    initializeSession().finally(() => {
      setInitializing(false);
    });
  }, [initializeSession]);

  useEffect(() => {
    // If not authenticated after initialization, redirect to login
    if (hydrated && !initializing && !token) {
      router.push('/login');
    }
  }, [token, router, hydrated, initializing]);

  // Render a loading state while hydration/auth check is in progress
  if (!hydrated || initializing || !token) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <span className="text-indigo-900/40 text-xs font-semibold animate-pulse uppercase tracking-widest">Restoring Secure Session...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6 md:p-8 flex flex-col justify-between gap-12">
          <PageWrapper>{children}</PageWrapper>
          <Footer />
        </main>
      </div>
      <MentorChat />
    </div>
  );
}

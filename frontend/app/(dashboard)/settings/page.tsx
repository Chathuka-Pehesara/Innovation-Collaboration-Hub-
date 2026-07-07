/**
 * @file        settings/page.tsx
 * @owner       IT Team
 * @description User profile settings dashboard
 * @path        frontend/app/(dashboard)/settings/page.tsx
 */

'use client';

import { useEffect, useState } from 'react';
import ProfileDashboard from '@/components/profile/ProfileDashboard';
import EmptyState from '@/components/EmptyState';
import { useAuthStore } from '@/lib/authStore';

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    // Get user ID from localStorage or fallback to store user ID
    const storedUserId = localStorage.getItem('userId') || user?.id;
    if (storedUserId) {
      setUserId(storedUserId);
    }
    setLoading(false);
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

  if (!userId) {
    return (
      <EmptyState message="Please log in to access your profile settings" />
    );
  }

  return <ProfileDashboard userId={userId} />;
}

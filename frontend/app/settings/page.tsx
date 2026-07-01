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

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user ID from localStorage (set during auth)
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!userId) {
    return (
      <EmptyState message="Please log in to access your profile settings" />
    );
  }

  return <ProfileDashboard userId={userId} />;
}

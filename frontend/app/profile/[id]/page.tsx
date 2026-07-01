/**
 * @file        [id]/page.tsx
 * @owner       IT Team
 * @description Student profile page route handler
 * @path        frontend/app/(dashboard)/profile/[id]/page.tsx
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StudentProfilePage from '@/components/profile/StudentProfilePage';

export default function StudentProfileRoute() {
  const params = useParams();
  const userId = params?.id as string;

  if (!userId) {
    return <div className="p-8 text-center text-red-600">Invalid profile ID</div>;
  }

  return <StudentProfilePage userId={userId} />;
}

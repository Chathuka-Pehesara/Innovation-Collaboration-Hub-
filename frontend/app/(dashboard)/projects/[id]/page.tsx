'use client';

import { useParams } from 'next/navigation';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Project Details</h1>
        <p className="text-gray-400 text-sm">View and manage information for project workspace {id}.</p>
      </div>
      <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-sm">
        Project detailed information, milestones, and request actions will appear here.
      </div>
    </div>
  );
}

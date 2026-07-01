'use client';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Projects</h1>
        <p className="text-gray-400 text-sm">Manage your collaborative workspaces and ideas.</p>
      </div>
      <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-sm">
        List of user-owned and participating projects will appear here.
      </div>
    </div>
  );
}

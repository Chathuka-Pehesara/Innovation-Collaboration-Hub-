'use client';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create New Project</h1>
        <p className="text-gray-400 text-sm">Start a new project space and find teammates.</p>
      </div>
      <div className="glass-panel p-12 rounded-2xl text-center text-gray-500 text-sm">
        New project configuration form will appear here.
      </div>
    </div>
  );
}

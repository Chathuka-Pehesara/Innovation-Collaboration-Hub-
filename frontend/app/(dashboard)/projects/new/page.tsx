'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProjectForm, { ProjectFormData } from '@/components/ProjectForm';
import Toast from '@/components/Toast';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleCreateProject = async (formData: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      
      // Save project
      const { data: project } = await api.post('/projects', {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        teamSize: formData.teamSize
      });

      // Save tags and skills if any
      if (formData.tags && formData.tags.length > 0) {
        await api.post(`/projects/${project.id}/tags`, { tags: formData.tags });
      }
      if (formData.skills && formData.skills.length > 0) {
        await api.post(`/projects/${project.id}/skills`, { skills: formData.skills });
      }

      setToastType('success');
      setToastMsg('Project created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/explore');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setToastType('error');
      setToastMsg(err.response?.data?.error || 'Failed to create project. Please verify database availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg(null)}
        />
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create New Project</h1>
        <p className="text-gray-400 text-sm">Start a new collaborative workspace and utilize our AI Assistants.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <ProjectForm
          onSubmit={handleCreateProject}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

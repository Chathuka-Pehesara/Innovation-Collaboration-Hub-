/**
 * @file        EditProfileForm.tsx
 * @owner       IT Team
 * @description Edit profile form for updating name, bio, contact details, and social links
 * @depends     React, Next.js, react-hook-form, zod, profileApi
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Profile, updateProfile } from '@/lib/api/profileApi';
import Toast from '@/components/Toast';

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional().or(z.literal('')),
  specialization: z.enum(['AI', 'IT', 'Cybersecurity', 'Networking', 'Other']).optional(),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type EditProfileInput = z.infer<typeof editProfileSchema>;

interface EditProfileFormProps {
  profile: Profile;
  userId: string;
  onSuccess?: (updated: Profile) => void;
}

export default function EditProfileForm({ profile, userId, onSuccess }: EditProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio || '',
      specialization: (profile.specialization as any) || undefined,
      githubUrl: profile.githubUrl || '',
      linkedinUrl: profile.linkedinUrl || '',
      portfolioUrl: profile.portfolioUrl || '',
      twitterUrl: profile.twitterUrl || '',
    },
  });

  const onSubmit = async (data: EditProfileInput) => {
    setIsLoading(true);
    try {
      const updated = await updateProfile(userId, data);
      setToast({ message: 'Profile updated successfully', type: 'success' });
      onSuccess?.(updated);
      reset(data);
    } catch (error) {
      setToast({ message: 'Failed to update profile', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-xl font-bold text-slate-900 mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">Name</label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">Bio</label>
          <textarea
            {...register('bio')}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about yourself (max 500 characters)"
          />
          {errors.bio && <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>}
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">Specialization</label>
          <select
            {...register('specialization')}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a specialization</option>
            <option value="AI">AI</option>
            <option value="IT">IT</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Networking">Networking</option>
            <option value="Other">Other</option>
          </select>
          {errors.specialization && (
            <p className="text-red-600 text-sm mt-1">{errors.specialization.message}</p>
          )}
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* GitHub */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">GitHub URL</label>
            <input
              {...register('githubUrl')}
              type="url"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://github.com/..."
            />
            {errors.githubUrl && (
              <p className="text-red-600 text-sm mt-1">{errors.githubUrl.message}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">LinkedIn URL</label>
            <input
              {...register('linkedinUrl')}
              type="url"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://linkedin.com/..."
            />
            {errors.linkedinUrl && (
              <p className="text-red-600 text-sm mt-1">{errors.linkedinUrl.message}</p>
            )}
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Portfolio URL</label>
            <input
              {...register('portfolioUrl')}
              type="url"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
            {errors.portfolioUrl && (
              <p className="text-red-600 text-sm mt-1">{errors.portfolioUrl.message}</p>
            )}
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Twitter URL</label>
            <input
              {...register('twitterUrl')}
              type="url"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://twitter.com/..."
            />
            {errors.twitterUrl && (
              <p className="text-red-600 text-sm mt-1">{errors.twitterUrl.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

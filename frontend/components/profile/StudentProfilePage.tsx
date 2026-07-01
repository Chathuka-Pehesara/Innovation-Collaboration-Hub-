/**
 * @file        StudentProfilePage.tsx
 * @owner       IT Team
 * @description Public student profile page - displays profile, skills, and portfolio
 * @depends     React, Next.js, tailwindcss, profileApi
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Profile, getProfile } from '@/lib/api/profileApi';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

interface StudentProfilePageProps {
  userId: string;
}

export default function StudentProfilePage({ userId }: StudentProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(userId);
        setProfile(data);
        setError(null);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <EmptyState message={error} />;
  if (!profile) return <EmptyState message="Profile not found" />;

  const days = profile.availableDays || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
            {/* Avatar */}
            <div className="relative">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover shadow-md"
                />
              ) : (
                <div className="w-30 h-30 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold shadow-md">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Level {profile.level}
              </div>
            </div>

            {/* Profile Header Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-blue-600 font-medium">{profile.specialization || 'Student'}</p>
              <p className="text-slate-600 mt-2">{profile.bio}</p>

              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 transition text-sm"
                  >
                    GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-600 transition text-sm"
                  >
                    LinkedIn
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-500 transition text-sm"
                  >
                    Portfolio
                  </a>
                )}
                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-400 transition text-sm"
                  >
                    Twitter
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{profile.xp}</p>
                <p className="text-sm text-slate-600">XP Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{profile.availableHours}h</p>
                <p className="text-sm text-slate-600">Weekly Hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full"
                    >
                      <span className="font-medium text-slate-900">{skill.name}</span>
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Section */}
            {profile.portfolioItems && profile.portfolioItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Portfolio</h2>
                <div className="space-y-4">
                  {profile.portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-md transition"
                    >
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={120}
                          height={120}
                          className="w-full sm:w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-slate-900 mb-4">Availability</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Weekly Hours</p>
                  <p className="text-lg font-bold text-blue-600">{profile.availableHours} hours</p>
                </div>
                {days.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Available Days</p>
                    <div className="flex flex-wrap gap-1">
                      {days.map((day) => (
                        <span
                          key={day}
                          className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-slate-900 mb-4">Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Email</p>
                  <p className="text-slate-900 break-all">{profile.email}</p>
                </div>
                <div>
                  <p className="text-slate-600">Member Since</p>
                  <p className="text-slate-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @file        ProfileDashboard.tsx
 * @owner       IT Team
 * @description Complete profile management dashboard combining all profile components
 * @depends     React, Next.js, profileApi
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Profile, getProfile } from '@/lib/api/profileApi';
import EditProfileForm from './EditProfileForm';
import AvatarUpload from './AvatarUpload';
import SkillsManager from './SkillsManager';
import PortfolioManager from './PortfolioManager';
import AvailabilitySettings from './AvailabilitySettings';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

interface ProfileDashboardProps {
  userId: string;
}

export default function ProfileDashboard({ userId }: ProfileDashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'avatar' | 'skills' | 'portfolio' | 'availability'>('overview');

  useEffect(() => {
    fetchProfile();
  }, [userId]);

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

  if (loading) return <LoadingSkeleton />;
  if (error) return <EmptyState message={error} />;
  if (!profile) return <EmptyState message="Profile not found" />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'edit', label: 'Edit Profile', icon: '✏️' },
    { id: 'avatar', label: 'Avatar', icon: '📷' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'portfolio', label: 'Portfolio', icon: '🎨' },
    { id: 'availability', label: 'Availability', icon: '📅' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-blue-600 font-medium">{profile.specialization || 'Student'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Profile Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium text-slate-900">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Specialization</p>
                    <p className="font-medium text-slate-900">{profile.specialization || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Member Since</p>
                    <p className="font-medium text-slate-900">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Level</p>
                    <p className="font-medium text-slate-900">Level {profile.level}</p>
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">Bio</p>
                    <p className="text-slate-900">{profile.bio}</p>
                  </div>
                )}
              </div>

              {/* Skills Overview */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Skills ({profile.skills.length})</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 6).map((skill) => (
                      <div
                        key={skill.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full"
                      >
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          {skill.level}
                        </span>
                      </div>
                    ))}
                    {profile.skills.length > 6 && (
                      <div className="text-sm text-slate-600 px-3 py-1">
                        +{profile.skills.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
                <p className="text-sm opacity-90">XP Points</p>
                <p className="text-3xl font-bold mt-2">{profile.xp}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
                <p className="text-sm opacity-90">Weekly Hours</p>
                <p className="text-3xl font-bold mt-2">{profile.availableHours}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-slate-900 mb-4">Social Links</h3>
                <div className="space-y-2">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline text-sm truncate"
                    >
                      🔗 GitHub
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline text-sm truncate"
                    >
                      🔗 LinkedIn
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline text-sm truncate"
                    >
                      🔗 Portfolio
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline text-sm truncate"
                    >
                      🔗 Twitter
                    </a>
                  )}
                  {!profile.githubUrl && !profile.linkedinUrl && !profile.portfolioUrl && !profile.twitterUrl && (
                    <p className="text-slate-600 text-sm">No social links added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'edit' && (
          <EditProfileForm
            profile={profile}
            userId={userId}
            onSuccess={(updated) => setProfile(updated)}
          />
        )}

        {/* Avatar Tab */}
        {activeTab === 'avatar' && (
          <AvatarUpload
            userId={userId}
            currentAvatarUrl={profile.avatarUrl}
            onSuccess={(url) => setProfile({ ...profile, avatarUrl: url })}
          />
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <SkillsManager
            userId={userId}
            onSkillsUpdate={(skills) => setProfile({ ...profile, skills })}
          />
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <PortfolioManager
            userId={userId}
            onItemsUpdate={(items) => setProfile({ ...profile, portfolioItems: items })}
          />
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <AvailabilitySettings
            userId={userId}
            initialHours={profile.availableHours}
            initialDays={profile.availableDays}
            onSuccess={(hours, days) =>
              setProfile({ ...profile, availableHours: hours, availableDays: days })
            }
          />
        )}
      </div>
    </div>
  );
}

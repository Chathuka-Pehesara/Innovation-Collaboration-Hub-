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
import { SkillBadge } from './SkillBadge';
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
    <div className="space-y-6 fade-in-up">
      {/* Profile Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4.5">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-md shadow-indigo-500/5"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-3xl text-white">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">{profile.name}</h1>
            <p className="text-indigo-400 font-semibold tracking-wide uppercase text-xs mt-1.5">{profile.specialization || 'Student'}</p>
          </div>
        </div>
        <div>
          <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Level {profile.level}
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-white/5 pb-px">
        <div className="flex overflow-x-auto gap-2 scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg border transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon} <span className="ml-1.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Info */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                    <p className="font-medium text-gray-200 mt-1">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Specialization</p>
                    <p className="font-medium text-gray-200 mt-1">{profile.specialization || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Member Since</p>
                    <p className="font-medium text-gray-200 mt-1">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Level</p>
                    <p className="font-medium text-gray-200 mt-1">Level {profile.level}</p>
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-6 pt-5 border-t border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Bio</p>
                    <p className="text-gray-200 text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>

              {/* Skills Overview */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Skills ({profile.skills.length})</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 6).map((skill) => (
                      <SkillBadge 
                        key={skill.id} 
                        name={skill.name} 
                        score={skill.score} 
                      />
                    ))}
                    {profile.skills.length > 6 && (
                      <div className="text-xs text-gray-400 self-center ml-2">
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
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-600/15 p-6">
                <p className="text-xs opacity-80 uppercase font-semibold tracking-wider">XP Points</p>
                <p className="text-4xl font-extrabold mt-3">{profile.xp}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-600/15 p-6">
                <p className="text-xs opacity-80 uppercase font-semibold tracking-wider">Weekly Hours</p>
                <p className="text-4xl font-extrabold mt-3">{profile.availableHours}h</p>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4">Social Links</h3>
                <div className="space-y-3">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-indigo-400 hover:text-indigo-300 font-medium truncate"
                    >
                      🔗 GitHub
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-indigo-400 hover:text-indigo-300 font-medium truncate"
                    >
                      🔗 LinkedIn
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-indigo-400 hover:text-indigo-300 font-medium truncate"
                    >
                      🔗 Portfolio
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-indigo-400 hover:text-indigo-300 font-medium truncate"
                    >
                      🔗 Twitter
                    </a>
                  )}
                  {!profile.githubUrl && !profile.linkedinUrl && !profile.portfolioUrl && !profile.twitterUrl && (
                    <p className="text-gray-400 text-xs">No social links added yet</p>
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

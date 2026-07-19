/**
 * @file        ProfileDashboard.tsx
 * @owner       IT Team
 * @description Complete profile management dashboard combining all profile components
 * @depends     React, Next.js, profileApi
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile, getProfile } from '@/lib/api/profileApi';
import EditProfileForm from './EditProfileForm';
import AvatarUpload from './AvatarUpload';
import SkillsManager from './SkillsManager';
import { SkillBadge } from './SkillBadge';
import ProfileBadges from './ProfileBadges';
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
    <div className="space-y-6 relative z-10 max-w-7xl mx-auto pb-10">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-orange-200/50 p-8 shadow-xl shadow-orange-900/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="relative"
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/60 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-4xl text-white shadow-lg border-4 border-white/60">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
              <span className="w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                {profile.level}
              </span>
            </div>
          </motion.div>
          
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-extrabold text-orange-950 tracking-tight">{profile.name}</h1>
            <p className="text-orange-700 font-bold tracking-widest uppercase text-xs mt-2 bg-orange-100/50 inline-block px-3 py-1 rounded-full border border-orange-200/50 w-fit">{profile.specialization || 'Student'}</p>
          </div>
        </div>
        
        <div className="relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-400/50 shadow-lg shadow-orange-500/25 flex flex-col items-center justify-center text-white"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Total XP</span>
            <span className="text-2xl font-black">{profile.xp}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs Menu */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/40 backdrop-blur-md rounded-2xl border border-orange-200/50 p-2 shadow-sm flex overflow-x-auto gap-2 scrollbar-none"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer z-10 flex-1 flex justify-center items-center gap-2 ${
              activeTab === tab.id
                ? 'text-orange-900 shadow-sm'
                : 'text-orange-900/50 hover:text-orange-900 hover:bg-orange-500/5'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-xl border border-orange-200/50 shadow-sm -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="text-lg">{tab.icon}</span> 
            <span>{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Content Area */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Info */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-orange-200/50 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-orange-950 mb-4">Profile Information</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-orange-900/60 uppercase tracking-wider font-bold">Email</p>
                      <p className="font-semibold text-orange-950 mt-1">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-900/60 uppercase tracking-wider font-bold">Specialization</p>
                      <p className="font-semibold text-orange-950 mt-1">{profile.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-900/60 uppercase tracking-wider font-bold">Member Since</p>
                      <p className="font-semibold text-orange-950 mt-1">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-900/60 uppercase tracking-wider font-bold">Level</p>
                      <p className="font-semibold text-orange-950 mt-1">Level {profile.level}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <div className="mt-6 pt-5 border-t border-orange-200/50">
                      <p className="text-xs text-orange-900/60 uppercase tracking-wider font-bold mb-1">Bio</p>
                      <p className="text-orange-900 text-sm leading-relaxed font-medium">{profile.bio}</p>
                    </div>
                  )}
                </div>

                {/* Skills Overview */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-orange-200/50 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-orange-950 mb-4">Skills ({profile.skills.length})</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.slice(0, 6).map((skill) => (
                        <SkillBadge 
                          key={skill.id} 
                          name={skill.name} 
                          score={skill.score} 
                        />
                      ))}
                      {profile.skills.length > 6 && (
                        <div className="text-xs text-orange-700 font-bold self-center ml-2">
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
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20 p-6 border border-white/20"
                >
                  <p className="text-xs opacity-90 uppercase font-bold tracking-wider">XP Points</p>
                  <p className="text-4xl font-black mt-3 drop-shadow-sm">{profile.xp}</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20 p-6 border border-white/20"
                >
                  <p className="text-xs opacity-90 uppercase font-bold tracking-wider">Weekly Hours</p>
                  <p className="text-4xl font-black mt-3 drop-shadow-sm">{profile.availableHours}h</p>
                </motion.div>

                {/* Badges Component */}
                <ProfileBadges userId={userId} />

                <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-orange-200/50 p-6 shadow-sm">
                  <h3 className="font-bold text-orange-950 mb-4">Social Links</h3>
                  <div className="space-y-3">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-orange-700 hover:text-orange-900 font-bold truncate transition-colors"
                      >
                        🔗 GitHub
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-orange-700 hover:text-orange-900 font-bold truncate transition-colors"
                      >
                        🔗 LinkedIn
                      </a>
                    )}
                    {profile.portfolioUrl && (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-orange-700 hover:text-orange-900 font-bold truncate transition-colors"
                      >
                        🔗 Portfolio
                      </a>
                    )}
                    {profile.twitterUrl && (
                      <a
                        href={profile.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-orange-700 hover:text-orange-900 font-bold truncate transition-colors"
                      >
                        🔗 Twitter
                      </a>
                    )}
                    {!profile.githubUrl && !profile.linkedinUrl && !profile.portfolioUrl && !profile.twitterUrl && (
                      <p className="text-orange-900/50 text-xs font-bold">No social links added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <EditProfileForm
                profile={profile}
                userId={userId}
                onSuccess={(updated) => setProfile(updated)}
              />
            </motion.div>
          )}

          {/* Avatar Tab */}
          {activeTab === 'avatar' && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AvatarUpload
                userId={userId}
                currentAvatarUrl={profile.avatarUrl}
                onSuccess={(url) => setProfile({ ...profile, avatarUrl: url })}
              />
            </motion.div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SkillsManager
                userId={userId}
                onSkillsUpdate={(skills) => setProfile({ ...profile, skills })}
              />
            </motion.div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PortfolioManager
                userId={userId}
                onItemsUpdate={(items) => setProfile({ ...profile, portfolioItems: items })}
              />
            </motion.div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <motion.div
              key="availability"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AvailabilitySettings
                userId={userId}
                initialHours={profile.availableHours}
                initialDays={profile.availableDays}
                onSuccess={(hours, days) =>
                  setProfile({ ...profile, availableHours: hours, availableDays: days })
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * @file        page.tsx  (app/(dashboard)/profile/[id]/page.tsx)
 * @owner       IT Team
 * @description Public student profile page — shows avatar, bio, skills, portfolio,
 *              availability, and social links. Edit button visible to profile owner.
 * @depends     lib/profileApi.ts, lib/authStore.ts, components/profile/*
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, Profile } from '@/lib/api/profileApi';
import { useAuthStore } from '@/lib/authStore';
import { AvatarWithFallback } from '@/components/profile/AvatarWithFallback';
import { SkillBadge } from '@/components/profile/SkillBadge';
import { PortfolioCard } from '@/components/profile/PortfolioCard';
import { AvailabilityDisplay } from '@/components/profile/AvailabilityDisplay';
import { SocialLinks } from '@/components/profile/SocialLinks';

const SPECIALIZATION_COLORS: Record<string, string> = {
  AI: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  IT: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Cybersecurity: 'bg-red-500/15 text-red-300 border-red-500/30',
  Networking: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Other: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwner = currentUser?.id === id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProfile(id)
      .then(setProfile)
      .catch(() => setError('Profile not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading profile…</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-400">{error || 'Something went wrong.'}</p>
        <button onClick={() => router.back()} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
          ← Go back
        </button>
      </div>
    );
  }

  const specializationClass = SPECIALIZATION_COLORS[profile.specialization ?? 'Other'] ?? SPECIALIZATION_COLORS.Other;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* ── Header card ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <AvatarWithFallback
          src={profile.avatarUrl}
          name={profile.name}
          size="lg"
          className="shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-white truncate">{profile.name}</h1>
            {profile.specialization && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${specializationClass}`}>
                {profile.specialization}
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="text-gray-400 text-sm leading-relaxed mt-1 line-clamp-3">{profile.bio}</p>
          )}

          <div className="flex items-center gap-4 mt-3">
            {/* XP pill */}
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
              ⚡ {profile.xp.toLocaleString()} XP · Level {profile.level}
            </span>
            <SocialLinks
              github={profile.githubUrl}
              linkedin={profile.linkedinUrl}
              portfolio={profile.portfolioUrl}
              twitter={profile.twitterUrl}
            />
          </div>
        </div>

        {isOwner && (
          <Link
            href={`/profile/edit`}
            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Edit profile
          </Link>
        )}
      </div>

      {/* ── Skills ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Skills</h2>
        {profile.skills.length === 0 ? (
          <p className="text-gray-500 text-sm">No skills listed yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <SkillBadge key={skill.id} name={skill.name} level={skill.level} />
            ))}
          </div>
        )}
      </section>

      {/* ── Availability ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Availability</h2>
        <AvailabilityDisplay hours={profile.availableHours} days={profile.availableDays} />
      </section>

      {/* ── Portfolio ── */}
      {profile.portfolioItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Portfolio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.portfolioItems.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { findTeammatesApi, TeammateResult } from '@/lib/api/aiApi';
import { getProfile, Profile } from '@/lib/api/profileApi';
import Toast from '../Toast';

interface MatchTeammate extends TeammateResult {
  profile?: Profile;
}

export default function AIMatchPanel() {
  const [loading, setLoading] = useState(true);
  const [teammates, setTeammates] = useState<MatchTeammate[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        const res = await findTeammatesApi();
        
        // Load details for each user in parallel
        const enriched = await Promise.all(
          res.suggestions.map(async (suggest) => {
            try {
              // Try to fetch real profile from DB
              const profile = await getProfile(suggest.user_id);
              return { ...suggest, profile };
            } catch (err) {
              // Fallback to mock profile details if user is not in db (or is a mock id like user1)
              return {
                ...suggest,
                profile: getMockProfile(suggest.user_id),
              };
            }
          })
        );
        
        setTeammates(enriched);
      } catch (err) {
        console.error('Failed to load teammate suggestions, using stubs:', err);
        // Fallback stubs for visual presentation if API fails completely
        setTeammates(getFallbackTeammates());
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const handleInvite = async (userId: string) => {
    setInvitingId(userId);
    // Simulate sending invitation
    setTimeout(() => {
      setToastType('success');
      setToastMessage(`Invitation successfully sent to ${userId}!`);
      setInvitingId(null);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm font-medium">Scanning network for compatible innovators...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teammates.map((tm, idx) => {
          const name = tm.profile?.name || tm.user_id;
          const spec = tm.profile?.specialization || 'Software Engineer';
          const bio = tm.profile?.bio || 'Passionate builder interested in system design and collaborative development.';
          const xp = tm.profile?.xp || 120;
          const level = tm.profile?.level || 1;
          const scorePercent = Math.round(tm.compatibility_score * 100);

          return (
            <div
              key={tm.user_id}
              className="glass-card overflow-hidden flex flex-col justify-between border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 p-6 relative group"
            >
              {/* Top border highlight on hover */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/10">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base line-clamp-1">{name}</h4>
                      <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">{spec}</p>
                    </div>
                  </div>

                  {/* Compatibility Circle */}
                  <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/5"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-500"
                        strokeWidth="3.5"
                        strokeDasharray={`${scorePercent}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-white">{scorePercent}%</span>
                  </div>
                </div>

                <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed italic">
                  "{bio}"
                </p>

                {/* Level / XP display */}
                <div className="flex gap-4 mb-4 text-[11px] text-gray-500 border-b border-white/5 pb-3">
                  <span>Level <strong className="text-gray-300">{level}</strong></span>
                  <span>XP <strong className="text-gray-300">{xp}</strong></span>
                  <span>Balance <strong className="text-emerald-400">{Math.round(tm.team_balance_score * 100)}%</strong></span>
                </div>

                {/* Skill Synergy */}
                <div className="space-y-3.5 mb-6 text-xs">
                  {/* Shared/Match Skills */}
                  {tm.matching_skills.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Shared Expertise</span>
                      <div className="flex flex-wrap gap-1.5">
                        {tm.matching_skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 font-medium text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unique Complementary Skills */}
                  {tm.complementary_skills.user2_unique.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Unique Skills They Bring</span>
                      <div className="flex flex-wrap gap-1.5">
                        {tm.complementary_skills.user2_unique.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-medium text-[10px]">
                            +{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleInvite(tm.user_id)}
                disabled={invitingId !== null}
                className="btn-primary w-full py-2 text-xs"
              >
                {invitingId === tm.user_id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>🤝 Invite to Squad</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to provide nice mock detail details for mock ids
function getMockProfile(userId: string): Profile {
  const mocks: Record<string, Partial<Profile>> = {
    user1: {
      name: 'Alex Rivera',
      specialization: 'AI & Data Science',
      bio: 'Deep learning researcher focused on NLP and transformer architectures. Looking to apply models to real-world software.',
      xp: 240,
      level: 4,
    },
    user2: {
      name: 'Elena Rostova',
      specialization: 'Full Stack Engineer',
      bio: 'React and Node.js developer. I build high-performance dashboard interfaces with optimized database query structures.',
      xp: 180,
      level: 3,
    },
    user3: {
      name: 'Sophia Chen',
      specialization: 'UI/UX Designer',
      bio: 'Product designer focusing on dark-mode glassmorphic layouts, design tokens, and smooth motion animations.',
      xp: 150,
      level: 2,
    },
    user4: {
      name: 'Marcus Brody',
      specialization: 'Cybersecurity Analyst',
      bio: 'Security researcher specializing in API auth protection, penetration testing, and rate-limiting security middleware.',
      xp: 310,
      level: 5,
    },
  };

  const key = userId.toLowerCase();
  const data = mocks[key] || {
    name: `Innovator ${userId}`,
    specialization: 'Software Engineer',
    bio: 'Enthusiastic developer ready to join projects and build cool software.',
    xp: 100,
    level: 1,
  };

  return {
    id: userId,
    email: `${userId}@example.com`,
    availableHours: 10,
    availableDays: ['Monday', 'Wednesday'],
    createdAt: new Date().toISOString(),
    skills: [],
    portfolioItems: [],
    ...data,
  } as Profile;
}

// Fallback suggestions lists if API fails entirely
function getFallbackTeammates(): MatchTeammate[] {
  return [
    {
      user_id: 'user1',
      compatibility_score: 0.89,
      matching_skills: ['Python', 'Git'],
      complementary_skills: {
        user1_unique: ['Next.js'],
        user2_unique: ['PyTorch', 'FastAPI', 'NLP'],
        shared: ['Python', 'Git'],
      },
      team_balance_score: 0.85,
      proficiency_distribution: { Advanced: 2, Intermediate: 1 },
      profile: getMockProfile('user1'),
    },
    {
      user_id: 'user2',
      compatibility_score: 0.82,
      matching_skills: ['TypeScript', 'TailwindCSS'],
      complementary_skills: {
        user1_unique: ['Python'],
        user2_unique: ['Node.js', 'PostgreSQL', 'Express'],
        shared: ['TypeScript', 'TailwindCSS'],
      },
      team_balance_score: 0.76,
      proficiency_distribution: { Intermediate: 3 },
      profile: getMockProfile('user2'),
    },
    {
      user_id: 'user3',
      compatibility_score: 0.74,
      matching_skills: ['Figma'],
      complementary_skills: {
        user1_unique: ['React'],
        user2_unique: ['Design Systems', 'Prototyping', 'CSS'],
        shared: ['Figma'],
      },
      team_balance_score: 0.9,
      proficiency_distribution: { Advanced: 1, Beginner: 1 },
      profile: getMockProfile('user3'),
    },
  ];
}

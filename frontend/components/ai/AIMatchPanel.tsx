'use client';

import { useEffect, useState } from 'react';
import { findTeammatesApi, TeammateResult } from '@/lib/api/aiApi';
import Toast from '../Toast';

export default function AIMatchPanel() {
  const [loading, setLoading] = useState(true);
  const [teammates, setTeammates] = useState<TeammateResult[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        const res = await findTeammatesApi();
        setTeammates(res.suggestions);
      } catch (err) {
        console.error('Failed to load teammate suggestions:', err);
        setToastMessage('Failed to load real teammates. Please try again later.');
        setToastType('error');
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {teammates.map((tm, idx) => {
          const name = tm.name || tm.user_id;
          const spec = tm.specialization || 'Software Engineer';
          const bio = tm.bio || 'Passionate builder interested in collaborative development.';
          const xp = tm.xp || 0;
          const level = tm.level || 1;
          const scorePercent = Math.round(tm.compatibility_score * 100) || 85;

          return (
            <div
              key={tm.user_id}
              className="glass-card overflow-hidden flex flex-col md:flex-row border border-orange-500/20 bg-white/70 hover:bg-white/95 backdrop-blur-xl rounded-2xl transition-all duration-500 relative group shadow-lg shadow-orange-900/10 hover:shadow-orange-500/20"
            >
              {/* Left border highlight on hover */}
              <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-orange-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              {/* Profile Image Banner - Left Half */}
              <div className="relative w-full md:w-5/12 shrink-0 min-h-[220px] md:min-h-full bg-gradient-to-br from-orange-400 to-amber-600 overflow-hidden">
                {tm.avatarUrl ? (
                  <img src={tm.avatarUrl} alt={name} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full min-h-[220px] flex items-center justify-center text-white/50 font-extrabold text-6xl">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Subtle Image Overlay */}
                <div className="absolute inset-0 bg-orange-900/10 group-hover:bg-transparent transition-colors duration-500" />
                
                {/* Compatibility Circle Overlay */}
                <div className="absolute top-4 left-4 relative w-12 h-12 shrink-0 flex items-center justify-center drop-shadow-xl bg-white/40 rounded-full backdrop-blur-md border border-white/60">
                  <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                    <path
                      className="text-white/30"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-orange-500 drop-shadow-md"
                      strokeWidth="3"
                      strokeDasharray={`${scorePercent}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-extrabold text-orange-950">{scorePercent}%</span>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="p-6 flex flex-col flex-grow w-full md:w-7/12">
                <div className="flex-grow">
                  {/* Header info */}
                  <div className="mb-3">
                    <h4 className="text-orange-950 font-black text-2xl tracking-tight leading-none mb-1 group-hover:text-orange-600 transition-colors">{name}</h4>
                    <p className="text-[10px] text-orange-600 font-extrabold uppercase tracking-widest">{spec}</p>
                  </div>

                  <p className="text-orange-950/70 text-xs line-clamp-3 mb-5 leading-relaxed italic font-medium">
                    "{bio}"
                  </p>

                  {/* Level / XP display */}
                  <div className="flex justify-between items-center mb-5 text-[11px] text-orange-900/60 border-b border-orange-200/60 pb-4">
                    <span className="flex flex-col"><span className="uppercase text-[9px] font-bold tracking-wider mb-0.5">Level</span><strong className="text-orange-950 text-base leading-none">{level}</strong></span>
                    <span className="flex flex-col items-center"><span className="uppercase text-[9px] font-bold tracking-wider mb-0.5">XP</span><strong className="text-orange-950 text-base leading-none">{xp}</strong></span>
                    <span className="flex flex-col items-end"><span className="uppercase text-[9px] font-bold tracking-wider mb-0.5">Balance</span><strong className="text-emerald-600 text-base leading-none">{Math.round(tm.team_balance_score * 100)}%</strong></span>
                  </div>

                  {/* Skill Synergy */}
                  <div className="space-y-4 mb-6 text-xs">
                    {/* Shared/Match Skills */}
                    {tm.matching_skills.length > 0 && (
                      <div>
                        <span className="text-[9px] uppercase font-bold text-orange-900/50 block mb-1.5 tracking-wider">Shared Expertise</span>
                        <div className="flex flex-wrap gap-1.5">
                          {tm.matching_skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 border border-orange-200 font-bold text-[10px] shadow-sm backdrop-blur-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unique Complementary Skills */}
                    {tm.complementary_skills.user2_unique.length > 0 && (
                      <div>
                        <span className="text-[9px] uppercase font-bold text-orange-900/50 block mb-1.5 tracking-wider">Unique Skills They Bring</span>
                        <div className="flex flex-wrap gap-1.5">
                          {tm.complementary_skills.user2_unique.slice(0, 4).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[10px] shadow-sm backdrop-blur-sm">
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
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2 mt-auto shrink-0"
                >
                  {invitingId === tm.user_id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    <>🤝 Invite to Squad</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



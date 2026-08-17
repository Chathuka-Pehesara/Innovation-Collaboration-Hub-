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

      <div className="flex flex-col gap-4">
        {teammates.map((tm, idx) => {
          const name = tm.name || tm.user_id;
          const spec = tm.specialization;
          const bio = tm.bio;
          const xp = tm.xp !== undefined ? tm.xp : null;
          const level = tm.level !== undefined ? tm.level : null;
          const scorePercent = Math.round(tm.compatibility_score * 100) || 0;

          return (
            <div
              key={tm.user_id}
              className="glass-card overflow-hidden flex flex-col md:flex-row border border-orange-500/20 bg-white/70 hover:bg-white/95 backdrop-blur-xl rounded-2xl transition-all duration-500 relative group shadow-lg shadow-orange-900/10 hover:shadow-orange-500/20"
            >
              {/* Left border highlight on hover */}
              <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-orange-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              {/* Profile Avatar - Left side */}
              <div className="relative w-full h-24 md:w-28 lg:w-32 md:h-auto md:self-stretch shrink-0 bg-gradient-to-br from-orange-400 to-amber-600 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
                {tm.avatarUrl ? (
                  <img src={tm.avatarUrl} alt={name} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 font-extrabold text-3xl">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Subtle Image Overlay */}
                <div className="absolute inset-0 bg-orange-900/10 group-hover:bg-transparent transition-colors duration-500" />
                
                {/* Compatibility Circle Overlay */}
                <div className="absolute top-1 left-1 w-9 h-9 z-20 shrink-0 flex items-center justify-center shadow-md shadow-orange-900/20 bg-white/90 rounded-full backdrop-blur-md border border-white">
                  <svg className="w-[90%] h-[90%] transform -rotate-90 absolute inset-0 m-auto" viewBox="0 0 36 36">
                    <path
                      className="text-orange-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-orange-500"
                      strokeWidth="3"
                      strokeDasharray={`${scorePercent}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="font-display absolute text-[10px] font-black text-orange-950">{scorePercent}%</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-3 md:p-4 flex flex-col md:flex-row justify-between items-center flex-grow w-full gap-4">
                
                {/* Left Side: Info & Bio */}
                <div className="flex-grow flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display text-orange-950 font-black text-xl tracking-tight leading-none group-hover:text-orange-600 transition-colors truncate">{name}</h4>
                    {spec && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-extrabold uppercase tracking-widest">{spec}</span>}
                  </div>
                  {bio ? (
                    <p className="font-sans text-orange-950/70 text-xs truncate mb-2 italic font-medium max-w-lg">
                      "{bio}"
                    </p>
                  ) : (
                    <p className="font-sans text-orange-950/40 text-xs truncate mb-2 italic font-medium max-w-lg">
                      No bio available
                    </p>
                  )}
                  
                  {/* Stats & Skills Row */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] mt-1">
                    <div className="flex items-center divide-x divide-orange-200/60 border-r border-orange-200/60 pr-4">
                      {level !== null && (
                        <div className="flex flex-col items-start pr-3">
                          <span className="text-[8px] uppercase tracking-widest text-orange-900/50 font-bold mb-0.5 flex items-center gap-1">
                            Level
                            <svg className="w-2.5 h-2.5 text-amber-500 animate-[spin_3s_linear_infinite]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </span>
                          <span className="font-display text-orange-950 text-sm font-black leading-none">{level}</span>
                        </div>
                      )}
                      {xp !== null && (
                        <div className="flex flex-col items-start px-3">
                          <span className="text-[8px] uppercase tracking-widest text-orange-900/50 font-bold mb-0.5">Experience</span>
                          <span className="font-display text-orange-950 text-sm font-black leading-none">{xp}</span>
                        </div>
                      )}
                      <div className="flex flex-col items-start pl-3">
                        <span className="text-[8px] uppercase tracking-widest text-emerald-700/60 font-bold mb-0.5">Synergy</span>
                        <span className="font-display text-emerald-600 text-sm font-black leading-none">{Math.round(tm.team_balance_score * 100)}%</span>
                      </div>
                    </div>
                    
                    {tm.matching_skills.length > 0 && (
                      <div className="flex gap-1">
                        {tm.matching_skills.slice(0, 2).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200 font-bold text-[9px] shadow-sm tracking-wide">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {tm.complementary_skills.user2_unique.length > 0 && (
                      <div className="flex gap-1">
                        {tm.complementary_skills.user2_unique.slice(0, 2).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[9px] shadow-sm tracking-wide">
                            +{s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Action */}
                <button
                  onClick={() => handleInvite(tm.user_id)}
                  disabled={invitingId !== null}
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2 shrink-0"
                >
                  {invitingId === tm.user_id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    <>🤝 Invite</>
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



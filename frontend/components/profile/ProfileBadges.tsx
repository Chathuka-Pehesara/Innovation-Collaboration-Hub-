'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Shield, Medal, Trophy } from 'lucide-react';
import { getProfileBadges } from '@/lib/api/profileApi';

interface Badge {
  id: string;
  name: string;
  description: string;
  tier: string;
  icon: string;
  awardedAt: string;
}

interface ProfileBadgesProps {
  userId: string;
}

export default function ProfileBadges({ userId }: ProfileBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await getProfileBadges(userId);
        setBadges(data);
      } catch (err) {
        console.error('Failed to fetch badges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [userId]);

  const getTierConfig = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return {
          bg: 'bg-gradient-to-br from-slate-200 via-white to-slate-300',
          border: 'border-slate-300',
          text: 'text-slate-800',
          iconColor: 'text-slate-600',
          glow: 'shadow-[0_0_20px_rgba(203,213,225,0.6)]',
          Icon: Trophy
        };
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-500',
          border: 'border-amber-400',
          text: 'text-amber-950',
          iconColor: 'text-amber-700',
          glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]',
          Icon: Star
        };
      case 'silver':
        return {
          bg: 'bg-gradient-to-br from-gray-200 via-gray-100 to-gray-400',
          border: 'border-gray-400',
          text: 'text-gray-900',
          iconColor: 'text-gray-600',
          glow: 'shadow-[0_0_15px_rgba(156,163,175,0.5)]',
          Icon: Shield
        };
      case 'bronze':
      default:
        return {
          bg: 'bg-gradient-to-br from-orange-300 via-orange-200 to-orange-500',
          border: 'border-orange-400',
          text: 'text-orange-950',
          iconColor: 'text-orange-800',
          glow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]',
          Icon: Medal
        };
    }
  };

  if (loading) {
    return <div className="animate-pulse h-24 bg-white/40 rounded-2xl w-full"></div>;
  }

  if (badges.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <Award className="w-8 h-8 text-orange-900/30 mx-auto mb-3" />
        <p className="text-orange-900/70 text-sm font-medium">No badges earned yet. Take skill assessments to earn them!</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="font-bold text-orange-950 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-orange-500" />
        Achievements ({badges.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.map((badge, idx) => {
          const config = getTierConfig(badge.tier);
          const Icon = config.Icon;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`relative flex flex-col items-center p-4 rounded-2xl ${config.bg} border ${config.border} ${config.glow} transition-all duration-300 group`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="p-3 bg-white/30 rounded-full mb-3 backdrop-blur-sm border border-white/40">
                <Icon className={`w-8 h-8 ${config.iconColor}`} />
              </div>
              <h4 className={`font-extrabold text-sm text-center ${config.text} leading-tight`}>
                {badge.name}
              </h4>
              <p className={`text-[10px] mt-1 font-semibold ${config.iconColor} uppercase tracking-wider text-center opacity-80`}>
                {badge.tier}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';

export interface Contributor {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarUrl?: string;
  isLead?: boolean;
  department: string;
}

interface ContributorCardProps {
  contributor: Contributor;
}

export default function ContributorCard({ contributor }: ContributorCardProps) {
  const avatar = contributor.avatarUrl || null;

  return (
    <div
      className={`relative group rounded-2xl p-6 transition-all duration-300 backdrop-blur-md border ${
        contributor.isLead
          ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/60 shadow-[0_8px_30px_rgba(245,158,11,0.12)] hover:border-amber-500 hover:shadow-[0_12px_35px_rgba(245,158,11,0.2)]'
          : 'bg-white/90 dark:bg-[var(--card-bg)]/80 border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-amber-500/30'
      }`}
    >
      {/* Top right tag */}
      {contributor.isLead && (
        <div className="flex justify-end items-start mb-4">
          <span className="text-[11px] font-extrabold tracking-widest text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            LEAD
          </span>
        </div>
      )}

      {/* Avatar Container */}
      <div className="mb-5 relative inline-block">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500/20 shadow-inner bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          {avatar ? (
            <Image
              src={avatar}
              alt={contributor.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <UserIcon className="w-10 h-10 text-stone-400 dark:text-stone-500" />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-1.5">
        <h3 className="font-extrabold text-lg text-[var(--text-primary)] tracking-tight leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {contributor.name}
        </h3>
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide">
          {contributor.role}
        </p>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)] pt-1 font-medium">
          {contributor.description}
        </p>
      </div>
    </div>
  );
}

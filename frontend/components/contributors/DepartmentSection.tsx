'use client';

import React from 'react';
import ContributorCard, { Contributor } from './ContributorCard';

interface DepartmentSectionProps {
  id: string;
  badge: string;
  name: string;
  leader: Contributor;
  members: Contributor[];
  badgeBgColor?: string;
  badgeTextColor?: string;
}

export default function DepartmentSection({
  id,
  badge,
  name,
  leader,
  members,
  badgeBgColor = 'bg-blue-100 dark:bg-blue-950/60',
  badgeTextColor = 'text-blue-600 dark:text-blue-400',
}: DepartmentSectionProps) {
  const totalContributors = (leader ? 1 : 0) + members.length;

  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      {/* Department Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-black tracking-wide ${badgeBgColor} ${badgeTextColor} shadow-sm border border-blue-500/20`}
          >
            {badge}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] font-display">
            {name}
          </h2>
        </div>
        <span className="text-xs font-semibold text-[var(--text-secondary)] opacity-80 tracking-wide">
          {totalContributors} contributor{totalContributors !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards Layout Grid (Leader on Left, Members on Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Leader Card */}
        {leader && (
          <div className="md:col-span-4 lg:col-span-5 h-full">
            <ContributorCard contributor={leader} />
          </div>
        )}

        {/* Right Column: Member Cards */}
        <div className={`space-y-6 ${leader ? 'md:col-span-8 lg:col-span-7' : 'md:col-span-12'}`}>
          {members.map((member) => (
            <ContributorCard key={member.id} contributor={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

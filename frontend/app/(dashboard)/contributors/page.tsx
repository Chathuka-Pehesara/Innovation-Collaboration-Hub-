'use client';

import React, { useState } from 'react';
import DepartmentSection from '@/components/contributors/DepartmentSection';
import { Contributor } from '@/components/contributors/ContributorCard';

interface DepartmentData {
  id: string;
  badge: string;
  name: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  leader: Contributor;
  members: Contributor[];
}

export default function ContributorsPage() {
  const [selectedDept, setSelectedDept] = useState<string>('it-department');

  // IT Department Data matching user provided mockup Image 2
  const itDepartment: DepartmentData = {
    id: 'it-department',
    badge: 'IT',
    name: 'IT Department',
    badgeBgColor: 'bg-blue-100 dark:bg-blue-950/70',
    badgeTextColor: 'text-blue-600 dark:text-blue-400',
    leader: {
      id: 'it-lead',
      name: 'Chamodya Devindi',
      role: 'IT Department Lead',
      description: 'The IT Department Lead is responsible for the smooth day-to-day operations of the IT department. They ensure that all systems and infrastructure are reliable, secure, and aligned with the overall goals of the Innovation Collaboration Hub. This role requires strong technical leadership and coordination skills to support the hub’s initiatives.',
      isLead: true,
      department: 'IT Department',
    },
    members: [
      {
        id: 'it-member-1',
        name: 'Nimesha Sewwandi',
        role: 'Systems Administrator',
        description: 'Manages user accounts, servers, and internal systems across the hub, ensuring uptime and smooth day-to-day IT operations.',
        department: 'IT Department',
      },
      {
        id: 'it-member-2',
        name: 'Santhusha Ravindu Herath',
        role: 'Support Engineer',
        description: 'Handles technical support requests and troubleshooting for hub members, resolving issues quickly to keep everyone productive.',
        department: 'IT Department',
      },
      {
        id: 'it-member-3',
        name: 'Vinuji Bandaranayake',
        role: 'Infrastructure Engineer',
        description: 'Maintains and improves the hubs servers, networked systems, and infrastructure, planning upgrades to support future growth.',
        department: 'IT Department',
      },
    ],
  };

  const pillDepartments = [
    { id: 'it-department', name: 'IT Department' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16 pt-2">
      {/* Header Banner matching Image 1 */}
      <div className="space-y-6">
        {/* Top Tag line */}
        <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-amber-600 dark:text-amber-500 uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-500 inline-block animate-pulse" />
          INNOVATION COLLABORATION HUB — CONTRIBUTORS
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] font-display tracking-tight leading-none">
          The people <br className="hidden md:inline" />
          behind the hub.
        </h1>

        {/* Subtitle / Instructions */}
        <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium max-w-3xl leading-relaxed">
          Every department is led by one person and built by many — meet the people designing, securing, and running the Innovation Collaboration Hub.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {pillDepartments.map((dept) => {
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center gap-2 border shadow-sm ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-600 shadow-amber-600/20 shadow-md scale-105'
                    : 'bg-white/80 dark:bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-color)] hover:border-amber-500/40 hover:bg-amber-500/5'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {dept.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* IT Department Section (only IT department displayed currently) */}
      <div className="space-y-16 pt-4">
        <DepartmentSection
          id={itDepartment.id}
          badge={itDepartment.badge}
          name={itDepartment.name}
          badgeBgColor={itDepartment.badgeBgColor}
          badgeTextColor={itDepartment.badgeTextColor}
          leader={itDepartment.leader}
          members={itDepartment.members}
        />
      </div>
    </div>
  );
}

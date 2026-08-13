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
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // IT Department Data
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

  // AI & Data Science Department Data
  const aidsDepartment: DepartmentData = {
    id: 'aids-department',
    badge: 'AI/DS',
    name: 'AI & Data Science Department',
    badgeBgColor: 'bg-purple-100 dark:bg-purple-950/70',
    badgeTextColor: 'text-purple-600 dark:text-purple-400',
    leader: {
      id: 'aids-lead',
      name: 'Chathuka Pahasara',
      role: 'AI & Data Science Lead',
      description: 'Leads artificial intelligence research, machine learning integration, and data science strategy across the Innovation Collaboration Hub.',
      isLead: true,
      department: 'AI & Data Science Department',
    },
    members: [
      {
        id: 'aids-member-1',
        name: 'Adipa Udayanga',
        role: 'Machine Learning Engineer',
        description: 'Develops predictive models and recommendation algorithms for skill compatibility and team matching.',
        department: 'AI & Data Science Department',
      },
      {
        id: 'aids-member-2',
        name: 'Archana Panchali',
        role: 'Data Engineer',
        description: 'Builds scalable data pipelines, manages datasets, and ensures seamless data access for analytical models.',
        department: 'AI & Data Science Department',
      },
      {
        id: 'aids-member-3',
        name: 'Dinithi Yasasvi',
        role: 'AI Research Associate',
        description: 'Researches emerging AI frameworks and assists in integrating generative AI tools into hub workflows.',
        department: 'AI & Data Science Department',
      },
    ],
  };

  // Cyber Security Department Data
  const cyberDepartment: DepartmentData = {
    id: 'cyber-department',
    badge: 'Cyber Security',
    name: 'Cyber Security Department',
    badgeBgColor: 'bg-emerald-100 dark:bg-emerald-950/70',
    badgeTextColor: 'text-emerald-600 dark:text-emerald-400',
    leader: {
      id: 'cyber-lead',
      name: 'Vikum',
      role: 'Cyber Security Department Lead',
      description: 'Oversees threat modeling, application security audits, vulnerability assessments, and compliance standards across all hub systems.',
      isLead: true,
      department: 'Cyber Security Department',
    },
    members: [],
  };

  // Network Department Data
  const networkDepartment: DepartmentData = {
    id: 'network-department',
    badge: 'Network',
    name: 'Network Department',
    badgeBgColor: 'bg-cyan-100 dark:bg-cyan-950/70',
    badgeTextColor: 'text-cyan-600 dark:text-cyan-400',
    leader: {
      id: 'network-lead',
      name: 'Add Leader Name',
      role: 'Network Department Lead',
      description: 'Leads network architecture, routing protocols, firewall management, and connectivity infrastructure across the Innovation Collaboration Hub.',
      isLead: true,
      department: 'Network Department',
    },
    members: [
      {
        id: 'network-member-1',
        name: 'Kushan Dewmina',
        role: 'Network Engineer',
        description: 'Manages physical and virtual network switches, routers, and VPN gateways to guarantee high availability and throughput.',
        department: 'Network Department',
      },
    ],
  };

  const departments: DepartmentData[] = [itDepartment, aidsDepartment, cyberDepartment, networkDepartment];

  const pillDepartments = [
    { id: 'all', name: 'All Departments' },
    { id: 'it-department', name: 'IT Department' },
    { id: 'aids-department', name: 'AI & Data Science' },
    { id: 'cyber-department', name: 'Cyber Security' },
    { id: 'network-department', name: 'Network Department' },
  ];

  const filteredDepartments = selectedDept === 'all'
    ? departments
    : departments.filter((d) => d.id === selectedDept);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16 pt-2">
      {/* Header Banner */}
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

      {/* Department Sections */}
      <div className="space-y-16 pt-4">
        {filteredDepartments.map((dept) => (
          <DepartmentSection
            key={dept.id}
            id={dept.id}
            badge={dept.badge}
            name={dept.name}
            badgeBgColor={dept.badgeBgColor}
            badgeTextColor={dept.badgeTextColor}
            leader={dept.leader}
            members={dept.members}
          />
        ))}
      </div>
    </div>
  );
}

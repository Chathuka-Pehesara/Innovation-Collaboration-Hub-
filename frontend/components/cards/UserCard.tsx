/**
 * @file        StudentCard.tsx
 * @owner       IT Team
 * @description Directory card showing a student's name, specialization, top skills, availability, and XP.
 *              Links to the public profile page.
 */

'use client';

import Link from 'next/link';
import { StudentCard as StudentCardType } from '@/lib/profileApi';
import { AvatarWithFallback } from './AvatarWithFallback';
import { SkillBadge } from './SkillBadge';

interface Props {
  student: StudentCardType;
}

const SPEC_COLORS: Record<string, string> = {
  AI: 'text-violet-400',
  IT: 'text-blue-400',
  Cybersecurity: 'text-red-400',
  Networking: 'text-emerald-400',
};

export function StudentCard({ student }: Props) {
  const specColor = SPEC_COLORS[student.specialization ?? ''] ?? 'text-gray-400';

  return (
    <Link
      href={`/profile/${student.id}`}
      className="group bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3
                 hover:border-indigo-500/40 hover:bg-white/[0.07] transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <AvatarWithFallback src={student.avatarUrl} name={student.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {student.name}
          </p>
          {student.specialization && (
            <p className={`text-xs font-medium ${specColor}`}>{student.specialization}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-amber-400 font-medium">Lv {student.level}</span>
      </div>

      {/* Bio snippet */}
      {student.bio && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{student.bio}</p>
      )}

      {/* Skills */}
      {student.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {student.skills.slice(0, 4).map((skill) => (
            <SkillBadge key={skill.id} name={skill.name} level={skill.level} />
          ))}
          {student.skills.length > 4 && (
            <span className="text-xs text-gray-600 px-2 py-1">+{student.skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-white/5">
        <span>{student.availableHours > 0 ? `${student.availableHours} hrs/wk` : 'Unavailable'}</span>
        <span className="text-amber-500/80">⚡ {student.xp.toLocaleString()} XP</span>
      </div>
    </Link>
  );
}

/**
 * @file        StudentSearchPage.tsx
 * @owner       IT Team
 * @description Student search page - find students by name or skill
 * @depends     React, Next.js, profileApi
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { searchStudents, Student } from '@/lib/api/profileApi';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

export default function StudentSearchPage() {
  const [query, setQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });

  const handleSearch = useCallback(async (page = 1) => {
    if (!query.trim() && !skillFilter.trim()) {
      setStudents([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await searchStudents(query, skillFilter, page, 12);
      setStudents(result.students);
      setPagination(result.pagination);
    } catch (err) {
      setError('Failed to search students');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, skillFilter]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(1);
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header and Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Find Students</h1>
        <p className="text-gray-400 text-sm">Search for students by name or skill to find collaboration partners</p>
      </div>

      {/* Search Filter Section */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Name Search */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Student Name</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by name..."
              className="w-full glass-input px-4 py-2.5 text-sm"
            />
          </div>

          {/* Skill Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Skill Filter</label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full glass-input px-4 py-2.5 text-sm cursor-pointer"
            >
              <option value="" className="bg-card text-textPrimary">All Skills</option>
              <option value="React" className="bg-card text-textPrimary">React</option>
              <option value="Node.js" className="bg-card text-textPrimary">Node.js</option>
              <option value="TypeScript" className="bg-card text-textPrimary">TypeScript</option>
              <option value="Python" className="bg-card text-textPrimary">Python</option>
              <option value="JavaScript" className="bg-card text-textPrimary">JavaScript</option>
              <option value="Java" className="bg-card text-textPrimary">Java</option>
              <option value="SQL" className="bg-card text-textPrimary">SQL</option>
              <option value="MongoDB" className="bg-card text-textPrimary">MongoDB</option>
              <option value="AWS" className="bg-card text-textPrimary">AWS</option>
              <option value="Docker" className="bg-card text-textPrimary">Docker</option>
              <option value="Machine Learning" className="bg-card text-textPrimary">Machine Learning</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => handleSearch(1)}
          disabled={isLoading || (!query.trim() && !skillFilter.trim())}
          className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results Section */}
      {error && <EmptyState message={error} />}

      {isLoading && <LoadingSkeleton />}

      {!isLoading && students.length === 0 && (query || skillFilter) && (
        <EmptyState message="No students found. Try different search criteria." />
      )}

      {!isLoading && students.length > 0 && (
        <div className="space-y-4">
          <div className="text-gray-400 text-sm">
            Found <strong className="text-white">{pagination.total}</strong> student{pagination.total !== 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="glass-card overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Banner */}
                  <div className="h-20 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                    {student.avatarUrl && (
                      <div className="absolute -bottom-6 left-4 shadow-lg">
                        <Image
                          src={student.avatarUrl}
                          alt={student.name}
                          width={56}
                          height={56}
                          className="rounded-xl border-4 border-[#131622] dark:border-[#131622] object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-10 p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-white leading-tight">{student.name}</h3>
                      <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">{student.specialization || 'Student'}</p>
                    </div>

                    {student.bio && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {student.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                        <p className="font-bold text-indigo-400 text-base">{student.xp}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">XP</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                        <p className="font-bold text-emerald-400 text-base">{student.availableHours}h</p>
                        <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">Hours / Wk</p>
                      </div>
                    </div>

                    {/* Skills */}
                    {student.skills && student.skills.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Top Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill.id}
                              className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded-full font-medium"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="text-[10px] text-gray-400 self-center ml-1">
                              +{student.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/profile/${student.id}`}
                    className="btn-primary w-full py-2 text-xs font-semibold text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handleSearch(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="btn-secondary px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                  const page = pagination.page + i - 2;
                  if (page < 1 || page > pagination.totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => handleSearch(page)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                        page === pagination.page
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handleSearch(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {!isLoading && students.length === 0 && !query && !skillFilter && (
        <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl">
          <p className="text-gray-400 text-sm">Use the search filters above to find students</p>
        </div>
      )}
    </div>
  );
}

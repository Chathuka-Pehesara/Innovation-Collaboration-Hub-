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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Students</h1>
          <p className="text-slate-600">Search for students by name or skill to find collaboration partners</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Name Search */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Student Name</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by name..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Skill Filter</label>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Skills</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Java">Java</option>
                <option value="SQL">SQL</option>
                <option value="MongoDB">MongoDB</option>
                <option value="AWS">AWS</option>
                <option value="Docker">Docker</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSearch(1)}
            disabled={isLoading || (!query.trim() && !skillFilter.trim())}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results */}
        {error && <EmptyState message={error} />}

        {isLoading && <LoadingSkeleton />}

        {!isLoading && students.length === 0 && (query || skillFilter) && (
          <EmptyState message="No students found. Try different search criteria." />
        )}

        {!isLoading && students.length > 0 && (
          <div className="space-y-4">
            {/* Results Count */}
            <div className="text-slate-600 text-sm">
              Found <strong>{pagination.total}</strong> student{pagination.total !== 1 ? 's' : ''}
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* Header */}
                  <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                    {student.avatarUrl && (
                      <div className="absolute -bottom-6 left-4">
                        <Image
                          src={student.avatarUrl}
                          alt={student.name}
                          width={64}
                          height={64}
                          className="rounded-lg border-4 border-white object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-12 p-4">
                    <h3 className="font-bold text-slate-900">{student.name}</h3>
                    <p className="text-sm text-blue-600">{student.specialization}</p>

                    {student.bio && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{student.bio}</p>}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-center text-sm">
                      <div className="bg-blue-50 rounded p-2">
                        <p className="font-bold text-blue-600">{student.xp}</p>
                        <p className="text-xs text-slate-600">XP</p>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <p className="font-bold text-green-600">{student.availableHours}h</p>
                        <p className="text-xs text-slate-600">Hours</p>
                      </div>
                    </div>

                    {/* Skills */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-slate-600 mb-2">Top Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill.id}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="text-xs text-slate-600 px-2 py-1">
                              +{student.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Link
                      href={`/profile/${student.id}`}
                      className="block mt-4 text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
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
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                    const page = pagination.page + i - 2;
                    if (page < 1 || page > pagination.totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => handleSearch(page)}
                        className={`px-4 py-2 rounded-lg transition ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-300 hover:bg-slate-50'
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
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {!isLoading && students.length === 0 && !query && !skillFilter && (
          <div className="text-center py-12">
            <p className="text-slate-600">Use the search filters above to find students</p>
          </div>
        )}
      </div>
    </div>
  );
}

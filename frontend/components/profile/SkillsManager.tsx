/**
 * @file        SkillsManager.tsx
 * @owner       IT Team
 * @description Skills manager component - add, edit, and remove skills with proficiency levels
 * @depends     React, profileApi
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Skill, getProfileSkills, removeSkill } from '@/lib/api/profileApi';
import Toast from '@/components/Toast';
import QuizModal from './QuizModal';

interface SkillsManagerProps {
  userId: string;
  onSkillsUpdate?: (skills: Skill[]) => void;
}

export default function SkillsManager({ userId, onSkillsUpdate }: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    'Beginner'
  );
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Common skills list for autocomplete
  const commonSkills = [
    'React',
    'Node.js',
    'TypeScript',
    'Python',
    'JavaScript',
    'Java',
    'SQL',
    'MongoDB',
    'Firebase',
    'AWS',
    'Docker',
    'Git',
    'GraphQL',
    'REST API',
    'UI/UX Design',
    'Machine Learning',
    'Data Science',
  ];

  useEffect(() => {
    fetchSkills();
  }, [userId]);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const data = await getProfileSkills(userId);
      setSkills(data);
    } catch (error) {
      setToast({ message: 'Failed to fetch skills', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillNameChange = (value: string) => {
    setSkillName(value);
    if (value.length > 0) {
      const filtered = commonSkills.filter(
        (skill) => skill.toLowerCase().includes(value.toLowerCase()) && !skills.find((s) => s.name === skill)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSkillName(suggestion);
    setShowSuggestions(false);
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skillName.trim()) {
      setToast({ message: 'Please enter a skill name', type: 'error' });
      return;
    }

    // Check for duplicates
    if (skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setToast({ message: 'This skill is already added', type: 'error' });
      return;
    }

    setIsQuizOpen(true);
  };

  const handleQuizSuccess = (skill: any, score: number) => {
    setIsQuizOpen(false);
    
    // We get back the skill object from the backend
    const newSkill = {
      id: skill.id,
      name: skill.name,
      level: 'Beginner', // Will be upgraded later based on score
      score: score * 10
    };
    
    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);
    setSkillName('');
    setSuggestions([]);
    setShowSuggestions(false);
    setToast({ message: `Skill added successfully! You scored ${score}/5.`, type: 'success' });
    onSkillsUpdate?.(updatedSkills);
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await removeSkill(userId, skillId);
      const updatedSkills = skills.filter((s) => s.id !== skillId);
      setSkills(updatedSkills);
      setToast({ message: 'Skill removed', type: 'success' });
      onSkillsUpdate?.(updatedSkills);
    } catch (error) {
      setToast({ message: 'Failed to remove skill', type: 'error' });
      console.error(error);
    }
  };

  if (isLoading)
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-12 bg-slate-200 rounded"></div>
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-xl font-bold text-slate-900 mb-6">Skills</h2>

      {/* Add Skill Form */}
      <form onSubmit={handleAddSkill} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="space-y-4">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Skill Name</label>
            <div className="relative">
              <input
                type="text"
                value={skillName}
                onChange={(e) => handleSkillNameChange(e.target.value)}
                placeholder="Search or type a skill..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition border-b border-slate-100 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Button */}
          <button
            type="submit"
            disabled={!skillName.trim()}
            className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:bg-slate-400"
          >
            Take Skill Assessment
          </button>
        </div>
      </form>

      {/* Skills List */}
      {skills.length > 0 ? (
        <div className="space-y-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div>
                <p className="font-medium text-slate-900">{skill.name}</p>
                <p className="text-xs text-slate-600">Score: <span className="font-bold">{skill.score ?? 0} XP</span></p>
              </div>
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                className="text-red-600 hover:text-red-700 transition"
                title="Remove skill"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-600">
          <p>No skills added yet. Add your first skill to get started!</p>
        </div>
      )}

      <div className="mt-4 text-sm text-slate-600">
        <p>💡 Tip: You must pass the AI assessment to add a skill to your profile.</p>
      </div>

      {isQuizOpen && (
        <QuizModal 
          skillName={skillName.trim()} 
          onClose={() => setIsQuizOpen(false)} 
          onSuccess={handleQuizSuccess} 
        />
      )}
    </div>
  );
}

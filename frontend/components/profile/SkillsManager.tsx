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
import { SkillBadge } from './SkillBadge';

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
  const [showSupportedSkills, setShowSupportedSkills] = useState(false);

  // Common skills list for autocomplete
  const commonSkills = [
    'React', 'Node.js', 'TypeScript', 'Python', 'JavaScript', 'Java',
    'SQL', 'MongoDB', 'Firebase', 'AWS', 'Docker', 'Git', 'GitHub',
    'GraphQL', 'HTML', 'CSS'
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
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-orange-200/50 p-6 shadow-sm">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-xl font-bold text-orange-950 mb-6">Skills</h2>

      {/* Add Skill Form */}
      <form onSubmit={handleAddSkill} className="mb-6 p-5 bg-gradient-to-br from-orange-50/80 to-amber-50/80 rounded-xl border border-orange-200/60 shadow-inner">
        <div className="space-y-4">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-bold text-orange-950 mb-1">Skill Name</label>
            <div className="relative">
              <input
                type="text"
                value={skillName}
                onChange={(e) => handleSkillNameChange(e.target.value)}
                placeholder="Search or type a skill..."
                className="w-full px-4 py-2 bg-white/80 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-950 font-medium placeholder-orange-900/30 shadow-sm transition-shadow"
              />

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-orange-200/60 rounded-xl shadow-xl z-10 overflow-hidden">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-orange-100/50 text-orange-950 font-medium transition border-b border-orange-100 last:border-b-0"
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
            className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            Take Skill Assessment
          </button>
        </div>
      </form>

      {/* Tiers Legend Showcase */}
      <div className="mb-6 p-4 rounded-xl border border-orange-200 bg-orange-50/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-orange-950">Skill Tiers Showcase (Max 100 XP)</h3>
          <button 
            onClick={() => setShowSupportedSkills(!showSupportedSkills)}
            className="text-xs bg-orange-200/50 hover:bg-orange-200 text-orange-900 px-3 py-1.5 rounded-lg font-medium transition"
          >
            {showSupportedSkills ? 'Hide Supported Skills' : 'View Supported Skills'}
          </button>
        </div>
        
        {showSupportedSkills ? (
          <div className="flex flex-wrap gap-4 mt-4 p-4 bg-white/40 rounded-lg border border-orange-100">
            {commonSkills.map(s => (
              <SkillBadge key={s} name={s} score={0} />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            <SkillBadge name="Platinum Tier" score={100} />
            <SkillBadge name="Gold Tier" score={75} />
            <SkillBadge name="Silver Tier" score={50} />
            <SkillBadge name="Bronze Tier" score={25} />
            <SkillBadge name="Novice" score={0} />
          </div>
        )}
      </div>

      {/* Skills List */}
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className="relative group">
              <SkillBadge name={skill.name} score={skill.score} />
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                title="Remove skill"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="text-center py-8 text-orange-900/60 font-medium bg-orange-50/30 rounded-xl border border-dashed border-orange-200">
          <p>No skills added yet. Add your first skill to get started!</p>
        </div>
      )}

      <div className="mt-6 text-sm text-orange-800 font-medium bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
        <p>💡 Tip: Pass AI assessments to upgrade your skill tier! Each passed test grants up to 50 XP.</p>
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

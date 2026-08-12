import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api';
import { generateDescriptionApi, refineDescriptionApi } from '@/lib/api/aiApi';
import TagInput from './TagInput';

export interface ProjectInitialData {
  title?: string;
  description?: string;
  categoryId?: string;
  status?: string;
  teamSize?: number;
  tags?: Array<{ tag: { name: string } }>;
  skills?: Array<{ skill: { name: string } }>;
}

export interface ProjectFormData {
  title: string;
  description: string;
  categoryId: string | null;
  status: string;
  teamSize: number;
  tags: string[];
  skills: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProjectFormProps {
  initialData?: ProjectInitialData;
  onSubmit: (data: ProjectFormData) => void;
  isSubmitting: boolean;
}

export default function ProjectForm({ initialData = {}, onSubmit, isSubmitting }: ProjectFormProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '');
  const [status, setStatus] = useState(initialData.status || 'Draft');
  const [teamSize, setTeamSize] = useState(initialData.teamSize || 1);
  const [tagsInput, setTagsInput] = useState<string[]>(
    initialData.tags ? initialData.tags.map((t) => t.tag.name) : []
  );
  const [skillsInput, setSkillsInput] = useState<string[]>(
    initialData.skills ? initialData.skills.map((s) => s.skill.name) : []
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  
  // AI assistant loading states
  const [aiDrafting, setAiDrafting] = useState(false);
  const [aiRefining, setAiRefining] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // AI Assistant: Generate Description
  const handleAIDraft = async () => {
    if (!title.trim()) {
      setErrors(prev => ({ ...prev, title: 'Title is required to draft with AI.' }));
      return;
    }
    try {
      setAiDrafting(true);
      setAiMessage(null);
      const res = await generateDescriptionApi({
        title,
        keywords: tagsInput.length > 0 ? tagsInput : ['development', 'innovation'],
        template: 'standard'
      });
      setDescription(res.description);
      // Auto-populate suggested skills if any
      if (res.suggested_skills && res.suggested_skills.length > 0) {
        setSkillsInput(prev => Array.from(new Set([...prev, ...res.suggested_skills])));
      }
      setAiMessage('✨ AI description drafted successfully!');
    } catch (err) {
      console.error(err);
      setAiMessage('❌ Failed to generate AI draft.');
    } finally {
      setAiDrafting(false);
    }
  };

  // AI Assistant: Refine Description
  const handleAIRefine = async () => {
    if (description.trim().length < 10) {
      setErrors(prev => ({ ...prev, description: 'Write a basic concept first (min 10 chars).' }));
      return;
    }
    try {
      setAiRefining(true);
      setAiMessage(null);
      const res = await refineDescriptionApi(title || 'Project Idea', description, 'clarity');
      setDescription(res.refined_description);
      setAiMessage('✨ AI description refined successfully!');
    } catch (err) {
      console.error(err);
      setAiMessage('❌ Failed to refine description.');
    } finally {
      setAiRefining(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors: FormErrors = {};
    if (title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters long.';
    if (description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters long.';
    if (!categoryId) newErrors.categoryId = 'Please select a category.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    onSubmit({
      title,
      description,
      categoryId: categoryId || null,
      status,
      teamSize,
      tags: tagsInput,
      skills: skillsInput
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Project Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({...prev, title: ''})); }}
          className={`w-full glass-input px-4 py-2 ${errors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="E.g., AI-Powered Campus Map"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAIDraft}
              disabled={aiDrafting || aiRefining}
              className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-400 font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors disabled:opacity-40"
            >
              {aiDrafting ? '🪄 Drafting...' : '🪄 AI Draft'}
            </button>
            <button
              type="button"
              onClick={handleAIRefine}
              disabled={aiDrafting || aiRefining}
              className="text-[10px] bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 text-purple-400 font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors disabled:opacity-40"
            >
              {aiRefining ? '✨ Refining...' : '✨ AI Refine'}
            </button>
          </div>
        </div>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({...prev, description: ''})); }}
          className={`w-full glass-input px-4 py-2 resize-none ${errors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="Describe your project idea in detail..."
        />
        {aiMessage && (
          <p className={`text-[10px] mt-1 font-medium ${aiMessage.includes('❌') ? 'text-rose-400' : 'text-emerald-400'}`}>
            {aiMessage}
          </p>
        )}
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-red-500 text-xs">{errors.description}</p>
          ) : (
            <p className="text-gray-400 text-xs">Minimum 20 characters.</p>
          )}
          <p className={`text-xs ${description.length < 20 ? 'text-amber-500' : 'text-gray-400'}`}>
            {description.length} chars
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setErrors(prev => ({...prev, categoryId: ''})); }}
            className={`w-full glass-input px-4 py-2 ${errors.categoryId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          >
            <option value="" className="bg-[#1C1F2E]">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#1C1F2E]">{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full glass-input px-4 py-2"
          >
            <option value="Draft" className="bg-[#1C1F2E]">Draft</option>
            <option value="Open" className="bg-[#1C1F2E]">Open</option>
            <option value="In Progress" className="bg-[#1C1F2E]">In Progress</option>
            <option value="Completed" className="bg-[#1C1F2E]">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Team Size</label>
          <input
            required
            type="number"
            min="1"
            value={teamSize}
            onChange={(e) => setTeamSize(parseInt(e.target.value))}
            className="w-full glass-input px-4 py-2"
            placeholder="e.g., 4"
          />
        </div>

        <div className="mt-1">
          <TagInput 
            label="Tags"
            tags={tagsInput} 
            onChange={setTagsInput} 
            placeholder="React, AI, Sustainability..." 
          />
        </div>
      </div>

      <div className="mt-1">
        <TagInput 
          label="Required Skills"
          tags={skillsInput} 
          onChange={setSkillsInput} 
          placeholder="Frontend, Python, UI Design..." 
        />
      </div>

      <div className="pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3 btn-primary disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  );
}

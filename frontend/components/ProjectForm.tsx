import { useState, useEffect } from 'react';
import { getCategories } from '../services/api';
import TagInput from './TagInput';

export default function ProjectForm({ initialData = {}, onSubmit, isSubmitting }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '');
  const [status, setStatus] = useState(initialData.status || 'Draft');
  const [teamSize, setTeamSize] = useState(initialData.teamSize || 1);
  const [tagsInput, setTagsInput] = useState(
    initialData.tags ? initialData.tags.map(t => t.tag.name) : []
  );
  const [skillsInput, setSkillsInput] = useState(
    initialData.skills ? initialData.skills.map(s => s.skill.name) : []
  );
  const [errors, setErrors] = useState({});
  
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors = {};
    if (title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters long.';
    if (description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters long.';
    if (!categoryId) newErrors.categoryId = 'Please select a category.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop submission without clearing the form
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({...prev, description: ''})); }}
          className={`w-full glass-input px-4 py-2 resize-none ${errors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="Describe your project idea in detail..."
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-red-500 text-xs">{errors.description}</p>
          ) : (
            <p className="text-slate-500 text-xs">Minimum 20 characters.</p>
          )}
          <p className={`text-xs ${description.length < 20 ? 'text-amber-500' : 'text-slate-500'}`}>
            {description.length} chars
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setErrors(prev => ({...prev, categoryId: ''})); }}
            className={`w-full glass-input px-4 py-2 ${errors.categoryId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full glass-input px-4 py-2"
          >
            <option value="Draft">Draft</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Team Size</label>
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

      <div className="pt-4 border-t border-slate-200">
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

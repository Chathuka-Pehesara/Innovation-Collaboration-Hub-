/**
 * @file        PortfolioManager.tsx
 * @owner       IT Team
 * @description Portfolio manager - add, edit, and remove portfolio items
 * @depends     React, profileApi, Image
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  PortfolioItem,
  getPortfolio,
  addPortfolioItem,
  removePortfolioItem,
  analyzePortfolioProject,
  submitPortfolioProject,
} from '@/lib/api/profileApi';
import Toast from '@/components/Toast';
import ProjectQuizModal from './ProjectQuizModal';
import { Github, Loader2 } from 'lucide-react';

interface PortfolioManagerProps {
  userId: string;
  onItemsUpdate?: (items: PortfolioItem[]) => void;
}

export default function PortfolioManager({ userId, onItemsUpdate }: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    tags: [] as string[],
    tagInput: '',
  });

  useEffect(() => {
    fetchPortfolio();
  }, [userId]);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const data = await getPortfolio(userId);
      setItems(data);
    } catch (error) {
      setToast({ message: 'Failed to fetch portfolio', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && formData.tags.length < 10) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setToast({ message: 'Please enter a project title', type: 'error' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzePortfolioProject(userId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
      });
      
      if (analysis.validationQuiz && analysis.validationQuiz.length > 0) {
        setExtractedSkills(analysis.extractedSkills);
        setQuizQuestions(analysis.validationQuiz);
      } else {
        // No skills detected, just submit immediately
        await submitProject([]);
      }
    } catch (error) {
      setToast({ message: 'Failed to analyze project', type: 'error' });
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitProject = async (answers: number[]) => {
    setIsAdding(true);
    try {
      const result = await submitPortfolioProject(userId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        imageUrl: formData.imageUrl.trim(),
        tags: formData.tags,
        answers,
        extractedSkills
      });

      setItems([result.item, ...items]);
      onItemsUpdate?.([result.item, ...items]);
      setToast({ message: 'Portfolio item added! ' + (result.badgesEarned?.length > 0 ? 'You earned new badges!' : ''), type: 'success' });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        url: '',
        imageUrl: '',
        tags: [],
        tagInput: '',
      });
      setQuizQuestions([]);
      setExtractedSkills([]);
      return { passed: true, badgesEarned: result.badgesEarned || [] };
    } catch (error) {
      setToast({ message: 'Failed to submit portfolio item', type: 'error' });
      console.error(error);
      return { passed: false, badgesEarned: [] };
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this portfolio item?')) return;

    try {
      await removePortfolioItem(userId, itemId);
      const updated = items.filter((item) => item.id !== itemId);
      setItems(updated);
      onItemsUpdate?.(updated);
      setToast({ message: 'Portfolio item removed', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to remove item', type: 'error' });
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

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-orange-950">Portfolio</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-700 transition-all"
        >
          {showForm ? 'Cancel' : '+ Add Project'}
        </button>
      </div>

      {/* Add Project Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gradient-to-br from-orange-50/80 to-amber-50/80 rounded-2xl border border-orange-200/60 shadow-inner space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-orange-950 mb-1">Project Title*</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              className="w-full px-4 py-2 bg-white/80 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-950 font-medium placeholder-orange-900/30 shadow-sm transition-shadow"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-orange-950 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project..."
              rows={3}
              className="w-full px-4 py-2 bg-white/80 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-950 font-medium placeholder-orange-900/30 shadow-sm transition-shadow"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-bold text-orange-950 mb-1">Project URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-white/80 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-950 font-medium placeholder-orange-900/30 shadow-sm transition-shadow"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold text-orange-950 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-white/80 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-950 font-medium placeholder-orange-900/30 shadow-sm transition-shadow"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-orange-950 mb-1">Tags</label>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={formData.tagInput}
                onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type and press Enter to add a tag"
                className="flex-1 px-4 py-2 bg-white/80 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-950 font-medium placeholder-orange-900/30 shadow-sm transition-shadow"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold px-5 py-2 rounded-xl transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-orange-500 text-white font-bold px-3 py-1 rounded-lg shadow-sm border border-orange-400">
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isAdding || isAnalyzing || !formData.title.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzing && <Loader2 className="w-5 h-5 animate-spin" />}
              {isAnalyzing ? 'Analyzing Skills...' : isAdding ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      )}

      {/* Portfolio Items List */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/70 backdrop-blur-sm border border-orange-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-900/5 transition-all group"
            >
              {/* Image */}
              {item.imageUrl && (
                <div className="relative w-full h-48 bg-orange-100/50 overflow-hidden">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-950/20 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="p-5 flex flex-col h-full">
                <h3 className="text-xl font-bold text-orange-950 mb-2">{item.title}</h3>
                {item.description && <p className="text-sm text-orange-900/70 font-medium mb-4 flex-grow">{item.description}</p>}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-orange-100/80 text-orange-800 border border-orange-200 font-bold px-2.5 py-1 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-orange-100">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-950 hover:bg-orange-900 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      Repository
                    </a>
                  )}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-orange-900/60 font-medium bg-orange-50/30 rounded-2xl border border-dashed border-orange-200">
          <p>No portfolio items yet. Start by adding your first project!</p>
        </div>
      )}

      {quizQuestions.length > 0 && (
        <ProjectQuizModal 
          questions={quizQuestions} 
          onClose={() => {
            setQuizQuestions([]);
            setIsAdding(false);
          }}
          onSubmit={submitProject}
        />
      )}
    </div>
  );
}

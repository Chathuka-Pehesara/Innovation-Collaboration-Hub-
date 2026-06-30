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
} from '@/lib/api/profileApi';
import Toast from '@/components/Toast';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setToast({ message: 'Please enter a project title', type: 'error' });
      return;
    }

    setIsAdding(true);
    try {
      const newItem = await addPortfolioItem(userId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        imageUrl: formData.imageUrl.trim(),
        tags: formData.tags,
      });

      setItems([newItem, ...items]);
      onItemsUpdate?.([newItem, ...items]);
      setToast({ message: 'Portfolio item added', type: 'success' });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        url: '',
        imageUrl: '',
        tags: [],
        tagInput: '',
      });
    } catch (error) {
      setToast({ message: 'Failed to add portfolio item', type: 'error' });
      console.error(error);
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
    <div className="bg-white rounded-lg shadow-md p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Portfolio</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          {showForm ? 'Cancel' : '+ Add Project'}
        </button>
      </div>

      {/* Add Project Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Project Title*</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Project URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
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
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isAdding || !formData.title.trim()}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400"
          >
            {isAdding ? 'Adding...' : 'Add Project'}
          </button>
        </form>
      )}

      {/* Portfolio Items List */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Image */}
              {item.imageUrl && (
                <div className="relative w-full h-40 bg-slate-100">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                {item.description && <p className="text-sm text-slate-600 mb-2">{item.description}</p>}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 text-sm transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-600">
          <p>No portfolio items yet. Start by adding your first project!</p>
        </div>
      )}
    </div>
  );
}

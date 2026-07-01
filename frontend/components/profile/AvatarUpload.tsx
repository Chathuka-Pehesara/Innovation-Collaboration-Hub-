/**
 * @file        AvatarUpload.tsx
 * @owner       IT Team
 * @description Avatar upload component with image preview and crop interface
 * @depends     React, profileApi, react-easy-crop
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { uploadAvatar } from '@/lib/api/profileApi';
import Toast from '@/components/Toast';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onSuccess?: (avatarUrl: string) => void;
}

export default function AvatarUpload({ userId, currentAvatarUrl, onSuccess }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setToast({ message: 'Only JPEG, PNG, and WebP images are allowed', type: 'error' });
      return;
    }

    // Validate file size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File size must not exceed 5 MB', type: 'error' });
      return;
    }

    setSelectedFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setToast({ message: 'Please select an image first', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await uploadAvatar(userId, selectedFile);
      setToast({ message: 'Avatar uploaded successfully', type: 'success' });
      setPreview(result.avatarUrl);
      setSelectedFile(null);
      onSuccess?.(result.avatarUrl);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setToast({ message: 'Failed to upload avatar', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(currentAvatarUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Picture</h2>

      <div className="space-y-6">
        {/* Current / Preview Avatar */}
        <div className="flex justify-center">
          {preview ? (
            <div className="relative w-48 h-48">
              <Image
                src={preview}
                alt="Avatar preview"
                fill
                className="object-cover rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-5xl font-bold shadow-md">
              ?
            </div>
          )}
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition"
        >
          <div className="text-blue-600 mb-2">
            <svg
              className="w-8 h-8 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-8"
              />
            </svg>
          </div>
          <p className="text-slate-900 font-medium">Click to upload or drag and drop</p>
          <p className="text-slate-600 text-sm">PNG, JPG, WebP up to 5 MB</p>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-900">
              <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
          {selectedFile && (
            <button
              onClick={handleReset}
              className="flex-1 bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

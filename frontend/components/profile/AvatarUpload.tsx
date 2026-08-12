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
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-orange-200/50 p-6 shadow-sm">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-xl font-bold text-orange-950 mb-6">Profile Picture</h2>

      <div className="space-y-6">
        {/* Current / Preview Avatar */}
        <div className="flex justify-center">
          {preview ? (
            <div className="relative w-48 h-48 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <Image
                src={preview}
                alt="Avatar preview"
                fill
                className="relative object-cover rounded-2xl shadow-lg border-2 border-white"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl flex items-center justify-center text-white text-5xl font-black shadow-lg border-4 border-white/60">
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
          className="border-2 border-dashed border-orange-300/60 rounded-2xl p-8 text-center cursor-pointer bg-white/50 hover:bg-orange-50/80 hover:border-orange-400 transition-all shadow-sm"
        >
          <div className="text-orange-500 mb-3 flex justify-center">
            <svg
              className="w-10 h-10"
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
          <p className="text-orange-950 font-bold mb-1">Click to upload or drag and drop</p>
          <p className="text-orange-700/80 text-xs font-semibold">PNG, JPG, WebP up to 5 MB</p>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="bg-orange-50/80 border border-orange-200/60 rounded-xl p-4 shadow-inner">
            <p className="text-sm text-orange-950 font-medium">
              <strong className="font-bold">Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Uploading...' : 'Upload Avatar'}
          </button>
          {selectedFile && (
            <button
              onClick={handleReset}
              className="flex-1 bg-white border border-orange-200 text-orange-900 font-bold py-3 px-4 rounded-xl hover:bg-orange-50 shadow-sm transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

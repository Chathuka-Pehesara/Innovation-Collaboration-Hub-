/**
 * @file        AvailabilitySettings.tsx
 * @owner       IT Team
 * @description Availability settings - set weekly availability and available hours
 * @depends     React, profileApi
 */

'use client';

import React, { useState, useEffect } from 'react';
import { updateAvailability } from '@/lib/api/profileApi';
import Toast from '@/components/Toast';

interface AvailabilitySettingsProps {
  userId: string;
  initialHours?: number;
  initialDays?: string[];
  onSuccess?: (hours: number, days: string[]) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilitySettings({
  userId,
  initialHours = 0,
  initialDays = [],
  onSuccess,
}: AvailabilitySettingsProps) {
  const [availableHours, setAvailableHours] = useState(initialHours);
  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (availableHours < 0 || availableHours > 168) {
      setToast({ message: 'Available hours must be between 0 and 168', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateAvailability(userId, {
        availableHours,
        availableDays: selectedDays,
      });
      setToast({ message: 'Availability updated successfully', type: 'success' });
      onSuccess?.(result.availableHours, result.availableDays);
    } catch (error) {
      setToast({ message: 'Failed to update availability', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (hours: number) => {
    setAvailableHours(hours);
  };

  const selectAllDays = () => {
    setSelectedDays(DAYS_OF_WEEK);
  };
  const clearAllDays = () => {
    setSelectedDays([]);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-orange-200/50 p-6 shadow-sm">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-xl font-bold text-orange-950 mb-6">Availability Settings</h2>

      <div className="space-y-6">
        {/* Available Hours Section */}
        <div>
          <label className="block text-sm font-bold text-orange-950 mb-3">
            Weekly Available Hours
          </label>
          <p className="text-xs text-orange-900/60 font-bold mb-3">
            How many hours per week are you available for collaboration?
          </p>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[0, 5, 10, 15, 20, 30, 40].map((hours) => (
              <button
                key={hours}
                onClick={() => handleQuickSelect(hours)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  availableHours === hours
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white/80 text-orange-950/70 border border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>

          {/* Manual Input */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="168"
              value={availableHours}
              onChange={(e) => setAvailableHours(Math.max(0, Math.min(168, parseInt(e.target.value) || 0)))}
              className="flex-1 px-4 py-2 bg-white/80 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-950 font-medium shadow-sm transition-shadow"
            />
            <span className="text-orange-900/60 font-bold text-sm">hours/week</span>
          </div>

          <p className="text-xs text-orange-700/80 font-semibold mt-2">
            Maximum: 168 hours (full week). Set to 0 if not currently available.
          </p>
        </div>

        {/* Available Days Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-orange-950">
              Available Days
            </label>
            <div className="flex gap-3">
              <button
                onClick={selectAllDays}
                className="text-xs text-orange-600 font-bold hover:text-orange-700 transition"
              >
                Select All
              </button>
              <button
                onClick={clearAllDays}
                className="text-xs text-orange-400 font-bold hover:text-orange-500 transition"
              >
                Clear
              </button>
            </div>
          </div>

          <p className="text-xs text-orange-900/60 font-bold mb-3">
            Which days of the week are you typically available?
          </p>

          {/* Day Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`py-2 px-3 rounded-xl font-bold transition-all text-sm ${
                  selectedDays.includes(day)
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white/80 text-orange-950/70 border border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Full Day Names Display */}
          {selectedDays.length > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-br from-orange-50/80 to-amber-50/80 border border-orange-200/60 rounded-xl shadow-inner">
              <p className="text-sm text-orange-950 font-medium">
                <span className="font-bold">Available:</span> {selectedDays.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-4 bg-orange-100/50 border border-orange-200/60 rounded-xl">
          <p className="text-sm text-orange-950 font-medium">
            <strong className="font-black">Summary:</strong> You're available{' '}
            <span className="font-bold text-orange-700">{availableHours > 0 ? `${availableHours} hours per week` : 'for limited collaboration'}</span>{' '}
            {selectedDays.length > 0
              ? `on ${selectedDays.length === 7 ? 'any day' : selectedDays.length + ' days'}`
              : 'with no specific days selected'}
            .
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
}

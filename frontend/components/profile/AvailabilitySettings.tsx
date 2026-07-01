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
    <div className="bg-white rounded-lg shadow-md p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-xl font-bold text-slate-900 mb-6">Availability Settings</h2>

      <div className="space-y-6">
        {/* Available Hours Section */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-3">
            Weekly Available Hours
          </label>
          <p className="text-xs text-slate-600 mb-3">
            How many hours per week are you available for collaboration?
          </p>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[0, 5, 10, 15, 20, 30, 40].map((hours) => (
              <button
                key={hours}
                onClick={() => handleQuickSelect(hours)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  availableHours === hours
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>

          {/* Manual Input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="168"
              value={availableHours}
              onChange={(e) => setAvailableHours(Math.max(0, Math.min(168, parseInt(e.target.value) || 0)))}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-slate-600 font-medium">hours/week</span>
          </div>

          <p className="text-xs text-slate-600 mt-2">
            Maximum: 168 hours (full week). Set to 0 if not currently available.
          </p>
        </div>

        {/* Available Days Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-900">
              Available Days
            </label>
            <div className="flex gap-2">
              <button
                onClick={selectAllDays}
                className="text-xs text-blue-600 hover:underline"
              >
                Select All
              </button>
              <button
                onClick={clearAllDays}
                className="text-xs text-red-600 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-3">
            Which days of the week are you typically available?
          </p>

          {/* Day Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`py-2 px-3 rounded-lg font-medium transition text-sm ${
                  selectedDays.includes(day)
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Full Day Names Display */}
          {selectedDays.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                Available: <strong>{selectedDays.join(', ')}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Summary:</strong> You're available{' '}
            {availableHours > 0 ? `${availableHours} hours per week` : 'for limited collaboration'}{' '}
            {selectedDays.length > 0
              ? `on ${selectedDays.length === 7 ? 'any day' : selectedDays.length + ' days'}`
              : 'with no specific days selected'}
            .
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400"
        >
          {isLoading ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
}

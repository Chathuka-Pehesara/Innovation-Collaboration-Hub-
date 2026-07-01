'use client';

interface AvailabilityDisplayProps {
  hours: number;
  days?: string[] | null;
}

export function AvailabilityDisplay({ hours, days }: AvailabilityDisplayProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-xs text-gray-400">Weekly Commitment</p>
        <p className="text-sm font-bold text-white mt-0.5">{hours > 0 ? `${hours} hours per week` : 'No weekly hours specified'}</p>
      </div>
      {days && days.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Available Days</p>
          <div className="flex flex-wrap gap-1.5">
            {days.map((day) => (
              <span key={day} className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                {day}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

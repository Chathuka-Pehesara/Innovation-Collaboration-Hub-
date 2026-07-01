'use client';

export default function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: 'match',
      user: 'Sarah Chen (AI)',
      action: 'joined Project "Eco-Mapper"',
      time: '10 mins ago',
      icon: '🤝',
      color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    },
    {
      id: 2,
      type: 'skill',
      user: 'You',
      action: 'validated Python and React skills with AI Engine',
      time: '1 hour ago',
      icon: '🧠',
      color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    },
    {
      id: 3,
      type: 'project',
      user: 'Marcus Vance (Security)',
      action: 'created a new project "Auth-Sentinel"',
      time: '4 hours ago',
      icon: '📁',
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
    {
      id: 4,
      type: 'mentor',
      user: 'AI Mentor (Bot)',
      action: 'suggested recommendations on "Eco-Mapper" requirements',
      time: '1 day ago',
      icon: '💡',
      color: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 text-lg ${act.color}`}>
            {act.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-200">
              <span className="font-semibold text-white">{act.user}</span> {act.action}
            </p>
            <span className="text-xs text-gray-500 mt-1 block">{act.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

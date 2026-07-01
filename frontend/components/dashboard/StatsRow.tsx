'use client';

export default function StatsRow() {
  const stats = [
    { label: 'Total Projects', value: '12', change: '+2 this week', icon: '📁', color: 'text-indigo-400' },
    { label: 'Team Matches', value: '84%', change: 'High compatibility', icon: '🤝', color: 'text-green-400' },
    { label: 'Verified Skills', value: '38', change: 'Across 6 categories', icon: '🧠', color: 'text-purple-400' },
    { label: 'Mentors Active', value: '4', change: 'Online now', icon: '💬', color: 'text-pink-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
            <h4 className="text-3xl font-extrabold text-white">{stat.value}</h4>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
          <div className={`text-3xl p-3 bg-white/5 border border-white/5 rounded-xl ${stat.color}`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

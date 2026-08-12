'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import { Shield, Mail, Calendar, TrendingUp, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  specialization: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  createdAt: string;
  skills: string[];
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users/admin/all');
        setUsers(data.users);
      } catch (err) {
        console.error('Failed to fetch admin users:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchUsers();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="text-orange-500" size={28} />
            System Administration
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage platform users and view statistics</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/5 border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-orange-500/50 transition-colors w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-orange-500/20 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Shield className="text-orange-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Users</p>
              <h3 className="text-2xl font-bold">{users.length}</h3>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-orange-500/20 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <TrendingUp className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total XP Generated</p>
              <h3 className="text-2xl font-bold">{users.reduce((acc, curr) => acc + curr.xp, 0).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-orange-500/20 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Calendar className="text-red-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">New This Week</p>
              <h3 className="text-2xl font-bold">
                {users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 border-b border-[var(--border-color)]">
              <tr>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">User</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Contact</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Role</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Stats</th>
                <th className="p-4 font-semibold text-[var(--text-secondary)]">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-500/20 flex-shrink-0 relative">
                        {u.avatarUrl ? (
                          <Image src={u.avatarUrl} alt={u.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-orange-500">
                            {u.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{u.specialization || 'No specialization'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Mail size={14} />
                      {u.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      u.role === 'admin' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-semibold text-amber-500">Lvl {u.level}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{u.xp} XP</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

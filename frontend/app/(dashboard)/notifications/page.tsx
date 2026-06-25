'use client';

import { useEffect, useState } from 'react';
import { useNotificationStore } from '../../../lib/store/notificationStore';
import { Bell, Check, CheckSquare, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryUserId = searchParams.get('userId');
      const storedUserId = localStorage.getItem('userId');
      const currentUserId = queryUserId || storedUserId || 'user_123';
      setUserId(currentUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications(userId);
    }
  }, [userId, fetchNotifications]);

  if (!userId) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-slate-50/50 p-6 dark:bg-slate-950/50">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Bell className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              Notifications
            </h1>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
              Manage your real-time alerts and messages receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead(userId)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-indigo-500/20 transition-all"
              >
                <CheckSquare className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 dark:bg-slate-800">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All caught up!</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm dark:text-slate-400">
              You do not have any notifications at the moment. New alerts will show up here.
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 flex items-start gap-4 transition-all duration-200 ${
                  notif.isRead 
                    ? 'bg-transparent' 
                    : 'bg-indigo-50/20 border-l-4 border-indigo-500 dark:bg-indigo-950/10'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  notif.isRead 
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' 
                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                }`}>
                  <Bell className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <h4 className={`text-base font-semibold truncate ${
                      notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                    }`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {notif.message}
                  </p>

                  <div className="mt-3 flex items-center gap-4">
                    {notif.referenceId && (
                      <Link 
                        href={`/messages?userId=${userId}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Go to Chat
                      </Link>
                    )}
                    
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(userId, notif.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

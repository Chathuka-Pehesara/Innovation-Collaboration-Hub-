import { useState, useEffect, useRef } from 'react';
import { useNotificationStore } from '../../lib/store/notificationStore';
import { Bell, Check, CheckSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NotificationCentreProps {
  userId: string;
}

export default function NotificationCentre({ userId }: NotificationCentreProps) {
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load user alerts
  useEffect(() => {
    fetchNotifications(userId);
  }, [userId, fetchNotifications]);

  // Handle clicking outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Bell Trigger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-3xs font-extrabold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out / Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl border border-slate-200/60 bg-white shadow-2xl dark:border-slate-800/60 dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Recent Alerts
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead(userId)}
                className="text-3xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                <CheckSquare className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-850">
            {recentNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No new notifications
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 transition-all duration-200 ${
                    notif.isRead 
                      ? 'bg-transparent' 
                      : 'bg-indigo-50/10 border-l-3 border-indigo-500 dark:bg-indigo-950/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold ${
                      notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                    }`}>
                      {notif.title}
                    </p>
                    <span className="text-4xs text-slate-450 dark:text-slate-500 shrink-0 mt-0.5">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-2xs text-slate-500 mt-1 dark:text-slate-400 leading-normal line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="mt-2.5 flex items-center gap-3">
                    {notif.referenceId && (
                      <Link
                        href={`/messages?userId=${userId}`}
                        onClick={() => setIsOpen(false)}
                        className="text-4xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-0.5"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        Chat
                      </Link>
                    )}
                    
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(userId, notif.id)}
                        className="text-4xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350 flex items-center gap-0.5"
                      >
                        <Check className="h-2.5 w-2.5" />
                        Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer View All link */}
          <Link
            href={`/notifications?userId=${userId}`}
            onClick={() => setIsOpen(false)}
            className="block text-center py-3 bg-slate-50 text-xs font-semibold text-slate-650 hover:bg-slate-100 hover:text-slate-900 border-t border-slate-100 dark:bg-slate-950/30 dark:hover:bg-slate-950/60 dark:border-slate-800 dark:text-slate-400 transition-all"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}

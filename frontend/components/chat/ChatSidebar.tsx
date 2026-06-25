import { useState } from 'react';
import { useChatStore } from '../../lib/store/chatStore';
import { Hash, MessageSquare, Search, Plus, UserPlus, X } from 'lucide-react';

interface ChatSidebarProps {
  activeUserId: string;
}

export default function ChatSidebar({ activeUserId }: ChatSidebarProps) {
  const { conversations, activeChatId, setActiveChatId, onlineUsers } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDMModalOpen, setIsDMModalOpen] = useState(false);
  const [targetUserText, setTargetUserText] = useState('');

  // Start new DM conversation
  const handleStartDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserText.trim()) return;

    // Direct Messages map their chat using active user and target user
    // We select the DM chat by triggering active store selection.
    // In our store, we will dynamically select or fetch the messages.
    setActiveChatId(`dm_${targetUserText.trim()}`);
    setTargetUserText('');
    setIsDMModalOpen(false);
  };

  // Filter conversations based on user search
  const filteredConversations = conversations.filter(c => {
    const name = c.name || c.id;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-full w-full flex-col border-r border-slate-200/60 bg-slate-50/20 dark:border-slate-800/60 dark:bg-slate-950/20 sm:w-80 shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Messages</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Logged in: {activeUserId}</p>
        </div>
        <button 
          onClick={() => setIsDMModalOpen(true)}
          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 transition-all"
          title="New Direct Message"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-9 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No chats found
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = activeChatId === chat.id;
            const isGroup = chat.isGroup;
            const isTargetOnline = !isGroup && chat.name && onlineUsers.has(chat.name);

            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Chat Icon / Online status */}
                <div className="relative shrink-0">
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {isGroup ? (
                      <Hash className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                  
                  {/* Status Indicator for DMs */}
                  {!isGroup && (
                    <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 ${
                      isActive ? 'border-indigo-600' : 'border-white dark:border-slate-900'
                    } ${isTargetOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  )}
                </div>

                {/* Conversation metadata */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold truncate ${
                      isActive ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {chat.name || 'Conversation'}
                    </span>
                  </div>
                </div>

                {/* Unread count badge */}
                {(chat as any).unreadCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-2xs font-extrabold ${
                    isActive 
                      ? 'bg-white text-indigo-600' 
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {(chat as any).unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Direct Message Starter Modal */}
      {isDMModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <button 
              onClick={() => setIsDMModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Start a Conversation
            </h3>
            <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
              Enter a Username/ID to open a secure direct message chat.
            </p>

            <form onSubmit={handleStartDM} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Username (e.g. user_abc)"
                  value={targetUserText}
                  onChange={(e) => setTargetUserText(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 text-sm"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDMModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-indigo-500/10 transition-all"
                >
                  Chat Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

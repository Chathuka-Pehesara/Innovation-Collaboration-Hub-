'use client';

import { useEffect, useState } from 'react';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatWindow from '../../../components/chat/ChatWindow';
import { useChatStore } from '../../../lib/store/chatStore';
import { initSocket, disconnectSocket } from '../../../lib/sockets/chatSocket';

export default function MessagesPage() {
  const { fetchConversations, activeChatId, onlineUsers } = useChatStore();
  const [activeUser, setActiveUser] = useState<string | null>(null);

  // Read current active user ID from URL query or localStorage, fallback to a default for demo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryUserId = searchParams.get('userId');
      const storedUserId = localStorage.getItem('userId');
      
      const currentUserId = queryUserId || storedUserId || 'user_123';
      setActiveUser(currentUserId);
      localStorage.setItem('userId', currentUserId);
    }
  }, []);

  // Connect socket and fetch chats
  useEffect(() => {
    if (!activeUser) return;

    // Connect socket for the current logged in user
    initSocket(activeUser);

    // Load conversation lists (teams and direct messages)
    fetchConversations(activeUser);

    return () => {
      disconnectSocket();
    };
  }, [activeUser, fetchConversations]);

  if (!activeUser) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-slate-50/30 backdrop-blur-md dark:bg-slate-950/30">
      <div className="mx-auto flex w-full max-w-7xl overflow-hidden border border-slate-200/60 bg-white/70 shadow-2xl dark:border-slate-800/60 dark:bg-slate-900/70 sm:rounded-2xl sm:my-4 sm:h-[calc(100vh-112px)]">
        {/* Chat Sidebar Column */}
        <ChatSidebar activeUserId={activeUser} />

        {/* Chat Window Column */}
        <ChatWindow activeUserId={activeUser} />
      </div>
    </div>
  );
}

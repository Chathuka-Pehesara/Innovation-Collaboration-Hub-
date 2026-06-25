import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../lib/store/chatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Paperclip, Send, AlertCircle, Hash, MessageSquare } from 'lucide-react';
import { emitTypingStart, emitTypingStop, emitReadReceipt } from '../../lib/sockets/chatSocket';

interface ChatWindowProps {
  activeUserId: string;
}

export default function ChatWindow({ activeUserId }: ChatWindowProps) {
  const { 
    activeChatId, 
    messages, 
    sendMessage, 
    sendAttachment, 
    fetchMessages, 
    typingUsers, 
    isSocketConnected 
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId, fetchMessages]);

  // Emit read receipts when new messages are loaded or read
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      emitReadReceipt(activeChatId, activeUserId);
    }
  }, [activeChatId, messages, activeUserId]);

  // Auto scroll messages stream to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing event triggers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!activeChatId) return;

    if (!isTyping) {
      setIsTyping(true);
      emitTypingStart(activeChatId, activeUserId, activeUserId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingStop(activeChatId, activeUserId);
    }, 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    sendMessage(activeChatId, activeUserId, inputText.trim());
    setInputText('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    emitTypingStop(activeChatId, activeUserId);
  };

  // Handle file uploads/attachments
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeChatId) return;

    const file = files[0];
    await sendAttachment(activeChatId, activeUserId, file);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!activeChatId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/10 p-6 text-center dark:bg-slate-900/10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Your Workspace Chat</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm dark:text-slate-400">
          Select a team channel or enter a username to start sharing files, text messages, and real-time collaboration.
        </p>
      </div>
    );
  }

  // Get active typing users in this specific chat (excluding self)
  const typists = (typingUsers[activeChatId] || []).filter(u => u !== activeUserId);
  let typingText = '';
  if (typists.length === 1) {
    typingText = `${typists[0]} is typing...`;
  } else if (typists.length > 1) {
    typingText = `${typists.length} people are typing...`;
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative">
      {/* Polling/Connection Alert Banner */}
      {!isSocketConnected && (
        <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Real-time connection lost. Reconnecting... (Fallback HTTP polling active every 5s)</span>
        </div>
      )}

      {/* Chat Area Header */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg dark:bg-slate-800 dark:text-slate-300">
            {activeChatId.startsWith('dm_') ? (
              <MessageSquare className="h-5 w-5" />
            ) : (
              <Hash className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              {activeChatId.startsWith('dm_') ? activeChatId.replace('dm_', '') : 'Team Channel'}
            </h3>
            <p className="text-2xs text-slate-400 dark:text-slate-500">
              {activeChatId.startsWith('dm_') ? 'Secure Direct Conversation' : 'Team Workspace Discussion'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <span className="text-xs">No messages yet. Send a wave! 👋</span>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isOwn={message.senderId === activeUserId} 
            />
          ))
        )}

        {/* Dynamic Typing Indicators */}
        {typists.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 py-1">
            <TypingIndicator />
            <span>{typingText}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Area */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-950/20 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          {/* File attachment picker */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-white text-slate-500 hover:text-slate-700 border border-slate-200/60 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all shrink-0"
            title="Attach a file (Max 10MB)"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 glass-input px-4 py-3 text-sm focus:outline-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-indigo-600/20 disabled:opacity-50 disabled:hover:shadow-none transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

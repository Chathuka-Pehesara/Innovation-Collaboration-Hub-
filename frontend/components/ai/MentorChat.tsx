'use client';

import { useState, useRef, useEffect } from 'react';
import { mentorChatApi, ChatMessage, MentorContext } from '@/lib/api/aiApi';
import { useAuthStore } from '@/lib/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Send } from 'lucide-react';

interface MentorChatProps {
  projectContext?: MentorContext;
}

type MentorTopic = 'general' | 'technical_planning' | 'team_building' | 'idea_refinement';

interface MentorOption {
  value: MentorTopic;
  label: string;
  avatar: string;
  description: string;
  initialGreeting: string;
}

const MENTORS: MentorOption[] = [
  {
    value: 'general',
    label: 'Dr. Evelyn (Success Mentor)',
    avatar: '👩‍🏫',
    description: 'Specializes in project milestones, timelines, and academic requirements.',
    initialGreeting: 'Hello! I am Dr. Evelyn. I am here to help you scope your project, manage your timeline, and reach your milestones. What are we building?',
  },
  {
    value: 'technical_planning',
    label: 'Devon (Tech Architect)',
    avatar: '💻',
    description: 'Expert in system design, technology stacks, databases, and APIs.',
    initialGreeting: 'Hey there! I\'m Devon. Let\'s talk stacks. Tell me your project idea, and I can help map out your system architecture, choose databases, or design schemas.',
  },
  {
    value: 'team_building',
    label: 'Coach Marcus (Team Lead)',
    avatar: '🤝',
    description: 'Expert in group synergy, roles distribution, and task assignment.',
    initialGreeting: 'Hi! Coach Marcus here. A great project starts with a balanced team. Tell me what skills you need, and let\'s structure roles and plan your teamwork.',
  },
  {
    value: 'idea_refinement',
    label: 'Zara (Innovation Catalyst)',
    avatar: '✨',
    description: 'Focused on refinement, market need, pitches, and uniqueness.',
    initialGreeting: 'Welcome! I\'m Zara. Let\'s polish your concept. I can help refine your value proposition, find your target audience, and make your idea stand out.',
  },
];

export default function MentorChat({ projectContext }: MentorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMentor, setActiveMentor] = useState<MentorOption>(MENTORS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages when mentor changes
  useEffect(() => {
    setMessages([
      { role: 'assistant', content: activeMentor.initialGreeting }
    ]);
    setSuggestions([
      'How do I start?',
      'Suggest a stack',
      'What roles do I need?'
    ]);
  }, [activeMentor]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      // Map current list to history format matching api
      const history = messages.slice(1); // omit initial greeting

      // Enriched context
      const context: MentorContext = {
        project_title: projectContext?.project_title || '',
        project_description: projectContext?.project_description || '',
        user_skills: user?.specialization ? [user.specialization] : [],
        team_stage: projectContext?.team_stage || 'forming',
        project_type: activeMentor.value === 'technical_planning' ? 'web_app' : undefined,
        ...projectContext
      };

      const response = await mentorChatApi(textToSend, history, context);
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.reply }
      ]);
      
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      } else if (response.follow_up_questions && response.follow_up_questions.length > 0) {
        setSuggestions(response.follow_up_questions);
      }
    } catch (err) {
      console.error('Mentor chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Oops, my neural circuits got crossed! Please try sending that message again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat window panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}
            className="w-80 sm:w-96 h-[510px] bg-white/95 dark:bg-[#161822]/95 backdrop-blur-xl border border-amber-900/10 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-amber-900/5 bg-amber-500/10 dark:border-white/5 dark:bg-[#1C1F2E]/65 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeMentor.avatar}</span>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm tracking-tight">{activeMentor.label}</h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">AI Mentor</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mentor Dropdown Selector */}
              <div className="flex items-center justify-between gap-1.5 mt-1 border-t border-amber-900/5 dark:border-white/5 pt-2">
                <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase shrink-0">Consult Expert:</span>
                <select
                  value={activeMentor.value}
                  onChange={(e) => {
                    const selected = MENTORS.find((m) => m.value === e.target.value);
                    if (selected) setActiveMentor(selected);
                  }}
                  className="bg-white border border-amber-900/15 rounded px-1.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer max-w-[190px] truncate dark:bg-white/5 dark:border-white/10 dark:text-white"
                >
                  {MENTORS.map((m) => (
                    <option key={m.value} value={m.value} className="bg-white text-slate-900 dark:bg-[#1C1F2E] dark:text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${
                        isUser
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-transparent rounded-br-none shadow-md shadow-orange-500/20'
                          : 'bg-orange-50 border-orange-200/60 text-orange-950 dark:border-transparent rounded-bl-none dark:bg-white/5 dark:border-white/5 dark:text-gray-200'
                      }`}
                    >
                      {!isUser && i === 0 && (
                        <p className="text-[9px] text-slate-500 font-extrabold uppercase mb-1.5 tracking-wider border-b border-amber-900/5 dark:border-white/5 pb-1 dark:text-gray-500">
                          {activeMentor.description}
                        </p>
                      )}
                      <span className="whitespace-pre-line">{msg.content}</span>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-amber-950/5 border border-amber-900/10 text-amber-900 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center dark:bg-white/5 dark:border-white/5 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 bg-amber-900/50 rounded-full animate-bounce dark:bg-gray-450" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-900/50 rounded-full animate-bounce dark:bg-gray-450" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-900/50 rounded-full animate-bounce dark:bg-gray-450" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions area */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 bg-amber-950/5 dark:bg-black/10 flex flex-wrap gap-1.5 shrink-0 border-t border-amber-900/10 dark:border-white/5 max-h-[80px] overflow-y-auto">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="px-2 py-0.5 rounded-full border border-orange-300 hover:border-orange-500 bg-white hover:bg-orange-50 text-[10px] text-orange-700 hover:text-orange-900 font-bold transition-all text-left truncate max-w-[200px] shadow-sm"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 border-t border-amber-950/15 dark:border-white/5 bg-amber-50/60 dark:bg-[#11131C] flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${activeMentor.label.split(' ')[0]}...`}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white/95 border border-orange-200/60 text-orange-950 font-medium placeholder-orange-900/40 shadow-inner"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-orange-500 text-white rounded-xl px-3.5 py-2 hover:bg-orange-600 shadow-md transition-colors shrink-0 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08, rotate: isOpen ? -90 : 0 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 flex items-center justify-center text-white shadow-xl shadow-orange-500/30 relative border border-white/20 group cursor-pointer"
        title="Consult AI Mentor"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Bot className="w-6 h-6 group-hover:hidden" />
              <Sparkles className="w-6 h-6 hidden group-hover:block text-amber-200 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}

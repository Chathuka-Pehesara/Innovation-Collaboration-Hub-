'use client';

import { useState, useRef, useEffect } from 'react';
import { mentorChatApi, ChatMessage, MentorContext } from '@/lib/api/aiApi';
import { useAuthStore } from '@/lib/authStore';

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
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-[#161822]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-[#1C1F2E]/65 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeMentor.avatar}</span>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-tight">{activeMentor.label}</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">AI Mentor</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mentor Dropdown Selector */}
            <div className="flex items-center justify-between gap-1.5 mt-1 border-t border-white/5 pt-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">Consult Expert:</span>
              <select
                value={activeMentor.value}
                onChange={(e) => {
                  const selected = MENTORS.find((m) => m.value === e.target.value);
                  if (selected) setActiveMentor(selected);
                }}
                className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer max-w-[190px] truncate"
              >
                {MENTORS.map((m) => (
                  <option key={m.value} value={m.value} className="bg-[#1C1F2E] text-white">
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
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10'
                        : 'bg-white/5 border border-white/5 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    {!isUser && i === 0 && (
                      <p className="text-[9px] text-gray-500 font-extrabold uppercase mb-1.5 tracking-wider border-b border-white/5 pb-1">
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
                <div className="bg-white/5 border border-white/5 text-gray-400 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions area */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 bg-black/10 flex flex-wrap gap-1.5 shrink-0 border-t border-white/5 max-h-[80px] overflow-y-auto">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="px-2 py-0.5 rounded-full border border-white/10 hover:border-indigo-500 bg-white/5 hover:bg-indigo-600/10 text-[10px] text-indigo-300 hover:text-white transition-all text-left truncate max-w-[200px]"
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
            className="p-3 border-t border-white/5 bg-[#11131C] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${activeMentor.label.split(' ')[0]}...`}
              className="flex-1 glass-input text-xs px-3.5 py-2.5 focus:border-indigo-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary px-3.5 py-2 hover:bg-indigo-500 transition-colors shrink-0 disabled:opacity-40"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all relative border border-white/10 group"
        title="Consult AI Mentor"
      >
        <span className="group-hover:rotate-12 transition-transform duration-300">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            '💬'
          )}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        )}
      </button>
    </div>
  );
}

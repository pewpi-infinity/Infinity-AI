import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../types';
import { Brain, MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  showReasoning: boolean;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  {
    icon: '🚀',
    title: 'Start Simple',
    prompt: 'I want to launch a niche AI community. Ask me questions and iterate with me.',
  },
  {
    icon: '🧩',
    title: 'Build a Webpage',
    prompt: 'Take this conversation and turn it into a full landing page with working sections and copy.',
  },
  {
    icon: '🪙',
    title: 'Tokenize Outputs',
    prompt: 'Tokenize each AI response and attach it to this conversation so I can track collectible value.',
  },
  {
    icon: '🏪',
    title: 'Marketplace Strategy',
    prompt: 'Suggest how to list rare tokens at a premium while keeping a $1 base floor for standard tokens.',
  },
];

export function ChatWindow({ messages, showReasoning, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="max-w-2xl w-full text-center">
          {/* Hero */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-6 shadow-2xl shadow-violet-500/25">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Infinity AI: Agentic + Personalized
          </h2>
          <p className="text-slate-400 text-base mb-2 leading-relaxed max-w-lg mx-auto">
            Start with a conversation, iterate with the agent, then turn it into a working webpage.
            Every assistant response can mint a unique token tied to your conversation assets.
          </p>
          <p className="text-slate-500 text-sm mb-10">
            Agentic execution · Personalization · Tokenized creation marketplace
          </p>

          {/* Example prompts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_PROMPTS.map((ex) => (
              <div
                key={ex.title}
                className="text-left p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 cursor-default hover:border-violet-500/40 hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{ex.icon}</span>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {ex.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{ex.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          showReasoning={showReasoning}
        />
      ))}
      {/* Loading indicator (when no thinking message yet) */}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex items-center gap-3 text-slate-500 text-sm animate-pulse">
          <MessageSquare className="w-4 h-4" />
          Waiting for response…
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

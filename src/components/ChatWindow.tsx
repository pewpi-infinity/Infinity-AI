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
    icon: '🧮',
    title: 'Complex Math',
    prompt: 'Prove that the sum of angles in a triangle equals 180°, then extend this to polygons.',
  },
  {
    icon: '💻',
    title: 'Code Analysis',
    prompt: 'Write a dynamic programming solution for the knapsack problem and explain the time complexity.',
  },
  {
    icon: '🔬',
    title: 'Data Analysis',
    prompt: 'Explain how to detect anomalies in a time-series dataset using statistical methods.',
  },
  {
    icon: '🧠',
    title: 'Multi-step Reasoning',
    prompt: 'A company has revenue doubling each year. If it makes $10M today and expenses grow at 20%/yr starting at $3M, in which year does it become unprofitable?',
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
            Infinity Reasoning Engine
          </h2>
          <p className="text-slate-400 text-base mb-2 leading-relaxed max-w-lg mx-auto">
            Powered by{' '}
            <span className="text-violet-400 font-medium">Claude 3.5 Sonnet</span> and{' '}
            <span className="text-blue-400 font-medium">OpenAI o1</span> — high-intelligence
            models that think step-by-step before answering.
          </p>
          <p className="text-slate-500 text-sm mb-10">
            Complex logic · Multi-step reasoning · Code · Data analysis
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

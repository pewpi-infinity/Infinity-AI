import { useState, useRef, type KeyboardEvent } from 'react';
import { Send, Square, Paperclip, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const QUICK_PROMPTS = [
  'Explain step by step',
  'Write Python code for',
  'Analyze this data:',
  'Debug the following:',
];

export function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const insertQuickPrompt = (prompt: string) => {
    setValue((prev) => (prev ? `${prev} ${prompt}` : prompt));
    textareaRef.current?.focus();
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-slate-800">
      {/* Quick prompts */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-thin">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => insertQuickPrompt(prompt)}
            disabled={isLoading || disabled}
            className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div
        className={`flex items-end gap-3 bg-slate-800/80 border rounded-2xl px-4 py-3 transition-all ${
          disabled
            ? 'border-slate-700/50 opacity-60'
            : 'border-slate-700 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30'
        }`}
      >
        <button
          disabled
          title="Attach file (coming soon)"
          className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors mb-0.5 cursor-not-allowed"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled || isLoading}
          placeholder={
            disabled
              ? 'Configure your API key to start chatting…'
              : 'Ask anything complex… (Shift+Enter for new line)'
          }
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none outline-none text-sm leading-relaxed min-h-[24px] max-h-[200px] disabled:cursor-not-allowed"
        />

        {isLoading ? (
          <button
            onClick={onStop}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-colors"
            title="Stop generation"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            title="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      <p className="text-center text-xs text-slate-600 mt-2">
        AI can make mistakes — verify important information
      </p>
    </div>
  );
}

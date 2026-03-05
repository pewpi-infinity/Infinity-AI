import { User, Bot, AlertTriangle, Cpu } from 'lucide-react';
import type { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ReasoningPanel } from './ReasoningPanel';
import { formatTimestamp } from '../utils/helpers';
import { MODELS } from '../utils/constants';

interface MessageBubbleProps {
  message: Message;
  showReasoning: boolean;
}

export function MessageBubble({ message, showReasoning }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const hasReasoning =
    showReasoning &&
    isAssistant &&
    (message.reasoning?.length ?? 0) > 0;
  const modelName = MODELS.find((m) => m.id === message.model)?.name;

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-violet-600 to-indigo-600'
            : message.error
            ? 'bg-red-900/40 border border-red-500/30'
            : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : message.error ? (
          <AlertTriangle className="w-4 h-4 text-red-400" />
        ) : (
          <Bot className="w-4 h-4 text-violet-400" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Meta row */}
        <div
          className={`flex items-center gap-2 mb-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <span className="text-xs font-medium text-slate-400">
            {isUser ? 'You' : 'Infinity AI'}
          </span>
          {modelName && !isUser && (
            <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded-md">
              <Cpu className="w-2.5 h-2.5" />
              {modelName}
            </span>
          )}
          <span className="text-xs text-slate-600">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* Reasoning panel (above the bubble) */}
        {hasReasoning && !isUser && (
          <ReasoningPanel
            steps={message.reasoning!}
            isThinking={message.isThinking}
          />
        )}

        {/* Thinking state with no reasoning steps yet */}
        {message.isThinking && !hasReasoning && (
          <div className="mb-2 flex items-center gap-2 text-sm text-violet-400 animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Thinking</span>
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce" />
            </span>
          </div>
        )}

        {/* Message bubble */}
        {(message.content || !message.isThinking) && (
          <>
            <div
              className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm rounded-tr-sm'
                  : message.error
                  ? 'bg-red-900/20 border border-red-500/20 text-red-300 text-sm rounded-tl-sm'
                  : 'bg-slate-800/80 border border-slate-700/50 rounded-tl-sm'
              }`}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
            </div>
            {!isUser && message.rewardTokenId && (
              <div
                className="mt-1 text-xs text-emerald-400/90"
                role="status"
                aria-label={`Minted token ${message.rewardTokenId}, value ${message.rewardTokenValueUsd} dollars, rarity ${message.rewardTokenRarity}`}
              >
                <span>Minted token {message.rewardTokenId}</span>
                <span className="mx-1">·</span>
                <span>${message.rewardTokenValueUsd}</span>
                <span className="mx-1">·</span>
                <span>{message.rewardTokenRarity}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

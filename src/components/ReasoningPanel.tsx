import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Clock, Cpu } from 'lucide-react';
import type { ReasoningStep } from '../types';
import { formatDuration } from '../utils/helpers';

interface ReasoningPanelProps {
  steps: ReasoningStep[];
  isThinking?: boolean;
}

export function ReasoningPanel({ steps, isThinking }: ReasoningPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const totalDuration = steps.reduce((sum, s) => sum + (s.durationMs ?? 0), 0);

  return (
    <div className="mt-2 mb-3 rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-violet-500/10 transition-colors"
      >
        <Brain className={`w-4 h-4 text-violet-400 shrink-0 ${isThinking ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium text-violet-300">
          {isThinking ? (
            <span className="flex items-center gap-2">
              <span>Reasoning</span>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
              </span>
            </span>
          ) : (
            `Reasoning (${steps.length} step${steps.length !== 1 ? 's' : ''}${totalDuration ? ` · ${formatDuration(totalDuration)}` : ''})`
          )}
        </span>
        <div className="ml-auto text-slate-500">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Steps */}
      {expanded && steps.length > 0 && (
        <div className="border-t border-violet-500/20 divide-y divide-violet-500/10">
          {steps.map((step, index) => (
            <div key={step.id} className="overflow-hidden">
              <button
                onClick={() =>
                  setExpandedStep(expandedStep === step.id ? null : step.id)
                }
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-violet-500/5 transition-colors text-left"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {step.title}
                    </span>
                    {step.durationMs != null && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatDuration(step.durationMs)}
                      </span>
                    )}
                  </div>
                  {expandedStep !== step.id && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {step.content}
                    </p>
                  )}
                </div>
                <div className="text-slate-600 shrink-0">
                  {expandedStep === step.id ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {expandedStep === step.id && (
                <div className="px-4 pb-3 ml-8">
                  <div className="bg-slate-900/60 rounded-lg p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
                    {step.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Thinking placeholder steps */}
      {expanded && isThinking && steps.length === 0 && (
        <div className="border-t border-violet-500/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Cpu className="w-4 h-4 animate-spin-slow text-violet-500" />
            Initializing reasoning chain…
          </div>
        </div>
      )}
    </div>
  );
}

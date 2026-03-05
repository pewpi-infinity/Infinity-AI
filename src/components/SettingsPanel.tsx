import { useState } from 'react';
import type { ConversationSettings } from '../types';
import { MODELS } from '../utils/constants';
import {
  Cpu,
  Thermometer,
  Hash,
  Brain,
  MessageSquare,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';


interface SettingsPanelProps {
  settings: ConversationSettings;
  onChange: (settings: Partial<ConversationSettings>) => void;
  onClear: () => void;
}

export function SettingsPanel({ settings, onChange, onClear }: SettingsPanelProps) {
  const [showPrompt, setShowPrompt] = useState(false);

  const selectedModel = MODELS.find((m) => m.id === settings.model);
  const isReasoningModel = selectedModel?.supportsReasoning;

  return (
    <div className="flex flex-col gap-5 px-1">
      {/* Model Selector */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
          <Cpu className="w-3.5 h-3.5" />
          Model
        </label>
        <div className="relative">
          <select
            value={settings.model}
            onChange={(e) =>
              onChange({ model: e.target.value as ConversationSettings['model'] })
            }
            className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
        {selectedModel && (
          <p className="text-xs text-slate-500 mt-1.5">{selectedModel.description}</p>
        )}
      </div>

      {/* Reasoning Toggle */}
      {isReasoningModel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <div>
              <div className="text-sm font-medium text-slate-200">Show Reasoning</div>
              <div className="text-xs text-slate-500">Display chain-of-thought steps</div>
            </div>
          </div>
          <button
            onClick={() => onChange({ showReasoning: !settings.showReasoning })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              settings.showReasoning ? 'bg-violet-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                settings.showReasoning ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* Stream Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-sm font-medium text-slate-200">Stream Response</div>
            <div className="text-xs text-slate-500">Token-by-token output</div>
          </div>
        </div>
        <button
          onClick={() => onChange({ streamResponse: !settings.streamResponse })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            settings.streamResponse ? 'bg-blue-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              settings.streamResponse ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Temperature (not for o1 models) */}
      {!['o1', 'o1-mini', 'o3-mini'].includes(settings.model) && (
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5" />
              Temperature
            </span>
            <span className="text-slate-300 font-mono">{settings.temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => onChange({ temperature: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
      )}

      {/* Max Tokens */}
      <div>
        <label className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            Max Tokens
          </span>
          <span className="text-slate-300 font-mono">{settings.maxTokens.toLocaleString()}</span>
        </label>
        <input
          type="range"
          min="256"
          max={selectedModel?.maxTokens ?? 8192}
          step="256"
          value={settings.maxTokens}
          onChange={(e) => onChange({ maxTokens: parseInt(e.target.value) })}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>256</span>
          <span>{(selectedModel?.maxTokens ?? 8192).toLocaleString()}</span>
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2 hover:text-slate-200 transition-colors w-full"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          System Prompt
          <ChevronDown
            className={`w-3.5 h-3.5 ml-auto transition-transform ${showPrompt ? 'rotate-180' : ''}`}
          />
        </button>
        {showPrompt && (
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => onChange({ systemPrompt: e.target.value })}
            rows={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-xs leading-relaxed resize-none focus:outline-none focus:border-violet-500"
            placeholder="You are a helpful assistant…"
          />
        )}
      </div>

      {/* Clear chat */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={onClear}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear conversation
        </button>
      </div>
    </div>
  );
}

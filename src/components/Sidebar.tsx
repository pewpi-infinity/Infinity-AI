import { Plus, MessageSquare, Trash2, Brain } from 'lucide-react';
import type { Conversation } from '../types';
import { formatTimestamp } from '../utils/helpers';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  conversations,
  activeId,
  onNew,
  onSelect,
  onDelete,
}: SidebarProps) {
  return (
    <aside className="w-64 flex flex-col bg-slate-900 border-r border-slate-800 h-full">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Infinity AI</div>
            <div className="text-xs text-slate-500">Reasoning Engine</div>
          </div>
        </div>
      </div>

      {/* New conversation button */}
      <div className="p-3 border-b border-slate-800/50">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-medium transition-all group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          New Conversation
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-8">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  conv.id === activeId
                    ? 'bg-violet-600/20 border border-violet-500/30 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <MessageSquare
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    conv.id === activeId ? 'text-violet-400' : 'text-slate-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {conv.title}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {conv.messages.length} msg
                    {conv.messages.length !== 1 ? 's' : ''} ·{' '}
                    {formatTimestamp(conv.updatedAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-auto shrink-0 p-1 rounded-lg hover:bg-red-900/40 hover:text-red-400 text-slate-600 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 text-xs text-slate-600 text-center">
        Powered by Claude 3.5 & o1
      </div>
    </aside>
  );
}

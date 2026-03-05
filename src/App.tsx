import { useState } from 'react';
import { Settings, Key, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { SettingsPanel } from './components/SettingsPanel';
import { ApiConfigPanel } from './components/ApiConfigPanel';
import { useConversations } from './hooks/useConversations';
import { useApiConfig } from './hooks/useApiConfig';

export default function App() {
  const { apiConfig, saveConfig, clearConfig } = useApiConfig();
  const {
    conversations,
    activeConversation,
    isLoading,
    newConversation,
    selectConversation,
    deleteConversation,
    updateSettings,
    sendUserMessage,
    stopGeneration,
    clearMessages,
  } = useConversations(apiConfig);

  const [showSettings, setShowSettings] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(!apiConfig);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeId={activeConversation.id}
          onNew={newConversation}
          onSelect={selectConversation}
          onDelete={deleteConversation}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">
              {activeConversation.title}
            </h1>
            <p className="text-xs text-slate-500">
              {activeConversation.settings.model}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* API Config button */}
            {!apiConfig ? (
              <button
                onClick={() => setShowApiConfig(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-xs font-medium transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                Connect API
              </button>
            ) : (
              <button
                onClick={() => setShowApiConfig(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-xs transition-colors"
                title="API Config"
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {apiConfig.provider === 'anthropic' ? 'Anthropic' : 'Azure OpenAI'}
                </span>
              </button>
            )}

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow
            messages={activeConversation.messages}
            showReasoning={activeConversation.settings.showReasoning}
            isLoading={isLoading}
          />
          <ChatInput
            onSend={sendUserMessage}
            onStop={stopGeneration}
            isLoading={isLoading}
            disabled={!apiConfig}
          />
        </div>
      </div>

      {/* Settings Drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                Conversation Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <SettingsPanel
                settings={activeConversation.settings}
                onChange={(s) => updateSettings(activeConversation.id, s)}
                onClear={() => {
                  clearMessages();
                  setShowSettings(false);
                }}
              />
            </div>
          </aside>
        </div>
      )}

      {/* API Config Modal */}
      {showApiConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-violet-400" />
                Connect Your AI
              </h2>
              {apiConfig && (
                <button
                  onClick={() => setShowApiConfig(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-6">
              <ApiConfigPanel
                onSave={saveConfig}
                existing={apiConfig}
                onClose={() => setShowApiConfig(false)}
              />
              {apiConfig && (
                <button
                  onClick={() => {
                    clearConfig();
                    setShowApiConfig(false);
                  }}
                  className="mt-3 text-xs text-slate-600 hover:text-red-400 transition-colors"
                >
                  Disconnect &amp; remove saved key
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

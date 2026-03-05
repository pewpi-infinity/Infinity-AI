import { useState, useCallback, useRef } from 'react';
import type {
  ApiConfig,
  Conversation,
  ConversationSettings,
  Message,
  ReasoningStep,
} from '../types';
import { sendMessage } from '../services/aiService';
import {
  createMessage,
  deriveConversationTitle,
  generateId,
} from '../utils/helpers';
import { DEFAULT_SYSTEM_PROMPT, MODELS } from '../utils/constants';

const DEFAULT_SETTINGS: ConversationSettings = {
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  showReasoning: true,
  streamResponse: true,
};

function createConversation(settings?: Partial<ConversationSettings>): Conversation {
  return {
    id: generateId(),
    title: 'New Conversation',
    messages: [],
    settings: { ...DEFAULT_SETTINGS, ...settings },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function useConversations(apiConfig: ApiConfig | null) {
  const [conversations, setConversations] = useState<Conversation[]>([
    createConversation(),
  ]);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId)!;

  const updateConversation = useCallback((id: string, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }, []);

  const newConversation = useCallback(() => {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const conv = createConversation();
          setActiveId(conv.id);
          return [conv];
        }
        if (activeId === id) {
          setActiveId(next[0].id);
        }
        return next;
      });
    },
    [activeId]
  );

  const updateSettings = useCallback(
    (id: string, settings: Partial<ConversationSettings>) => {
      updateConversation(id, (c) => ({
        ...c,
        settings: { ...c.settings, ...settings },
        updatedAt: new Date(),
      }));
    },
    [updateConversation]
  );

  const sendUserMessage = useCallback(
    async (content: string) => {
      if (!apiConfig || !content.trim() || isLoading) return;

      const conv = conversations.find((c) => c.id === activeId)!;
      const userMsg = createMessage('user', content.trim());

      // Optimistically add the user message
      updateConversation(activeId, (c) => {
        const title =
          c.messages.length === 0 ? deriveConversationTitle(content) : c.title;
        return {
          ...c,
          title,
          messages: [...c.messages, userMsg],
          updatedAt: new Date(),
        };
      });

      // Add a placeholder assistant message showing "thinking"
      const thinkingMsgId = generateId();
      const thinkingMsg: Message = {
        id: thinkingMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isThinking: true,
        reasoning: [],
      };

      updateConversation(activeId, (c) => ({
        ...c,
        messages: [...c.messages, thinkingMsg],
        updatedAt: new Date(),
      }));

      setIsLoading(true);
      abortRef.current = new AbortController();

      const modelConfig = MODELS.find((m) => m.id === conv.settings.model);

      try {
        await sendMessage(
          apiConfig,
          conv.settings,
          conv.messages,
          content.trim(),
          {
            signal: abortRef.current.signal,
            onToken: (token) => {
              updateConversation(activeId, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === thinkingMsgId
                    ? { ...m, content: m.content + token, isThinking: false }
                    : m
                ),
                updatedAt: new Date(),
              }));
            },
            onReasoningStep: (step: ReasoningStep) => {
              if (!conv.settings.showReasoning) return;
              updateConversation(activeId, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === thinkingMsgId
                    ? {
                        ...m,
                        reasoning: [...(m.reasoning ?? []), step],
                        isThinking: true,
                      }
                    : m
                ),
                updatedAt: new Date(),
              }));
            },
            onComplete: (finalMsg) => {
              updateConversation(activeId, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === thinkingMsgId
                    ? {
                        ...finalMsg,
                        id: thinkingMsgId,
                        isThinking: false,
                        model: modelConfig?.id,
                      }
                    : m
                ),
                updatedAt: new Date(),
              }));
            },
            onError: (err) => {
              // Ignore abort errors — the user intentionally stopped generation
              if (err.name === 'AbortError') return;
              updateConversation(activeId, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === thinkingMsgId
                    ? {
                        ...m,
                        content: `⚠️ ${err.message}`,
                        isThinking: false,
                        error: true,
                      }
                    : m
                ),
                updatedAt: new Date(),
              }));
            },
          }
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiConfig, activeId, conversations, isLoading, updateConversation]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    // Mark the in-progress message as complete
    updateConversation(activeId, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.isThinking ? { ...m, isThinking: false } : m
      ),
    }));
  }, [activeId, updateConversation]);

  const clearMessages = useCallback(() => {
    updateConversation(activeId, (c) => ({
      ...c,
      messages: [],
      title: 'New Conversation',
      updatedAt: new Date(),
    }));
  }, [activeId, updateConversation]);

  return {
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
  };
}

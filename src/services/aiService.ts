import type {
  ApiConfig,
  ConversationSettings,
  Message,
  ReasoningStep,
  SendMessageOptions,
} from '../types';
import { createMessage, createReasoningStep } from '../utils/helpers';

/**
 * Sends a message to the configured AI provider and streams the response.
 * Supports Azure OpenAI (o1/o3 reasoning models) and Anthropic Claude 3.5 Sonnet.
 */
export async function sendMessage(
  apiConfig: ApiConfig,
  settings: ConversationSettings,
  history: Message[],
  userContent: string,
  options: SendMessageOptions = {}
): Promise<Message> {
  if (apiConfig.provider === 'azure-openai') {
    return sendAzureOpenAI(apiConfig, settings, history, userContent, options);
  } else {
    return sendAnthropic(apiConfig, settings, history, userContent, options);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Azure OpenAI  (o1 / o1-mini / o3-mini)
// ─────────────────────────────────────────────────────────────────────────────

async function sendAzureOpenAI(
  config: ApiConfig,
  settings: ConversationSettings,
  history: Message[],
  userContent: string,
  options: SendMessageOptions
): Promise<Message> {
  const { onToken, onReasoningStep, onComplete, onError, signal } = options;

  const endpoint = config.endpoint ?? '';
  const deploymentName = config.deploymentName ?? settings.model;
  const apiVersion = config.apiVersion ?? '2024-12-01-preview';

  const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

  // o1 models do not support streaming or temperature != 1 or system messages
  const isReasoningModel = ['o1', 'o1-mini', 'o3-mini'].includes(settings.model);
  const messages: { role: string; content: string }[] = [];

  if (!isReasoningModel && settings.systemPrompt) {
    messages.push({ role: 'system', content: settings.systemPrompt });
  }

  for (const msg of history) {
    if (msg.role === 'system') continue;
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: 'user', content: userContent });

  const body: Record<string, unknown> = {
    messages,
    max_completion_tokens: settings.maxTokens,
    stream: isReasoningModel ? false : settings.streamResponse,
  };

  if (!isReasoningModel) {
    body.temperature = settings.temperature;
  }

  // Request reasoning summary when available
  if (isReasoningModel) {
    body.reasoning_effort = 'high';
  }

  let assistantContent = '';
  let reasoningSteps: ReasoningStep[] = [];
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Azure OpenAI error ${response.status}: ${errText}`);
    }

    if (isReasoningModel || !settings.streamResponse) {
      const data = await response.json();
      const choice = data.choices?.[0];
      assistantContent = choice?.message?.content ?? '';

      // Extract reasoning tokens summary if available
      const reasoningContent =
        choice?.message?.reasoning_content ??
        data.usage?.completion_tokens_details?.reasoning_tokens;

      if (reasoningContent && typeof reasoningContent === 'string') {
        const step = createReasoningStep(
          'Chain-of-Thought Reasoning',
          reasoningContent,
          Date.now() - startTime
        );
        reasoningSteps = [step];
        onReasoningStep?.(step);
      } else if (isReasoningModel) {
        // Synthesize a reasoning summary from usage stats
        const usage = data.usage ?? {};
        const step = createReasoningStep(
          'Reasoning Completed',
          `Model performed internal reasoning over ${usage.completion_tokens_details?.reasoning_tokens ?? 'multiple'} reasoning tokens before generating this response.`,
          Date.now() - startTime
        );
        reasoningSteps = [step];
        onReasoningStep?.(step);
      }

      onToken?.(assistantContent);
    } else {
      // Streaming for non-reasoning models
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
        for (const line of lines) {
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              assistantContent += delta;
              onToken?.(delta);
            }
          } catch {
            // ignore parse errors for SSE
          }
        }
      }
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(error);
    const errMsg = createMessage('assistant', `Error: ${error.message}`, { error: true });
    return errMsg;
  }

  const msg = createMessage('assistant', assistantContent, {
    reasoning: reasoningSteps.length ? reasoningSteps : undefined,
    model: settings.model,
  });
  onComplete?.(msg);
  return msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// Anthropic Claude 3.5 Sonnet (via Messages API with extended thinking)
// ─────────────────────────────────────────────────────────────────────────────

async function sendAnthropic(
  config: ApiConfig,
  settings: ConversationSettings,
  history: Message[],
  userContent: string,
  options: SendMessageOptions
): Promise<Message> {
  const { onToken, onReasoningStep, onComplete, onError, signal } = options;

  const url = 'https://api.anthropic.com/v1/messages';

  const messages: { role: string; content: string }[] = [];
  for (const msg of history) {
    if (msg.role === 'system') continue;
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: 'user', content: userContent });

  const useExtendedThinking =
    settings.showReasoning && settings.model === 'claude-3-5-sonnet-20241022';

  const body: Record<string, unknown> = {
    model: settings.model,
    max_tokens: settings.maxTokens,
    system: settings.systemPrompt || undefined,
    messages,
    stream: settings.streamResponse,
  };

  if (useExtendedThinking) {
    body.thinking = {
      type: 'enabled',
      budget_tokens: Math.min(8000, settings.maxTokens),
    };
  } else {
    body.temperature = settings.temperature;
  }

  let assistantContent = '';
  let reasoningSteps: ReasoningStep[] = [];
  let currentThinkingContent = '';
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${errText}`);
    }

    if (!settings.streamResponse) {
      const data = await response.json();
      for (const block of data.content ?? []) {
        if (block.type === 'thinking') {
          currentThinkingContent = block.thinking ?? '';
        } else if (block.type === 'text') {
          assistantContent = block.text ?? '';
        }
      }
      if (currentThinkingContent) {
        const step = createReasoningStep(
          'Extended Thinking',
          currentThinkingContent,
          Date.now() - startTime
        );
        reasoningSteps = [step];
        onReasoningStep?.(step);
      }
      onToken?.(assistantContent);
    } else {
      // SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      let currentBlockType: string | null = null;
      let thinkingBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const json = line.slice(6).trim();
            try {
              const parsed = JSON.parse(json);
              const type = parsed.type;

              if (type === 'content_block_start') {
                currentBlockType = parsed.content_block?.type ?? null;
              } else if (type === 'content_block_delta') {
                const delta = parsed.delta;
                if (currentBlockType === 'thinking' && delta?.type === 'thinking_delta') {
                  thinkingBuffer += delta.thinking ?? '';
                } else if (currentBlockType === 'text' && delta?.type === 'text_delta') {
                  const text = delta.text ?? '';
                  assistantContent += text;
                  onToken?.(text);
                }
              } else if (type === 'content_block_stop') {
                if (currentBlockType === 'thinking' && thinkingBuffer) {
                  const step = createReasoningStep(
                    `Thinking Step ${reasoningSteps.length + 1}`,
                    thinkingBuffer,
                    Date.now() - startTime
                  );
                  reasoningSteps.push(step);
                  onReasoningStep?.(step);
                  thinkingBuffer = '';
                }
                currentBlockType = null;
              }
            } catch {
              // ignore parse errors for SSE
            }
          }
        }
      }
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(error);
    return createMessage('assistant', `Error: ${error.message}`, { error: true });
  }

  const msg = createMessage('assistant', assistantContent, {
    reasoning: reasoningSteps.length ? reasoningSteps : undefined,
    model: settings.model,
  });
  onComplete?.(msg);
  return msg;
}

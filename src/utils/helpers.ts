import type { Message, ReasoningStep } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (diff < 60000) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function createMessage(
  role: Message['role'],
  content: string,
  extra?: Partial<Message>
): Message {
  return {
    id: generateId(),
    role,
    content,
    timestamp: new Date(),
    ...extra,
  };
}

export function createReasoningStep(
  title: string,
  content: string,
  durationMs?: number
): ReasoningStep {
  return {
    id: generateId(),
    title,
    content,
    durationMs,
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function countTokensEstimate(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}

export function extractCodeBlocks(content: string): { language: string; code: string }[] {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: { language: string; code: string }[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({ language: match[1] || 'text', code: match[2].trim() });
  }
  return blocks;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function deriveConversationTitle(firstMessage: string): string {
  const clean = firstMessage.trim().replace(/\n/g, ' ');
  return truncateText(clean, 50);
}

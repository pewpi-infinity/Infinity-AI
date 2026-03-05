export type ModelProvider = 'azure-openai' | 'anthropic';

export type ModelId =
  | 'o1'
  | 'o1-mini'
  | 'o3-mini'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-sonnet-20240620';

export interface ModelConfig {
  id: ModelId;
  name: string;
  provider: ModelProvider;
  description: string;
  supportsReasoning: boolean;
  maxTokens: number;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ReasoningStep {
  id: string;
  title: string;
  content: string;
  durationMs?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  reasoning?: ReasoningStep[];
  isThinking?: boolean;
  model?: ModelId;
  error?: boolean;
  tokensUsed?: number;
  rewardTokenId?: string;
  rewardTokenValueUsd?: number;
  rewardTokenRarity?: 'common' | 'rare';
  webpageOffer?: boolean;
}

export interface RewardToken {
  id: string;
  conversationId: string;
  messageId: string;
  createdAt: Date;
  valueUsd: number;
  rarity: 'common' | 'rare';
  attachedAsset: 'conversation' | 'webpage';
}

export interface ApiConfig {
  provider: ModelProvider;
  apiKey: string;
  endpoint?: string; // Azure endpoint
  apiVersion?: string; // Azure API version
  deploymentName?: string; // Azure deployment name
}

export interface ConversationSettings {
  model: ModelId;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  showReasoning: boolean;
  streamResponse: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  settings: ConversationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageOptions {
  onToken?: (token: string) => void;
  onReasoningStep?: (step: ReasoningStep) => void;
  onComplete?: (message: Message) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

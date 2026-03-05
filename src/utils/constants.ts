import type { ModelConfig } from '../types';

export const MODELS: ModelConfig[] = [
  {
    id: 'o1',
    name: 'o1',
    provider: 'azure-openai',
    description: 'OpenAI o1 — Deep reasoning for agentic content and build planning',
    supportsReasoning: true,
    maxTokens: 32768,
  },
  {
    id: 'o1-mini',
    name: 'o1-mini',
    provider: 'azure-openai',
    description: 'OpenAI o1-mini — Fast iteration for tokenized content workflows',
    supportsReasoning: true,
    maxTokens: 65536,
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'azure-openai',
    description: 'OpenAI o3-mini — Compact reasoning for rapid conversation loops',
    supportsReasoning: true,
    maxTokens: 65536,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (Oct 2024)',
    provider: 'anthropic',
    description: 'Anthropic Claude 3.5 Sonnet — Extended thinking for full-page generation',
    supportsReasoning: true,
    maxTokens: 8192,
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet (Jun 2024)',
    provider: 'anthropic',
    description: 'Anthropic Claude 3.5 Sonnet — Balanced speed for personalized chat builds',
    supportsReasoning: false,
    maxTokens: 8192,
  },
];

export const DEFAULT_SYSTEM_PROMPT = `You are Infinity AI, combining:
- #5 Agentic execution (do the work in iterative steps)
- #6 Personalization (adapt to the user's exact conversation context)

Operating mode:
1. Start with a simple conversation and ask clarifying questions.
2. Iteratively refine ideas into concrete plans, content, and implementation-ready output.
3. Ask the user whether they want to convert the conversation into a full working webpage that matches this terminal experience.
4. When generating page output, provide complete, usable HTML/CSS/JS content.
5. Treat each assistant response as tokenizable output attached to the current conversation and any generated web assets.

Token economy framing:
- Base token value starts at $1.
- Mark standout outputs as rare and explain why they can carry premium value in a marketplace.
- Keep responses practical, specific, and immediately useful.`;

export const DEMO_REASONING_STEPS = [
  {
    id: '1',
    title: 'Understanding the Problem',
    content: 'Parsing the user request and identifying the key components that need to be addressed...',
    durationMs: 342,
  },
  {
    id: '2',
    title: 'Gathering Context',
    content: 'Analyzing relevant background knowledge and identifying applicable concepts and frameworks...',
    durationMs: 891,
  },
  {
    id: '3',
    title: 'Forming Hypothesis',
    content: 'Developing potential approaches and evaluating their strengths and weaknesses...',
    durationMs: 1204,
  },
  {
    id: '4',
    title: 'Synthesizing Answer',
    content: 'Combining insights to form a comprehensive, well-structured response...',
    durationMs: 567,
  },
];

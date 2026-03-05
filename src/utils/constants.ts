import type { ModelConfig } from '../types';

export const MODELS: ModelConfig[] = [
  {
    id: 'o1',
    name: 'o1',
    provider: 'azure-openai',
    description: 'OpenAI o1 — Advanced reasoning with deep chain-of-thought',
    supportsReasoning: true,
    maxTokens: 32768,
  },
  {
    id: 'o1-mini',
    name: 'o1-mini',
    provider: 'azure-openai',
    description: 'OpenAI o1-mini — Fast reasoning for coding & math',
    supportsReasoning: true,
    maxTokens: 65536,
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'azure-openai',
    description: 'OpenAI o3-mini — Latest compact reasoning model',
    supportsReasoning: true,
    maxTokens: 65536,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (Oct 2024)',
    provider: 'anthropic',
    description: 'Anthropic Claude 3.5 Sonnet — High-intelligence with extended thinking',
    supportsReasoning: true,
    maxTokens: 8192,
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet (Jun 2024)',
    provider: 'anthropic',
    description: 'Anthropic Claude 3.5 Sonnet — Balanced speed and intelligence',
    supportsReasoning: false,
    maxTokens: 8192,
  },
];

export const DEFAULT_SYSTEM_PROMPT = `You are Infinity AI, an advanced reasoning engine powered by high-intelligence large language models. You specialize in:

- **Complex multi-step reasoning**: Breaking down intricate problems into clear, logical steps
- **Data analysis**: Interpreting datasets, identifying patterns, and drawing insights
- **Advanced coding**: Writing, reviewing, and debugging code across all languages
- **Mathematical thinking**: Solving equations, proofs, and quantitative problems
- **Strategic planning**: Analyzing situations and recommending evidence-based solutions

Always think step-by-step. Show your reasoning process clearly. When solving complex problems, first identify the key components, then work through each systematically before presenting your final answer.`;

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

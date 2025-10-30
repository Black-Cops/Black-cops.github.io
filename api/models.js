import { handleCors } from './lib/cors.js';

const AVAILABLE_MODELS = [
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    default: true,
    free: true,
    description: 'Strong reasoning model with step-by-step thinking'
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1 0528',
    provider: 'DeepSeek',
    default: false,
    free: true,
    description: 'Alternative DeepSeek R1 version'
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT OSS 20B',
    provider: 'OpenAI',
    default: false,
    free: true,
    description: 'Fast general-purpose model'
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen3 Coder',
    provider: 'Qwen',
    default: false,
    free: true,
    description: 'Specialized for code generation'
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air',
    provider: 'Z-AI',
    default: false,
    free: true,
    description: 'Lightweight fast responses'
  },
  {
    id: 'google/gemma-3n-e2b-it:free',
    name: 'Gemma 3N E2B IT',
    provider: 'Google',
    default: false,
    free: true,
    description: 'Google\'s free model'
  }
];

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  res.status(200).json({
    models: AVAILABLE_MODELS,
    defaultModel: AVAILABLE_MODELS.find(m => m.default),
    totalFree: AVAILABLE_MODELS.filter(m => m.free).length
  });
}

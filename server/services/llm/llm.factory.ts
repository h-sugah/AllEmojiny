import { LLMProvider, ProviderId, ProviderMeta } from './provider.interface.js';
import { LMStudioProvider } from './lmstudio.provider.js';
import { OpenAIProvider } from './openai.provider.js';
import { AnthropicProvider } from './anthropic.provider.js';
import { GeminiProvider } from './gemini.provider.js';

const providers: Record<ProviderId, LLMProvider> = {
  lmstudio: new LMStudioProvider(),
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  google: new GeminiProvider(),
};

export function getProvider(id: ProviderId): LLMProvider {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`未対応のAIプロバイダーです: ${id}`);
  }
  return provider;
}

export function getAllProviders(): LLMProvider[] {
  return Object.values(providers);
}

export function getProviderMetaList(): ProviderMeta[] {
  return Object.values(providers).map(p => ({
    id: p.id,
    name: p.name,
    defaultBaseUrl: p.defaultBaseUrl,
    defaultModel: p.defaultModel,
    popularModels: p.popularModels,
    description: p.description,
  }));
}

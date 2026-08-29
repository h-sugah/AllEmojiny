export type ProviderId = 'lmstudio' | 'openai' | 'anthropic' | 'google';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  baseUrl: string;
  token: string;
  model: string;
}

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  popularModels: string[];
  description: string;
}

export interface GenerateTextOptions {
  config: ProviderConfig;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface ConnectionTestResult {
  success: boolean;
  models: string[];
  message?: string;
}

export interface LLMProvider {
  id: ProviderId;
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  popularModels: string[];
  description: string;

  generateText(options: GenerateTextOptions): Promise<string>;
  testConnection(config: ProviderConfig): Promise<ConnectionTestResult>;
}

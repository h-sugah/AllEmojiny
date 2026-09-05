import OpenAI from 'openai';
import { LLMProvider, ProviderConfig, GenerateTextOptions, ConnectionTestResult } from './provider.interface.js';

export class LMStudioProvider implements LLMProvider {
  id = 'lmstudio' as const;
  name = 'LM Studio (Local LLM)';
  defaultBaseUrl = 'http://127.0.0.1:1234/v1';
  defaultModel = 'local-model';
  popularModels = ['local-model', 'qwen2.5-7b-instruct', 'gemma-2-9b-it', 'llama-3.2-3b-instruct', 'deepseek-r1-distill-qwen-7b'];
  description = 'ローカルPC上で動作するオープンソースLLM。高速・完全オフライン・通信料無料。';

  private getClient(config: ProviderConfig): OpenAI {
    const baseURL = (config.baseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
    return new OpenAI({
      baseURL,
      apiKey: config.token || 'lm-studio',
    });
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    const client = this.getClient(options.config);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });

    const model = options.config.model || this.defaultModel;

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }, {
      signal: options.signal,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async testConnection(config: ProviderConfig): Promise<ConnectionTestResult> {
    const client = this.getClient(config);
    try {
      const response = await client.models.list();
      const models = response.data?.map(m => m.id) || [];
      return {
        success: true,
        models: models.length > 0 ? models : [this.defaultModel],
        message: `接続成功: ${models.length}個のモデルが検出されました。`,
      };
    } catch (err: any) {
      // モデル一覧エンドポイントが失敗してもチャット疎通を試行
      try {
        const testRes = await client.chat.completions.create({
          model: config.model || this.defaultModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        });
        if (testRes.choices.length > 0) {
          return {
            success: true,
            models: [config.model || this.defaultModel],
            message: 'チャット補完による接続確認に成功しました。',
          };
        }
      } catch (innerErr: any) {
        throw new Error(`LM Studioへの接続に失敗しました (${err.message})。LM Studioが起動しており、Local ServerがONになっているか確認してください。`);
      }
      throw new Error(`LM Studioへの接続に失敗しました: ${err.message}`);
    }
  }
}

import OpenAI from 'openai';
import { LLMProvider, ProviderConfig, GenerateTextOptions, ConnectionTestResult } from './provider.interface.js';

export class OpenAIProvider implements LLMProvider {
  id = 'openai' as const;
  name = 'OpenAI';
  defaultBaseUrl = 'https://api.openai.com/v1';
  defaultModel = 'gpt-4o-mini';
  popularModels = ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'gpt-3.5-turbo'];
  description = 'OpenAI公式API。GPT-4oおよびGPT-4o-miniによる高度な意味把握と高速処理。';

  private getClient(config: ProviderConfig): OpenAI {
    const token = config.token || process.env.OPENAI_API_KEY || '';
    if (!token) {
      throw new Error('OpenAI APIキーが設定されていません。設定画面でAPIキーを入力してください。');
    }
    const baseURL = (config.baseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
    return new OpenAI({
      baseURL,
      apiKey: token,
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
      const models = response.data
        ?.map(m => m.id)
        ?.filter(id => id.includes('gpt') || id.includes('o1') || id.includes('o3'))
        ?.sort() || [];

      return {
        success: true,
        models: models.length > 0 ? models : this.popularModels,
        message: 'OpenAI APIへの接続に成功しました。',
      };
    } catch (err: any) {
      throw new Error(`OpenAI APIへの接続に失敗しました: ${err.message}`);
    }
  }
}

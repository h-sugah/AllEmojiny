import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ProviderConfig, GenerateTextOptions, ConnectionTestResult } from './provider.interface.js';

export class AnthropicProvider implements LLMProvider {
  id = 'anthropic' as const;
  name = 'Anthropic Claude';
  defaultBaseUrl = 'https://api.anthropic.com/v1';
  defaultModel = 'claude-3-5-haiku-20241022';
  popularModels = [
    'claude-3-5-haiku-20241022',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307'
  ];
  description = 'Anthropic Claude API。繊細なニュアンスの理解と高度な文章・意味構成能力。';

  private getClient(config: ProviderConfig): Anthropic {
    const token = config.token || process.env.ANTHROPIC_API_KEY || '';
    if (!token) {
      throw new Error('Anthropic APIキーが設定されていません。設定画面でAPIキーを入力してください。');
    }
    const baseURL = (config.baseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
    return new Anthropic({
      baseURL,
      apiKey: token,
    });
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    const client = this.getClient(options.config);
    const model = options.config.model || this.defaultModel;

    const response = await client.messages.create({
      model,
      max_tokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.7,
      system: options.systemPrompt,
      messages: [
        { role: 'user', content: options.prompt }
      ],
    }, {
      signal: options.signal,
    });

    const block = response.content[0];
    if (block && block.type === 'text') {
      return block.text;
    }
    return '';
  }

  async testConnection(config: ProviderConfig): Promise<ConnectionTestResult> {
    const client = this.getClient(config);
    try {
      // 疎通確認のための最小限のリクエスト
      await client.messages.create({
        model: config.model || this.defaultModel,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Ping' }],
      });

      return {
        success: true,
        models: this.popularModels,
        message: 'Anthropic Claude APIへの接続に成功しました。',
      };
    } catch (err: any) {
      throw new Error(`Anthropic Claude APIへの接続に失敗しました: ${err.message}`);
    }
  }
}

import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ProviderConfig, GenerateTextOptions, ConnectionTestResult } from './provider.interface.js';

export class AnthropicProvider implements LLMProvider {
  id = 'anthropic' as const;
  name = 'Anthropic Claude';
  defaultBaseUrl = 'https://api.anthropic.com';
  defaultModel = 'claude-sonnet-4-5-20250929';
  popularModels = [
    'claude-sonnet-4-5-20250929',
    'claude-opus-4-1-20250805',
    'claude-haiku-4-5-20251001',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022'
  ];
  description = 'Anthropic Claude API。繊細なニュアンスの理解と高度な文章・意味構成能力。';

  private getClient(config: ProviderConfig): Anthropic {
    const token = config.token || process.env.ANTHROPIC_API_KEY || '';
    if (!token) {
      throw new Error('Anthropic APIキーが設定されていません。設定画面でAPIキーを入力してください。');
    }
    // SDKが /v1 接頭辞を自動付与するため、末尾の /v1 を除去して重複(/v1/v1)を防止
    const baseURL = (config.baseUrl || this.defaultBaseUrl).replace(/\/+$/, '').replace(/\/v1$/i, '');
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
    const model = config.model || this.defaultModel;

    // 疎通確認のための最小限のリクエスト
    try {
      await client.messages.create({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Ping' }],
      });
    } catch (err: any) {
      throw new Error(`Anthropic Claude APIへの接続に失敗しました: ${err.message}`);
    }

    // Models APIで利用可能なモデルを取得（不可の場合は内蔵リストにフォールバック）
    let models = this.popularModels;
    try {
      const page = await client.models.list({ limit: 100 });
      const listed = (page?.data ?? []).map(m => m.id).sort();
      if (listed.length > 0) models = listed;
    } catch {
      // Models API未対応の場合は内蔵リストを使用
    }
    if (!models.includes(model)) models = [model, ...models];

    return {
      success: true,
      models,
      message: `Anthropic Claude APIへの接続に成功しました（モデル: ${model}）。`,
    };
  }
}

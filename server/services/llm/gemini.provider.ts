import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, ProviderConfig, GenerateTextOptions, ConnectionTestResult } from './provider.interface.js';

export class GeminiProvider implements LLMProvider {
  id = 'google' as const;
  name = 'Google Gemini';
  defaultBaseUrl = 'https://generativelanguage.googleapis.com';
  defaultModel = 'gemini-3.6-flash';
  popularModels = [];
  description = 'Googleの最新マルチモーダルLLM。高速・大容量コンテキスト・高精度な日本語処理。';

  private getClient(config: ProviderConfig): GoogleGenerativeAI {
    const token = config.token || process.env.GEMINI_API_KEY || '';
    if (!token) {
      throw new Error('Google Gemini APIキーが設定されていません。設定画面でAPIキーを入力してください。');
    }
    return new GoogleGenerativeAI(token);
  }

  private async listModelNames(config: ProviderConfig): Promise<string[]> {
    const token = config.token || process.env.GEMINI_API_KEY || '';
    if (!token) return [];
    const base = (config.baseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
    const res = await fetch(`${base}/v1beta/models?key=${encodeURIComponent(token)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: { name: string }[] };
    return (data.models ?? [])
      .map(m => m.name)
      .filter(name => name.startsWith('models/gemini-'))
      .map(name => name.replace('models/', ''));
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    const ai = this.getClient(options.config);
    const modelName = options.config.model || this.defaultModel;

    const model = ai.getGenerativeModel({
      model: modelName,
      systemInstruction: options.systemPrompt,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: options.prompt }],
        },
      ],
    });

    return result.response.text();
  }

  async testConnection(config: ProviderConfig): Promise<ConnectionTestResult> {
    const ai = this.getClient(config);
    try {
      const model = ai.getGenerativeModel({
        model: config.model || this.defaultModel,
      });

      const res = await model.generateContent('Ping');
      if (res.response.text()) {
        const availableModels = await this.listModelNames(config).catch(() => [] as string[]);
        return {
          success: true,
          models: availableModels,
          message: 'Google Gemini APIへの接続に成功しました。',
        };
      }
      throw new Error('Gemini APIから応答がありませんでした。');
    } catch (err: any) {
      throw new Error(`Google Gemini APIへの接続に失敗しました: ${err.message}`);
    }
  }
}

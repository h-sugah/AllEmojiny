import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, ProviderConfig, GenerateTextOptions, ConnectionTestResult } from './provider.interface.js';

export class GeminiProvider implements LLMProvider {
  id = 'google' as const;
  name = 'Google Gemini';
  defaultBaseUrl = 'https://generativelanguage.googleapis.com';
  defaultModel = 'gemini-2.5-flash';
  popularModels = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];
  description = 'Googleの最新マルチモーダルLLM。高速・大容量コンテキスト・高精度な日本語処理。';

  private getClient(config: ProviderConfig): GoogleGenerativeAI {
    const token = config.token || process.env.GEMINI_API_KEY || '';
    if (!token) {
      throw new Error('Google Gemini APIキーが設定されていません。設定画面でAPIキーを入力してください。');
    }
    return new GoogleGenerativeAI(token);
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
        return {
          success: true,
          models: this.popularModels,
          message: 'Google Gemini APIへの接続に成功しました。',
        };
      }
      throw new Error('Gemini APIから応答がありませんでした。');
    } catch (err: any) {
      throw new Error(`Google Gemini APIへの接続に失敗しました: ${err.message}`);
    }
  }
}

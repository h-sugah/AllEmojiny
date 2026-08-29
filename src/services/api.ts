import {
  ProviderId,
  ConvertResponse,
  DecodeResponse,
  QuizQuestion,
  QuizEvaluation,
  EmojiEntry,
  ProviderMeta,
  ProviderSettingsMap,
  ConversionMode
} from '../types';

export const apiFetch = async <T = any>(path: string, init?: RequestInit): Promise<T> => {
  const r = await fetch('/api' + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!r.ok) {
    const errorJson = await r.json().catch(() => ({}));
    throw new Error(errorJson.error || `リクエストエラー (${r.status})`);
  }

  return r.json();
};

export const api = {
  // 変換
  convert: (data: {
    text: string;
    mode: ConversionMode;
    providerId?: ProviderId;
    model?: string;
    usePipeline?: boolean;
  }): Promise<ConvertResponse> => {
    return apiFetch('/convert', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // デコード
  decode: (data: {
    emojis: string;
    providerId?: ProviderId;
    model?: string;
  }): Promise<DecodeResponse> => {
    return apiFetch('/decode', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // クイズ
  generateQuiz: (genre = 'all', count = 3, providerId?: ProviderId, model?: string): Promise<{ success: boolean; questions: QuizQuestion[] }> => {
    return apiFetch('/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ genre, count, providerId, model }),
    });
  },

  evaluateQuiz: (data: {
    question: QuizQuestion;
    answer: string;
    providerId?: ProviderId;
    model?: string;
  }): Promise<{ success: boolean; evaluation: QuizEvaluation }> => {
    return apiFetch('/quiz/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 辞書
  getDictionary: (query = ''): Promise<{ success: boolean; count: number; entries: EmojiEntry[] }> => {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return apiFetch(`/dictionary${q}`);
  },

  addCustomEmoji: (keyword: string, emoji: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch('/dictionary', {
      method: 'POST',
      body: JSON.stringify({ keyword, emoji }),
    });
  },

  deleteCustomEmoji: (keyword: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/dictionary/${encodeURIComponent(keyword)}`, {
      method: 'DELETE',
    });
  },

  // 設定
  getSettings: (): Promise<{
    active_provider: ProviderId;
    providers_meta: ProviderMeta[];
    provider_settings: ProviderSettingsMap;
  }> => {
    return apiFetch('/settings');
  },

  saveSettings: (payload: {
    active_provider?: ProviderId;
    provider_settings?: Record<string, { url?: string; model?: string; token?: string; clear_token?: boolean }>;
    [key: string]: any;
  }): Promise<{ success: boolean; message: string }> => {
    return apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  testProvider: (providerId: ProviderId, data: { url?: string; token?: string; model?: string }): Promise<{
    success: boolean;
    provider: ProviderId;
    models: string[];
    message?: string;
  }> => {
    return apiFetch(`/settings/providers/${providerId}/test`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export type ProviderId = 'lmstudio' | 'openai' | 'anthropic' | 'google';

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  popularModels: string[];
  description: string;
}

export type ConversionMode = 'exact' | 'forced' | 'chaos';

export interface EmojiBreakdownItem {
  emoji: string;
  meaning: string;
  note?: string;
}

export interface Stage1Analysis {
  subject?: string;
  time?: string;
  place?: string;
  actions?: string[];
  emotion?: string;
  abstract_concepts?: string[];
  flow_summary?: string;
}

export interface ConvertResponse {
  success: boolean;
  provider: ProviderId;
  model: string;
  emojis: string;
  mode: ConversionMode;
  breakdown: EmojiBreakdownItem[];
  pipeline: {
    stage1Analysis?: Stage1Analysis;
    stage2DictionaryMatches?: Record<string, string>;
    stage3RawResponse?: string;
  };
}

export interface DecodeResponse {
  success: boolean;
  provider: ProviderId;
  model: string;
  text: string;
  summary: string;
  interpretations: {
    emojiSegment: string;
    decodedMeaning: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  genre: string;
  emojiString: string;
  hint: string;
  originalText: string;
  sourceTitle: string;
  explanation: string;
}

export interface QuizEvaluation {
  isCorrect: boolean;
  similarityScore: number;
  feedback: string;
  originalText: string;
  sourceTitle: string;
  explanation: string;
  praiseMessage?: string;
}

export interface EmojiEntry {
  keyword: string;
  emoji: string;
  category: string;
}

export interface ProviderSettingsMap {
  [key: string]: {
    url: string;
    model: string;
    configured: boolean;
    token?: string;
  };
}

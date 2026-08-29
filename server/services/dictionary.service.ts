import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '../..');
const defaultDictPath = join(root, 'server', 'data', 'emojiDictionary.json');
const customDictPath = join(root, 'data', 'customEmojiDictionary.json');

export interface EmojiEntry {
  keyword: string;
  emoji: string;
  category: string;
}

export interface EmojiDictionaryData {
  [category: string]: Record<string, string>;
}

export class DictionaryService {
  private dictionary: EmojiDictionaryData = {};
  private customDictionary: Record<string, string> = {};

  constructor() {
    this.loadDictionary();
  }

  private loadDictionary() {
    try {
      if (existsSync(defaultDictPath)) {
        const raw = readFileSync(defaultDictPath, 'utf-8');
        this.dictionary = JSON.parse(raw);
      }
    } catch (e) {
      console.error('辞書ファイルの読み込みに失敗しました:', e);
      this.dictionary = {};
    }

    try {
      if (existsSync(customDictPath)) {
        const raw = readFileSync(customDictPath, 'utf-8');
        this.customDictionary = JSON.parse(raw);
      }
    } catch (e) {
      this.customDictionary = {};
    }
  }

  public getAllEntries(): EmojiEntry[] {
    const entries: EmojiEntry[] = [];

    // デフォルト辞書
    for (const [category, words] of Object.entries(this.dictionary)) {
      for (const [keyword, emoji] of Object.entries(words)) {
        entries.push({ keyword, emoji, category });
      }
    }

    // カスタム辞書
    for (const [keyword, emoji] of Object.entries(this.customDictionary)) {
      // 既存のものを上書きまたは追加
      const idx = entries.findIndex(e => e.keyword === keyword);
      if (idx >= 0) {
        entries[idx] = { keyword, emoji, category: 'カスタム' };
      } else {
        entries.push({ keyword, emoji, category: 'カスタム' });
      }
    }

    return entries;
  }

  public search(query: string): EmojiEntry[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAllEntries();
    return this.getAllEntries().filter(
      e => e.keyword.toLowerCase().includes(q) || e.emoji.includes(q) || e.category.toLowerCase().includes(q)
    );
  }

  public addCustomWord(keyword: string, emoji: string) {
    const k = keyword.trim();
    const em = emoji.trim();
    if (!k || !em) throw new Error('単語と絵文字を入力してください');

    this.customDictionary[k] = em;
    this.saveCustomDictionary();
  }

  public removeCustomWord(keyword: string) {
    const k = keyword.trim();
    if (this.customDictionary[k]) {
      delete this.customDictionary[k];
      this.saveCustomDictionary();
      return true;
    }
    return false;
  }

  private saveCustomDictionary() {
    try {
      mkdirSync(join(root, 'data'), { recursive: true });
      writeFileSync(customDictPath, JSON.stringify(this.customDictionary, null, 2), 'utf-8');
    } catch (e) {
      console.error('カスタム辞書の保存に失敗しました:', e);
    }
  }

  /**
   * 与えられたテキスト文に含まれる単語・概念を辞書から照合し、
   * LLMプロンプトの第2段階（辞書＋連想）で利用できる絵文字マッピング候補を返す
   */
  public matchText(text: string): Record<string, string> {
    const matched: Record<string, string> = {};
    const allEntries = this.getAllEntries();

    for (const entry of allEntries) {
      if (text.includes(entry.keyword)) {
        matched[entry.keyword] = entry.emoji;
      }
    }

    return matched;
  }
}

export const dictionaryService = new DictionaryService();

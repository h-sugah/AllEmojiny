import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ProviderId, ProviderConfig } from './services/llm/provider.interface.js';
import { getProvider } from './services/llm/llm.factory.js';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(join(dataDir, 'allemojiny.sqlite'));

db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS conversion_history (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  mode TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);`);

export function getSetting(key: string, fallback = ''): string {
  const row = db.prepare('SELECT value FROM settings WHERE key=?').get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string) {
  db.prepare('INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, value);
}

// デフォルト設定の初期化
if (!getSetting('active_provider')) setSetting('active_provider', 'lmstudio');
if (!getSetting('lmstudio_url')) setSetting('lmstudio_url', 'http://127.0.0.1:1234/v1');
if (!getSetting('openai_url')) setSetting('openai_url', 'https://api.openai.com/v1');
if (!getSetting('openai_model')) setSetting('openai_model', 'gpt-4o-mini');
if (!getSetting('anthropic_url')) setSetting('anthropic_url', 'https://api.anthropic.com/v1');
if (!getSetting('anthropic_model')) setSetting('anthropic_model', 'claude-3-5-haiku-20241022');
if (!getSetting('google_url')) setSetting('google_url', 'https://generativelanguage.googleapis.com');
if (!getSetting('google_model')) setSetting('google_model', 'gemini-2.5-flash');

export function getProviderConfig(providerId: ProviderId): ProviderConfig {
  const provider = getProvider(providerId);
  return {
    id: providerId,
    name: provider.name,
    baseUrl: getSetting(`${providerId}_url`, provider.defaultBaseUrl),
    token: getSetting(`${providerId}_token`, ''),
    model: getSetting(`${providerId}_model`, provider.defaultModel),
  };
}

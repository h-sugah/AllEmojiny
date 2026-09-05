import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
<<<<<<< HEAD
import { mkdirSync } from 'node:fs';
=======
import { mkdirSync, chmodSync, readdirSync } from 'node:fs';
>>>>>>> 1d87e71 (updated)
import { fileURLToPath } from 'node:url';
import { ProviderId, ProviderConfig } from './services/llm/provider.interface.js';
import { getProvider } from './services/llm/llm.factory.js';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

<<<<<<< HEAD
=======
/**
 * APIトークン等の機微情報を含むdataディレクトリを、同一マシンの他ユーザーから
 * 読み取れないよう保護する（Windows等chmodが効かない環境では黙って無視する）
 */
function protectDataDir() {
  try {
    chmodSync(dataDir, 0o700);
    for (const name of readdirSync(dataDir)) {
      try {
        chmodSync(join(dataDir, name), 0o600);
      } catch {
        // ファイル単位の権限変更に失敗しても致命的ではないため無視
      }
    }
  } catch {
    // chmodが効かないプラットフォーム（Windows等）では無視
  }
}

protectDataDir();

>>>>>>> 1d87e71 (updated)
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

<<<<<<< HEAD
=======
// WALモード有効化でsqlite-wal/-shmが新規作成されるため、権限保護を再適用
protectDataDir();

// 変換履歴の保持件数上限（無期限肥大化を防ぐため、古い履歴から自動削除する）
const MAX_HISTORY_ROWS = 1000;

export interface ConversionHistoryEntry {
  id: string;
  type: string;
  inputText: string;
  outputText: string;
  mode: string | null;
  provider: string;
  model: string;
  metadataJson: string | null;
}

export function recordConversionHistory(entry: ConversionHistoryEntry) {
  db.prepare(
    'INSERT INTO conversion_history (id, type, input_text, output_text, mode, provider, model, metadata_json, created_at) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(
    entry.id,
    entry.type,
    entry.inputText,
    entry.outputText,
    entry.mode,
    entry.provider,
    entry.model,
    entry.metadataJson,
    new Date().toISOString()
  );

  // 直近 MAX_HISTORY_ROWS 件のみを残し、古い履歴を削除する
  db.prepare(
    `DELETE FROM conversion_history WHERE id NOT IN (
      SELECT id FROM conversion_history ORDER BY created_at DESC LIMIT ?
    )`
  ).run(MAX_HISTORY_ROWS);
}

>>>>>>> 1d87e71 (updated)
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
if (!getSetting('anthropic_url')) setSetting('anthropic_url', 'https://api.anthropic.com');
if (!getSetting('anthropic_model')) setSetting('anthropic_model', 'claude-sonnet-4-5-20250929');
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

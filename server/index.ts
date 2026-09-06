import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

import { convertRouter } from './routes/convert.js';
import { decodeRouter } from './routes/decode.js';
import { quizRouter } from './routes/quiz.js';
import { dictionaryRouter } from './routes/dictionary.js';
import { settingsRouter } from './routes/settings.js';
import { apiRateLimiter, llmRateLimiter, csrfProtection, ALLOWED_ORIGINS } from './middleware/security.js';
import { safeError } from './utils/safeLog.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// localhost専用アプリのため、明示的に0.0.0.0等を指定しない限りループバックにのみバインドする
const HOST = process.env.HOST || '127.0.0.1';

// セキュリティ & ミドルウェア
app.use(helmet({
  contentSecurityPolicy: {
    // helmetのデフォルトCSPを踏襲しつつ、TLSを使わないlocalhost専用サーバーのため
    // upgrade-insecure-requestsのみ無効化（有効だと素のhttpでのリソース読み込みが壊れる）
    directives: {
      upgradeInsecureRequests: null,
    },
  },
}));
app.use(cors({
  origin: (origin, callback) => {
    // Origin ヘッダーが無いリクエスト(curl等の非ブラウザ、同一オリジン)は許可
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: このオリジンからのアクセスは許可されていません。'));
    }
  },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// APIレート制限 & CSRF対策
app.use('/api', apiRateLimiter);
app.use('/api', csrfProtection);

// 外部LLM APIを呼び出すエンドポイントは課金乱用防止のため追加のレート制限をかける
app.use('/api/convert', llmRateLimiter);
app.use('/api/decode', llmRateLimiter);
app.use('/api/quiz', llmRateLimiter);
app.use('/api/settings/providers', llmRateLimiter);

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'AllEmojiny',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// APIルーター登録
app.use('/api/convert', convertRouter);
app.use('/api/decode', decodeRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/dictionary', dictionaryRouter);
app.use('/api/settings', settingsRouter);

// 本番環境における静的ファイル配信
const rootDir = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const distPath = join(rootDir, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/*splat', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// グローバルエラーハンドラー
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  safeError('Unhandled server error:', err);
  const status = err.status || 500;
  // 4xx（アプリコードが意図的に設定したステータス）はユーザー向けメッセージとして
  // そのまま返すが、5xx（未分類の予期しない内部エラー）はスタック情報や内部ホスト名等の
  // 意図しない情報漏えいを避けるため、汎用メッセージのみを返す
  res.status(status).json({
    error: status < 500 ? (err.message || '不正なリクエストです。') : '内部サーバーエラーが発生しました。',
  });
});

app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 AllEmojiny Server is running on http://${HOST}:${PORT}`);
});

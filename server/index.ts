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
import { apiRateLimiter } from './middleware/security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティ & ミドルウェア
app.use(helmet({
  contentSecurityPolicy: false, // Vite/Reactの開発・画像読み込み互換
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// APIレート制限
app.use('/api', apiRateLimiter);

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
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// グローバルエラーハンドラー
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || '内部サーバーエラーが発生しました。',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AllEmojiny Server is running on http://localhost:${PORT}`);
});

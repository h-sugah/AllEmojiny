import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * 2000文字入力バリデーション（テキスト→絵文字）
 */
export function validateConvertInput(req: Request, res: Response, next: NextFunction) {
  const { text } = req.body;
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'テキストを入力してください。' });
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: '変換するテキストが空です。' });
  }

  if (trimmed.length > 2000) {
    return res.status(400).json({
      error: `入力テキストが上限の2000文字を超えています（現在: ${trimmed.length}文字）。2000文字以内に短縮してください。`,
    });
  }

  // プロンプトインジェクション等の防御的なサニタイズ（制御文字の無害化）
  req.body.text = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  next();
}

/**
 * 絵文字デコード入力バリデーション（絵文字→テキスト）
 */
export function validateDecodeInput(req: Request, res: Response, next: NextFunction) {
  const { emojis } = req.body;
  if (typeof emojis !== 'string') {
    return res.status(400).json({ error: '絵文字列を入力してください。' });
  }

  const trimmed = emojis.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: '絵文字列が空です。' });
  }

  if (trimmed.length > 2000) {
    return res.status(400).json({
      error: `絵文字列が上限の2000文字を超えています（現在: ${trimmed.length}文字）。`,
    });
  }

  req.body.emojis = trimmed;
  next();
}

/**
 * クイズ回答バリデーション（上限400文字）
 */
export function validateQuizAnswerInput(req: Request, res: Response, next: NextFunction) {
  const { answer } = req.body;
  if (typeof answer !== 'string') {
    return res.status(400).json({ error: '回答を入力してください。' });
  }

  const trimmed = answer.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: '回答が空です。' });
  }

  if (trimmed.length > 400) {
    return res.status(400).json({
      error: `回答が上限の400文字を超えています（現在: ${trimmed.length}文字）。400文字以内にまとめてください。`,
    });
  }

  req.body.answer = trimmed;
  next();
}

/**
 * APIレート制限
 */
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分間
  max: 60, // 1分間に最大60リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'リクエスト頻度が高すぎます。少し時間をおいてから再試行してください。' },
});

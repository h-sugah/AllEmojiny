import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
<<<<<<< HEAD
=======
import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

const PORT = process.env.PORT || 3001;

/**
 * このサーバーへのアクセスを許可するオリジン（localhost専用アプリ）
 * CORS設定・CSRF対策の両方で共通利用する
 */
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
];

/**
 * CSRF対策: 状態変更を伴うリクエスト（POST/PUT/PATCH/DELETE）について、
 * Origin（無ければRefererで代替）が許可済みオリジンと一致するか検証する。
 * cors()のOrigin検証と独立した多層防御として、将来的にCORS設定が緩められても
 * localhost以外からの悪意あるフォーム自動送信等によるCSRFを防ぐ。
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return res.status(403).json({ error: 'CSRF対策により、このリクエストは拒否されました。' });
    }
    return next();
  }

  // Originヘッダーが無い場合はRefererで代替検証
  const referer = req.headers.referer;
  if (referer) {
    if (!ALLOWED_ORIGINS.some((o) => referer === o || referer.startsWith(`${o}/`))) {
      return res.status(403).json({ error: 'CSRF対策により、このリクエストは拒否されました。' });
    }
    return next();
  }

  // Origin/Refererの両方が無い場合: ブラウザは通常いずれか（特にOrigin）を必ず送信するため、
  // ここに到達するのは主にcurl等の非ブラウザ利用と想定して許可する。
  // ただしSec-Fetch-Site（ブラウザが自動付与しJSからは偽装できないヘッダー）が
  // 'same-origin'/'none'以外の値で付いている場合は、Referrer-Policy等でOrigin/Refererを
  // 意図的に隠したブラウザ発クロスサイトリクエストの可能性が高いため拒否する。
  const secFetchSite = req.headers['sec-fetch-site'];
  if (typeof secFetchSite === 'string' && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return res.status(403).json({ error: 'CSRF対策により、このリクエストは拒否されました。' });
  }

  next();
}
>>>>>>> 1d87e71 (updated)

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
<<<<<<< HEAD
 * クイズ回答バリデーション（上限400文字）
 */
export function validateQuizAnswerInput(req: Request, res: Response, next: NextFunction) {
  const { answer } = req.body;
=======
 * クイズ問題データ(question)の各文字列フィールドの上限文字数
 * クイズ生成時にAIへ指示している上限（originalTextは400文字等）に合わせて設定
 */
const QUIZ_QUESTION_FIELD_LIMITS: Record<string, number> = {
  id: 100,
  genre: 50,
  emojiString: 200,
  hint: 300,
  originalText: 400,
  sourceTitle: 200,
  explanation: 500,
};

/**
 * クイズ回答バリデーション（回答上限400文字 & 問題データ(question)の型・長さ検証）
 * questionはクライアントから送られてきた値をそのままLLM採点プロンプトに埋め込むため、
 * answerと同様に型・長さを検証しないと任意サイズの文字列を埋め込まれる余地がある
 */
export function validateQuizAnswerInput(req: Request, res: Response, next: NextFunction) {
  const { answer, question } = req.body;
>>>>>>> 1d87e71 (updated)
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

<<<<<<< HEAD
=======
  if (question !== undefined) {
    if (typeof question !== 'object' || question === null || Array.isArray(question)) {
      return res.status(400).json({ error: '問題データの形式が不正です。' });
    }
    for (const [field, limit] of Object.entries(QUIZ_QUESTION_FIELD_LIMITS)) {
      const value = (question as Record<string, unknown>)[field];
      if (value !== undefined && (typeof value !== 'string' || value.length > limit)) {
        return res.status(400).json({
          error: `問題データの${field}が不正です（${limit}文字以内の文字列を指定してください）。`,
        });
      }
    }
  }

>>>>>>> 1d87e71 (updated)
  req.body.answer = trimmed;
  next();
}

/**
<<<<<<< HEAD
 * APIレート制限
=======
 * カスタム辞書登録バリデーション（単語100文字・絵文字50文字を上限）
 */
export function validateDictionaryInput(req: Request, res: Response, next: NextFunction) {
  const { keyword, emoji } = req.body;
  if (typeof keyword !== 'string' || typeof emoji !== 'string') {
    return res.status(400).json({ error: '単語と絵文字を入力してください。' });
  }

  const trimmedKeyword = keyword.trim();
  const trimmedEmoji = emoji.trim();
  if (!trimmedKeyword || !trimmedEmoji) {
    return res.status(400).json({ error: '単語と絵文字を入力してください。' });
  }

  if (trimmedKeyword.length > 100) {
    return res.status(400).json({
      error: `単語が上限の100文字を超えています（現在: ${trimmedKeyword.length}文字）。`,
    });
  }

  if (trimmedEmoji.length > 50) {
    return res.status(400).json({
      error: `絵文字が上限の50文字を超えています（現在: ${trimmedEmoji.length}文字）。`,
    });
  }

  req.body.keyword = trimmedKeyword;
  req.body.emoji = trimmedEmoji;
  next();
}

/**
 * クイズ生成バリデーション（ジャンルの長さ・問題数の範囲を検証）
 * countはプロンプトに直接埋め込まれるため、無検証だとLLM APIコストの
 * 意図しない増大につながる
 */
export function validateQuizGenerateInput(req: Request, res: Response, next: NextFunction) {
  const { genre = 'all', count = 3 } = req.body;

  if (typeof genre !== 'string' || genre.length > 50) {
    return res.status(400).json({ error: 'ジャンルの指定が不正です。' });
  }

  const parsedCount = Number(count);
  if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 10) {
    return res.status(400).json({ error: '問題数は1〜10の整数で指定してください。' });
  }

  req.body.genre = genre;
  req.body.count = parsedCount;
  next();
}

/**
 * リンクローカル/クラウドメタデータ用のIPv4レンジ（例: 169.254.169.254）
 * LM Studio等のLAN内LLMサーバー利用を妨げないよう、プライベートIP全般は許可し、
 * メタデータエンドポイントとして悪用されやすいリンクローカル帯のみブロックする
 */
function isBlockedIpv4(ip: string): boolean {
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some((o) => Number.isNaN(o))) return false;
  const [a, b] = octets;
  return a === 169 && b === 254; // 169.254.0.0/16
}

/**
 * IPv6アドレス文字列（"::"省略記法・IPv4射影アドレスの末尾ドット表記を含む）を
 * 128bitのBigIntに変換する。文字列の前方一致では16進表記のIPv4射影アドレス
 * （例: ::ffff:169.254.169.254 の16進形 ::ffff:a9fe:a9fe）等を見逃すため、
 * レンジ判定は必ずこの数値表現に対して行う。
 */
function parseIpv6ToBigInt(ip: string): bigint | null {
  let addr = ip;

  // 末尾のIPv4ドット10進表記（例: ::ffff:169.254.169.254）を2つの16進グループに変換
  const ipv4TailMatch = addr.match(/(?:^|:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (ipv4TailMatch) {
    const octets = ipv4TailMatch[1].split('.').map(Number);
    if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
      return null;
    }
    const hex1 = ((octets[0] << 8) | octets[1]).toString(16);
    const hex2 = ((octets[2] << 8) | octets[3]).toString(16);
    addr = addr.slice(0, addr.length - ipv4TailMatch[1].length) + hex1 + ':' + hex2;
  }

  const parts = addr.split('::');
  if (parts.length > 2) return null;

  const head = parts[0] ? parts[0].split(':').filter((s) => s.length > 0) : [];
  const tail = parts.length === 2 && parts[1] ? parts[1].split(':').filter((s) => s.length > 0) : [];

  let groups: string[];
  if (parts.length === 2) {
    const missing = 8 - head.length - tail.length;
    if (missing < 0) return null;
    groups = [...head, ...Array(missing).fill('0'), ...tail];
  } else {
    groups = head;
  }
  if (groups.length !== 8) return null;

  let value = 0n;
  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
    value = (value << 16n) | BigInt(parseInt(g, 16));
  }
  return value;
}

function isBlockedIpv6(ip: string): boolean {
  const value = parseIpv6ToBigInt(ip.toLowerCase());
  if (value === null) return false;

  // fe80::/10 リンクローカル（fe80〜febf::）: 上位10bitで判定
  if ((value >> 118n) === 0b1111111010n) return true;

  // fd00:ec2::254 (AWS IMDSv2のIPv6専用アドレス)
  const awsImdsV6 = parseIpv6ToBigInt('fd00:ec2::254');
  if (awsImdsV6 !== null && value === awsImdsV6) return true;

  // ::ffff:0:0/96 のIPv4射影アドレス: 下位32bitを取り出しIPv4判定に委譲
  // （16進表記・ドット10進表記のいずれで書かれていても、ここでは数値としてしか
  //   扱わないため両方の記法を等しく検出できる）
  if ((value >> 32n) === 0xffffn) {
    const ipv4 = value & 0xffffffffn;
    const octets = [
      Number((ipv4 >> 24n) & 0xffn),
      Number((ipv4 >> 16n) & 0xffn),
      Number((ipv4 >> 8n) & 0xffn),
      Number(ipv4 & 0xffn),
    ];
    return isBlockedIpv4(octets.join('.'));
  }

  return false;
}

function isBlockedAddress(addr: string): boolean {
  const version = isIP(addr);
  if (version === 4) return isBlockedIpv4(addr);
  if (version === 6) return isBlockedIpv6(addr);
  return false;
}

/**
 * LLMプロバイダーのbaseURL検証
 * http/https の妥当なURLのみ許可し、任意スキーム（file:, data: 等）や不正な値による
 * データ持ち出し経路の悪用を防ぐ（多層防御。CORS/CSRF制限が主たる防御線）。
 * さらにSSRF対策として、リンクローカル帯（クラウドメタデータエンドポイント等）への
 * 接続はホスト名がIPリテラルの場合・DNS解決結果の場合の両方でブロックする。
 * ただしDNSリバインディング（検証後にDNS応答を書き換える攻撃）までは防げない
 * 簡易的な多層防御である点に留意（本アプリはローカル単一ユーザー利用が前提のため）。
 */
export async function isValidProviderUrl(value: string): Promise<boolean> {
  if (typeof value !== 'string' || value.length === 0 || value.length > 500) {
    return false;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(hostname)) {
    return !isBlockedAddress(hostname);
  }

  try {
    const records = await lookup(hostname, { all: true, verbatim: true });
    return !records.some((r) => isBlockedAddress(r.address));
  } catch {
    // 名前解決に失敗した場合は、後続の接続処理自体がエラーになるだけなので許可する
    return true;
  }
}

/**
 * APIレート制限（全エンドポイント共通）
>>>>>>> 1d87e71 (updated)
 */
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分間
  max: 60, // 1分間に最大60リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'リクエスト頻度が高すぎます。少し時間をおいてから再試行してください。' },
});
<<<<<<< HEAD
=======

/**
 * 外部LLM APIを呼び出すエンドポイント専用の追加レート制限
 * 変換・デコード・クイズ生成/採点は都度LLM課金が発生するため、
 * 共通のapiRateLimiterより厳しい閾値で乱用によるコスト増大を抑制する
 */
export const llmRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分間
  max: 20, // 1分間に最大20リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI呼び出しの頻度が高すぎます。少し時間をおいてから再試行してください。' },
});
>>>>>>> 1d87e71 (updated)

const SECRET_PATTERNS: RegExp[] = [
  /sk-[a-zA-Z0-9_-]{10,}/g, // OpenAI/Anthropic系トークン
  /AIza[0-9A-Za-z_-]{10,}/g, // Google APIキー
  /Bearer\s+[a-zA-Z0-9._-]{10,}/gi,
  /("?(?:authorization|x-api-key|api[_-]?key)"?\s*[:=]\s*"?)[a-zA-Z0-9._-]{10,}("?)/gi,
];

function redact(value: string): string {
  let out = value;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, (_match, prefix, suffix) =>
      prefix !== undefined ? `${prefix}[REDACTED]${suffix ?? ''}` : '[REDACTED]'
    );
  }
  return out;
}

function toSafeString(value: unknown): string {
  if (value instanceof Error) {
    return redact(`${value.name}: ${value.message}${value.stack ? `\n${value.stack}` : ''}`);
  }
  if (typeof value === 'string') return redact(value);
  try {
    return redact(JSON.stringify(value));
  } catch {
    return redact(String(value));
  }
}

/**
 * APIトークン等の機微情報が誤ってログ（コンソール/ログファイル）に残ることを防ぐため、
 * 既知のシークレットパターンをマスクしてから出力する。LLM SDKやfetchの例外メッセージには
 * 稀にリクエスト内容（Authorizationヘッダー等）が含まれることがあるための多層防御。
 */
export function safeError(label: string, value: unknown) {
  console.error(label, toSafeString(value));
}

export function safeWarn(label: string, value: unknown) {
  console.warn(label, toSafeString(value));
}

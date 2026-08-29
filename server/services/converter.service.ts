import { getProvider } from './llm/llm.factory.js';
import { ProviderConfig } from './llm/provider.interface.js';
import { dictionaryService } from './dictionary.service.js';

export type ConversionMode = 'exact' | 'forced' | 'chaos';

export interface Stage1Analysis {
  subject?: string;
  time?: string;
  place?: string;
  actions?: string[];
  emotion?: string;
  abstract_concepts?: string[];
  flow_summary?: string;
}

export interface EmojiBreakdownItem {
  emoji: string;
  meaning: string;
  note?: string;
}

export interface ConvertResult {
  emojis: string;
  mode: ConversionMode;
  breakdown: EmojiBreakdownItem[];
  pipeline: {
    stage1Analysis?: Stage1Analysis;
    stage2DictionaryMatches?: Record<string, string>;
    stage3RawResponse?: string;
  };
}

export class ConverterService {
  /**
   * テキストを3段階ハイブリッドパイプラインで絵文字列に変換する
   */
  async convert(
    text: string,
    mode: ConversionMode,
    config: ProviderConfig,
    usePipeline = true,
    signal?: AbortSignal
  ): Promise<ConvertResult> {
    const provider = getProvider(config.id);

    // テキスト辞書マッチング（Stage 2の基礎）
    const dictMatches = dictionaryService.matchText(text);

    let stage1Data: Stage1Analysis | undefined;
    let finalEmojis = '';
    let breakdown: EmojiBreakdownItem[] = [];
    let rawResponse = '';

    if (usePipeline) {
      // ===== STAGE 1: 意味・構文解析 =====
      const stage1Prompt = `以下の日本語テキストの意味構造を分析し、指定のJSONフォーマットのみを出力してください。
他の前置きや挨拶、マークダウンのバッククォート等の余分な文字は一切出力しないでください。

【入力テキスト】
${text}

【出力JSONスキーマ】
{
  "subject": "主語・登場人物（例: 私、上司、犬）",
  "time": "時間・時系列（例: 今日、昨日、朝、来週、締切直前）",
  "place": "場所・環境（例: 会社、公園、自宅、カフェ）",
  "actions": ["行動や出来事のリスト（時系列順）"],
  "emotion": "感情や心理状態（例: 疲れた、嬉しい、緊張、怒り、カオス）",
  "abstract_concepts": ["絵文字に直接ない抽象概念や重要語句（例: 脆弱性、人工知能の進化、赤字）"],
  "flow_summary": "全体の流れの要約"
}`;

      try {
        const stage1Res = await provider.generateText({
          config,
          prompt: stage1Prompt,
          temperature: 0.3,
          maxTokens: 1000,
          signal,
        });

        const jsonMatch = stage1Res.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          stage1Data = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn('Stage 1 構文解析スキップ/失敗:', err);
      }
    }

    // ===== STAGE 3: モード別プロンプトによる絵文字シーケンス生成 & 内訳取得 =====
    const modeInstructions: Record<ConversionMode, string> = {
      exact: `【変換モード: 正確モード (Exact Mode)】
- できる限り元の文章の意味と時系列を正確に維持してください。
- 順序関係は ➡️ や ⬇️ 等の記号を使い、明確に表現してください。
- 各要素に最も直感的で分かりやすい絵文字を割り当ててください。`,
      forced: `【変換モード: 強引モード (Forced Mode)】
- 多少意味が強引になっても構いません。文章を一切使わず、必ず絵文字と記号だけで全てを表現してください。
- 直接一致する絵文字が存在しない概念（例: 「脆弱性」→🕳️🔓、「分析」→🔍🧠）も、比喩・連想・視覚的イメージを駆使して無理矢理絵文字化してください。
- 解読する楽しさがある、インパクトのある構成にしてください。`,
      chaos: `【変換モード: カオスモード (Chaos Mode)】
- 意味を多少犠牲にしても、最も面白く、シュールでクスッと笑える絵文字列に変換してください。
- ドラマチックで大げさな感情表現や、シュールな連想（例: 締切→⏰🚨😱💦📄❌🙋‍♂️🛌😴）を大胆に取り入れてください。`,
    };

    const dictContext = Object.keys(dictMatches).length > 0
      ? `\n【参考絵文字辞書】\n${Object.entries(dictMatches).map(([k, v]) => `${k} → ${v}`).join('\n')}`
      : '';

    const stage1Context = stage1Data
      ? `\n【事前意味解析結果】\n${JSON.stringify(stage1Data, null, 2)}`
      : '';

    const stage3Prompt = `あなたはテキストを強制的に絵文字列で表現する高度な絵文字変換エンジン「AllEmojiny（全部絵文字に〜）」です。

以下の【入力テキスト】を、文章を一切使わず、絵文字（および矢印などの視覚記号）だけで完璧に表現してください。

${modeInstructions[mode]}
${dictContext}
${stage1Context}

【重要なルール】
1. 出力は以下のJSON形式のみを出力してください。
2. emojisフィールドには、日本語や英字などの通常のテキストを一切含めず、純粋な絵文字と記号（➡️, ⬇️, ❗, ❓, ⚡など）のみで構成してください。
3. breakdown配列には、使った絵文字（または絵文字グループ）と、それが表す意味・単語の対応表を含めてください。

【出力JSONフォーマット】
{
  "emojis": "🙋‍♂️📅🏢😵‍💫💻📄⏰➡️🏠🚪🍺😋😊✨",
  "breakdown": [
    { "emoji": "🙋‍♂️", "meaning": "私", "note": "主人公" },
    { "emoji": "📅🏢", "meaning": "今日会社で", "note": "場所と時間" },
    { "emoji": "😵‍💫💻📄⏰", "meaning": "忙しく仕事をした", "note": "疲労と業務" },
    { "emoji": "➡️🏠🚪", "meaning": "帰宅後", "note": "移動" },
    { "emoji": "🍺😋", "meaning": "ビールを飲んで", "note": "飲食" },
    { "emoji": "😊✨", "meaning": "幸せな気分になった", "note": "感情" }
  ]
}

【入力テキスト】
${text}`;

    rawResponse = await provider.generateText({
      config,
      prompt: stage3Prompt,
      systemPrompt: 'あなたはテキストを強制的に絵文字だけで表現する専門AIです。必ず指定されたJSONフォーマットのみを出力してください。',
      temperature: mode === 'chaos' ? 0.9 : mode === 'forced' ? 0.7 : 0.4,
      maxTokens: 2048,
      signal,
    });

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        finalEmojis = parsed.emojis || '';
        breakdown = Array.isArray(parsed.breakdown) ? parsed.breakdown : [];
      }
    } catch (e) {
      console.warn('JSONパース失敗。フォールバック抽出を試行します:', e);
    }

    // JSONパースが失敗した場合のフォールバック
    if (!finalEmojis) {
      // 絵文字と矢印等のみを取り出す
      const emojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}➡️⬇️⬆️⬅️↗️↘️↙️↖️↔️↕️🔄⚡❗❓✨💥💤🔥]+/gu;
      const matches = rawResponse.match(emojiRegex);
      if (matches && matches.length > 0) {
        finalEmojis = matches.join(' ');
      } else {
        finalEmojis = rawResponse.replace(/[a-zA-Z0-9\sぁ-んァ-ヶー一-龠]/g, '').trim() || '❓🤔';
      }
    }

    return {
      emojis: finalEmojis.trim(),
      mode,
      breakdown,
      pipeline: {
        stage1Analysis: stage1Data,
        stage2DictionaryMatches: dictMatches,
        stage3RawResponse: rawResponse,
      },
    };
  }
}

export const converterService = new ConverterService();

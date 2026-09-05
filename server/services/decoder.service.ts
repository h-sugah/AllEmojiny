import { getProvider } from './llm/llm.factory.js';
import { ProviderConfig } from './llm/provider.interface.js';
import { PROMPT_INJECTION_GUARD } from './promptGuard.js';
import { safeWarn } from '../utils/safeLog.js';

export interface DecodeResult {
  text: string;
  summary: string;
  interpretations: {
    emojiSegment: string;
    decodedMeaning: string;
  }[];
  rawResponse?: string;
}

export class DecoderService {
  /**
   * 絵文字列を解釈して自然な日本語テキスト文章に逆変換する
   */
  async decode(
    emojiString: string,
    config: ProviderConfig,
    signal?: AbortSignal
  ): Promise<DecodeResult> {
    const provider = getProvider(config.id);

    const prompt = `あなたは「絵文字暗号解読の達人」です。
ユーザーから提供された【絵文字列】を注意深く観察し、そこに込められた意味、登場人物、時間経過、行動、感情、起承転結を読み解いて、自然で読み応えのある日本語文章に復元（逆変換）してください。

【絵文字列】
${emojiString}

【指示】
1. 単なる絵文字の名前の羅列ではなく、絵文字が表しているストーリーや状況を想像し、自然で滑らかな日本語文章を作成してください。
2. 矢印（➡️, ⬇️）や時計、表情、記号などのコンテキストをしっかりと汲み取ってください。
3. 出力は必ず以下のJSONフォーマットのみを出力してください。余分な挨拶やバッククォート等のマークダウンは含めないでください。

【出力JSONフォーマット】
{
  "text": "復元された完全な日本語文章（例: 今日は朝から会社で忙しく仕事をしましたが、帰宅後に冷たいビールを飲んで幸せな気分になりました。）",
  "summary": "一言要約（例: 多忙な仕事終わりの至福の一杯）",
  "interpretations": [
    { "emojiSegment": "🙋‍♂️📅🏢", "decodedMeaning": "私が今日会社で" },
    { "emojiSegment": "😵‍💫💻📄⏰", "decodedMeaning": "忙しく仕事をこなす" },
    { "emojiSegment": "➡️🏠🚪", "decodedMeaning": "帰宅して" },
    { "emojiSegment": "🍺😋😊✨", "decodedMeaning": "ビールを飲んで幸せな気分になる" }
  ]
}`;

    const rawResponse = await provider.generateText({
      config,
      prompt,
      systemPrompt: `あなたは絵文字から文章を復元する専門家です。必ず指定されたJSONフォーマットのみを出力してください。${PROMPT_INJECTION_GUARD}`,
      temperature: 0.6,
      maxTokens: 2048,
      signal,
    });

    let decodedText = '';
    let summary = '';
    let interpretations: { emojiSegment: string; decodedMeaning: string }[] = [];

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        decodedText = parsed.text || '';
        summary = parsed.summary || '';
        interpretations = Array.isArray(parsed.interpretations) ? parsed.interpretations : [];
      }
    } catch (e) {
      safeWarn('デコードJSONパース失敗:', e);
    }

    if (!decodedText) {
      decodedText = rawResponse.trim();
    }

    return {
      text: decodedText,
      summary,
      interpretations,
      rawResponse,
    };
  }
}

export const decoderService = new DecoderService();

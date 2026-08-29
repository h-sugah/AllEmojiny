import { getProvider } from './llm/llm.factory.js';
import { ProviderConfig } from './llm/provider.interface.js';

export interface QuizQuestion {
  id: string;
  emojiString: string;
  genre: string;
  hint: string;
  originalText: string;
  sourceTitle: string;
  explanation: string;
}

export interface QuizEvaluation {
  isCorrect: boolean;
  similarityScore: number; // 0 to 100
  feedback: string;
  originalText: string;
  sourceTitle: string;
  explanation: string;
  praiseMessage?: string;
}

// 高品質な厳選プリセットクイズ（オフライン/高速開始用）
const PRESET_QUIZ_POOL: QuizQuestion[] = [
  {
    id: 'preset-1',
    genre: '文学の名作',
    emojiString: '🐈❓👤❌🏷️❌',
    hint: '明治時代の超有名小説の冒頭の一文です。',
    originalText: '吾輩は猫である。名前はまだ無い。',
    sourceTitle: '夏目漱石『吾輩は猫である』',
    explanation: '🐈(猫) ❓(である) 👤❌(人ではない自分) 🏷️❌(名前はまだ無い)',
  },
  {
    id: 'preset-2',
    genre: 'ことわざ・格言',
    emojiString: '🐵➡️🌳🍂⬇️😱',
    hint: '得意なことでも時には失敗するという意味のことわざです。',
    originalText: '猿も木から落ちる',
    sourceTitle: '日本のことわざ',
    explanation: '🐵(猿も) 🌳(木から) 🍂⬇️(落ちる) 😱',
  },
  {
    id: 'preset-3',
    genre: '童話・昔話',
    emojiString: '👵🧺🌊🍑➡️👶🍑👦⚔️👹🏝️🏆',
    hint: '川から流れてきた大きな果物から生まれた男の子の冒険物語です。',
    originalText: 'おばあさんが川で洗濯をしていると、大きな桃が流れてきて、桃から生まれた桃太郎が鬼ヶ島へ鬼退治に行きました。',
    sourceTitle: '日本昔話『桃太郎』',
    explanation: '👵🧺🌊(おばあさんが川で洗濯) 🍑(桃が流れてきて) 👶🍑👦(桃太郎誕生) ⚔️👹🏝️(鬼ヶ島へ鬼退治) 🏆',
  },
  {
    id: 'preset-4',
    genre: '名言・格言',
    emojiString: '⏳💨💸➡️⌛💎🚫⏰',
    hint: '時間は何よりも貴重であるという教訓です。',
    originalText: '時は金なり',
    sourceTitle: 'ベンジャミン・フランクリンの名言',
    explanation: '⏳(時) 💨💸(金) ⌛💎(貴重な時間)',
  },
  {
    id: 'preset-5',
    genre: '文学の名作',
    emojiString: '🏃💨😡👑🤝🏃‍♂️💨🌅🏁',
    hint: '友のために命をかけて走る男の友情物語です。',
    originalText: 'メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。',
    sourceTitle: '太宰治『走れメロス』',
    explanation: '🏃💨(走るメロス) 😡👑(王に激怒) 🤝🏃‍♂️💨(友のために走る)',
  }
];

export class QuizService {
  /**
   * 3問のクイズセットを生成（AI生成またはプリセット＋AI）
   */
  async generateQuizSet(
    genre: string,
    config: ProviderConfig,
    count = 3,
    signal?: AbortSignal
  ): Promise<QuizQuestion[]> {
    const provider = getProvider(config.id);

    const genrePrompt = genre && genre !== 'all' ? `「${genre}」のジャンルから` : '日本の有名文学、ことわざ、昔話・童話、世界の名言、有名なアニメ・映画台詞などから';

    const prompt = `あなたは「絵文字列クイズマスター」です。
誰でも一度は聞いたことがある有名な文章や物語、ことわざ、名言を【${count}問】選び、それぞれを無理矢理絵文字列（絵文字と記号のみ）で表現したクイズを作成してください。

【ジャンル指定】
${genrePrompt}

【要件】
1. 問題文の元のテキスト（originalText）は400文字以内の有名な文章・一節にしてください。
2. emojiString は絵文字と記号（➡️, ⬇️など）だけで構成し、特徴を捉えた面白い絵文字列にしてください。
3. ユーザーがヒントを元に推測できる適切な難易度（簡単すぎず難しすぎず）にしてください。
4. 必ず以下のJSON配列フォーマットのみを出力してください。

【出力JSONフォーマット】
[
  {
    "id": "q1",
    "genre": "文学の名作",
    "emojiString": "🐈❓👤❌🏷️❌",
    "hint": "明治時代の超有名小説の冒頭です",
    "originalText": "吾輩は猫である。名前はまだ無い。",
    "sourceTitle": "夏目漱石『吾輩は猫である』",
    "explanation": "🐈(猫) 🏷️❌(名前はまだ無い)"
  }
]`;

    try {
      const rawResponse = await provider.generateText({
        config,
        prompt,
        systemPrompt: 'あなたは絵文字クイズを作成する専門AIです。必ず有効なJSON配列のみを出力してください。',
        temperature: 0.8,
        maxTokens: 2048,
        signal,
      });

      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const list = JSON.parse(jsonMatch[0]) as QuizQuestion[];
        if (Array.isArray(list) && list.length >= count) {
          return list.slice(0, count).map((item, idx) => ({
            ...item,
            id: item.id || `ai-q-${Date.now()}-${idx}`,
          }));
        }
      }
    } catch (e) {
      console.warn('AIクイズ生成失敗、プリセットから出題します:', e);
    }

    // フォールバック: シャッフルしてプリセットから count 問返す
    const shuffled = [...PRESET_QUIZ_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * ユーザーの回答が元の文章と近似しているかをAIでセマンティック判定
   */
  async evaluateAnswer(
    question: QuizQuestion,
    userAnswer: string,
    config: ProviderConfig,
    signal?: AbortSignal
  ): Promise<QuizEvaluation> {
    const provider = getProvider(config.id);
    const cleanedAnswer = userAnswer.trim();

    if (!cleanedAnswer) {
      return {
        isCorrect: false,
        similarityScore: 0,
        feedback: '回答が入力されていません。',
        originalText: question.originalText,
        sourceTitle: question.sourceTitle,
        explanation: question.explanation,
      };
    }

    const prompt = `あなたは絵文字クイズの採点者です。
ユーザーが絵文字列を見て推測した【ユーザーの回答】が、【正解の元文章/作品】と意味的・内容的に近似しているか判定してください。

【絵文字列】: ${question.emojiString}
【出題目・作品】: ${question.sourceTitle}
【正解の元文章】: ${question.originalText}

【ユーザーの回答】: ${cleanedAnswer}

【判定基準】
1. 完全一致でなくても、作品名、主人公、主要な行動、言いたいこと、ことわざの核心などが合っていれば「正解」と判定してください（寛容に評価してください）。
2. similarityScore は 0〜100 の数値で評価してください（70点以上なら isCorrect: true）。
3. ユーザーを励ます温かいフィードバックコメント（feedback）を書いてください。
4. 正解の場合、全問正解者向けの褒め言葉メッセージ（praiseMessage）も含めてください。

【出力JSONフォーマット】
{
  "isCorrect": true,
  "similarityScore": 95,
  "feedback": "お見事！『吾輩は猫である』の冒頭と見事に一致しています！",
  "praiseMessage": "素晴らしい直感力と洞察力です！絵文字の神様も脱帽！"
}`;

    try {
      const rawResponse = await provider.generateText({
        config,
        prompt,
        systemPrompt: 'あなたは絵文字クイズの採点AIです。必ず指定のJSONフォーマットのみを出力してください。',
        temperature: 0.2,
        maxTokens: 1000,
        signal,
      });

      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const res = JSON.parse(jsonMatch[0]);
        const score = typeof res.similarityScore === 'number' ? res.similarityScore : (res.isCorrect ? 85 : 40);
        const isCorrect = typeof res.isCorrect === 'boolean' ? res.isCorrect : score >= 70;

        return {
          isCorrect,
          similarityScore: score,
          feedback: res.feedback || (isCorrect ? '正解です！お見事！' : '惜しい！もう少しでした。'),
          originalText: question.originalText,
          sourceTitle: question.sourceTitle,
          explanation: question.explanation,
          praiseMessage: res.praiseMessage,
        };
      }
    } catch (e) {
      console.warn('AI判定失敗、簡易判定フォールバックを実行:', e);
    }

    // フォールバック判定（キーワード含有率）
    const orig = question.originalText.toLowerCase();
    const title = question.sourceTitle.toLowerCase();
    const ans = cleanedAnswer.toLowerCase();
    const isMatch = orig.includes(ans) || ans.includes(orig) || title.includes(ans) || ans.includes(title);

    return {
      isCorrect: isMatch,
      similarityScore: isMatch ? 85 : 30,
      feedback: isMatch ? 'お見事！正解です！' : '残念、不正解です。元の文章を確認してみましょう。',
      originalText: question.originalText,
      sourceTitle: question.sourceTitle,
      explanation: question.explanation,
      praiseMessage: '素晴らしいひらめきです！',
    };
  }
}

export const quizService = new QuizService();

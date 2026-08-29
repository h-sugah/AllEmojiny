import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Copy,
  Lightbulb,
  Check
} from 'lucide-react';
import { QuizQuestion, QuizEvaluation, ProviderId } from '../types';
import { api } from '../services/api';

interface QuizViewProps {
  activeProvider: ProviderId;
  onShowMessage: (msg: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  activeProvider,
  onShowMessage,
}) => {
  const [genre, setGenre] = useState('all');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<(QuizEvaluation | null)[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<QuizEvaluation | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // 初回クイズセット読み込み
  const startNewQuiz = async (selectedGenre = genre) => {
    setIsLoading(true);
    setQuizFinished(false);
    setCurrentIndex(0);
    setUserAnswer('');
    setEvaluations([]);
    setCurrentEvaluation(null);
    setShowHint(false);

    try {
      const res = await api.generateQuiz(selectedGenre, 3, activeProvider);
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setEvaluations(new Array(res.questions.length).fill(null));
        onShowMessage('新しい3問のクイズを開始しました！');
      } else {
        onShowMessage('クイズの取得に失敗しました。再試行してください。');
      }
    } catch (err: any) {
      onShowMessage(`クイズ生成エラー: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startNewQuiz();
  }, [activeProvider]);

  const currentQ = questions[currentIndex];

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) {
      onShowMessage('推測したテキスト文章を入力してください。');
      return;
    }
    if (!currentQ) return;

    setIsEvaluating(true);
    try {
      const res = await api.evaluateQuiz({
        question: currentQ,
        answer: userAnswer,
        providerId: activeProvider,
      });

      const evalResult = res.evaluation;
      setCurrentEvaluation(evalResult);

      const nextEvals = [...evaluations];
      nextEvals[currentIndex] = evalResult;
      setEvaluations(nextEvals);

      if (evalResult.isCorrect) {
        // 小さな祝福エフェクト
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err: any) {
      onShowMessage(`回答判定エラー: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setCurrentEvaluation(null);
      setShowHint(false);
    } else {
      // クイズ終了
      setQuizFinished(true);
      const correctCount = evaluations.filter(e => e?.isCorrect).length;
      if (correctCount === questions.length) {
        // 全問正解ファンファーレ！
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
        });
      }
    }
  };

  const correctCount = evaluations.filter(e => e?.isCorrect).length;
  const isAllCorrect = correctCount === questions.length && questions.length > 0;

  const handleShareResult = async () => {
    const symbols = evaluations.map(e => e?.isCorrect ? '🟩' : '🟥').join('');
    const shareText = `【全部絵文字に〜 AllEmojiny】絵文字列クイズに挑戦！\nスコア: ${correctCount} / ${questions.length} 正解 ${symbols}\n#AllEmojiny #絵文字クイズ`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
      onShowMessage('結果をクリップボードにコピーしました！');
    } catch {
      onShowMessage('コピーに失敗しました。');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span className="text-2xl">🎮</span> 絵文字列クイズ (全3問)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              AIが有名な文章やことわざを絵文字だけで表現しました！<strong className="text-emerald-400">元の文章を推測して全問正解を目指そう！</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                startNewQuiz(e.target.value);
              }}
              disabled={isLoading}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">全ジャンルから出題</option>
              <option value="文学の名作">文学の名作</option>
              <option value="ことわざ・格言">ことわざ・格言</option>
              <option value="童話・昔話">童話・昔話</option>
              <option value="世界の名言">世界の名言</option>
            </select>

            <button
              onClick={() => startNewQuiz(genre)}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>新しく始める</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">AIが絵文字列クイズを厳選・生成中...</p>
        </div>
      ) : quizFinished ? (
        /* クイズ終了結果画面 */
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-10 text-center space-y-6 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center mx-auto shadow-xl text-5xl animate-bounce-soft">
            {isAllCorrect ? '👑' : correctCount > 0 ? '🎉' : '🌱'}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isAllCorrect ? '全問正解！パーフェクト達成！' : `クイズ完了！ 正解数: ${correctCount} / ${questions.length}`}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              {isAllCorrect
                ? 'お見事！絵文字のニュアンスを完璧に見抜く圧倒的な洞察力と感性をお持ちです！'
                : correctCount > 0
                ? '素晴らしい挑戦でした！絵文字の比喩表現をしっかりと捉えられています！'
                : '惜しい！絵文字の暗号解読は奥が深いですね。もう一度挑戦してみましょう！'}
            </p>
          </div>

          {/* 各問のレビュー */}
          <div className="space-y-3 max-w-xl mx-auto text-left">
            {questions.map((q, i) => {
              const ev = evaluations[i];
              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                    ev?.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                  }`}
                >
                  <span className="text-lg mt-0.5">{ev?.isCorrect ? '✅' : '❌'}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">第{i + 1}問 ({q.sourceTitle})</span>
                      <span className="font-mono">{ev?.similarityScore ?? 0}点</span>
                    </div>
                    <p className="text-sm tracking-wider">{q.emojiString}</p>
                    <p className="text-[11px] text-slate-300">正解: {q.originalText}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => startNewQuiz(genre)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>もう一度プレイする</span>
            </button>

            <button
              onClick={handleShareResult}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedShare ? 'コピー完了！' : '結果をシェアする'}</span>
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* クイズ問題画面 */
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-8 shadow-2xl space-y-6">
          {/* 進捗ステータスバー */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                第 {currentIndex + 1} 問 / 全 {questions.length} 問
              </span>
              <span className="text-xs text-slate-400">ジャンル: {currentQ.genre}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentIndex
                      ? 'bg-amber-400 scale-125 ring-2 ring-amber-400/40'
                      : evaluations[i]?.isCorrect
                      ? 'bg-emerald-500'
                      : evaluations[i] !== null && !evaluations[i]?.isCorrect
                      ? 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 絵文字列出題カード */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 text-center space-y-3 shadow-inner">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              ▼ この絵文字列が表している有名な文章は何でしょう？
            </span>
            <p className="text-3xl sm:text-5xl leading-relaxed tracking-widest select-all py-2 animate-pulse-glow">
              {currentQ.emojiString}
            </p>
          </div>

          {/* ヒントアコーディオン */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 text-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? '▲ ヒントを隠す' : '💡 ヒントを見る'}</span>
              </button>
              {showHint && <span className="text-slate-400">{currentQ.hint}</span>}
            </div>
          </div>

          {/* 回答入力欄 */}
          {!currentEvaluation ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    あなたの推測文章を入力 (最大400文字)
                  </label>
                  <span className="text-xs font-mono text-slate-400">
                    {userAnswer.length} / 400
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="例: 吾輩は猫である。名前はまだ無い。"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
                />
              </div>

              <button
                type="button"
                onClick={handleAnswerSubmit}
                disabled={isEvaluating || !userAnswer.trim()}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isEvaluating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-emerald-400 rounded-full animate-spin" />
                    <span>AIが回答を採点中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>回答を提出して採点！</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* 採点結果表示カード */
            <div className="space-y-4">
              <div
                className={`p-5 rounded-2xl border text-sm space-y-3 ${
                  currentEvaluation.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-base sm:text-lg">
                    {currentEvaluation.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <span>正解！ お見事です！</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-rose-400" />
                        <span>惜しい！ 不正解です</span>
                      </>
                    )}
                  </div>
                  <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700">
                    近似度: {currentEvaluation.similarityScore} 点
                  </span>
                </div>

                <p className="text-xs sm:text-sm">{currentEvaluation.feedback}</p>

                {currentEvaluation.praiseMessage && currentEvaluation.isCorrect && (
                  <p className="text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/40 p-2 rounded-lg">
                    ✨ {currentEvaluation.praiseMessage}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-200">
                  <p><strong>出題目・作品:</strong> {currentEvaluation.sourceTitle}</p>
                  <p><strong>正解の元の文章:</strong> {currentEvaluation.originalText}</p>
                  <p className="text-slate-400"><strong>絵文字の解説:</strong> {currentEvaluation.explanation}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
              >
                <span>{currentIndex < questions.length - 1 ? '次の問題へ進む' : '結果発表を見る！'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

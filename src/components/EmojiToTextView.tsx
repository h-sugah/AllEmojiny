import React, { useState } from 'react';
import {
  FileSearch,
  Copy,
  Check,
  Zap,
  Info,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { DecodeResponse, ProviderId } from '../types';
import { api } from '../services/api';
import { DECODE_PRESETS } from '../utils/presets';
import { EmojiPalette } from './EmojiPalette';

interface EmojiToTextViewProps {
  activeProvider: ProviderId;
  onShowMessage: (msg: string) => void;
}

export const EmojiToTextView: React.FC<EmojiToTextViewProps> = ({
  activeProvider,
  onShowMessage,
}) => {
  const [emojis, setEmojis] = useState('🙋‍♂️📅🏢😵‍💫💻📄⏰➡️🏠🚪🍺😋😊✨');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DecodeResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDecode = async () => {
    if (!emojis.trim()) {
      onShowMessage('解読したい絵文字列を入力してください。');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.decode({
        emojis,
        providerId: activeProvider,
      });
      setResult(res);
      onShowMessage('絵文字の文章復元が完了しました！');
    } catch (err: any) {
      onShowMessage(`デコードエラー: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setEmojis(prev => prev + emoji);
  };

  const handleCopyText = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowMessage('復元されたテキストをコピーしました！');
    } catch {
      onShowMessage('コピーに失敗しました。');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 説明ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span className="text-2xl">🔍</span> 絵文字列 → テキスト文章 逆変換
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              絵文字列をAIが読み解き、<strong className="text-blue-400">どのような状況・物語・意味なのかを自然な日本語文章に復元</strong>します。
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 self-start sm:self-center">
            AI: {activeProvider.toUpperCase()}
          </span>
        </div>
      </div>

      {/* プリセット例 */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>解読テスト用プリセット</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DECODE_PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setEmojis(p.emojis);
                onShowMessage(`プリセット「${p.title}」をセットしました。`);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 入力 & 出力グリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 絵文字入力側 */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                絵文字列を入力
              </label>
              <button
                type="button"
                onClick={() => setEmojis('')}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                クリア
              </button>
            </div>

            <textarea
              rows={4}
              value={emojis}
              onChange={(e) => setEmojis(e.target.value)}
              placeholder="ここに絵文字を入力または下のパレットからクリック..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-lg sm:text-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-y leading-relaxed font-sans"
            />

            {/* 絵文字クイックパレット */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">
                クイック絵文字パレット (クリックで挿入)
              </label>
              <EmojiPalette onSelectEmoji={handleAddEmoji} />
            </div>

            {/* 逆変換実行ボタン */}
            <button
              type="button"
              onClick={handleDecode}
              disabled={isLoading || !emojis.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-blue-500/20 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  <span>AIが絵文字を解読中...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  <span>文章を復元（逆変換）する</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 復元テキスト出力側 */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4 min-h-[420px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>AI復元テキスト</span>
                </label>
                {result && (
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'コピー完了！' : '文章をコピー'}</span>
                  </button>
                )}
              </div>

              {result ? (
                <div className="space-y-4">
                  {/* 一言要約 */}
                  {result.summary && (
                    <div className="bg-blue-950/40 border border-blue-800/40 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 text-blue-200 font-semibold">
                      <span className="text-sm">💡</span>
                      <span>要約: {result.summary}</span>
                    </div>
                  )}

                  {/* 復元された本文 */}
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-blue-500/30 shadow-inner">
                    <p className="text-sm sm:text-base leading-relaxed text-slate-100 select-all font-sans whitespace-pre-wrap">
                      {result.text}
                    </p>
                  </div>

                  {/* 各絵文字セグメントの解読内訳 */}
                  {result.interpretations && result.interpretations.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                        <span>AIによる絵文字ブロックの解釈</span>
                      </label>
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {result.interpretations.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                          >
                            <span className="text-lg select-all shrink-0">{item.emojiSegment}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span className="text-slate-300">{item.decodedMeaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl">
                    🔍
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400">復元結果がここに表示されます</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      左の入力欄に絵文字列を入力して「文章を復元する」ボタンを押してください。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

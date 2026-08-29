import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Zap,
  Flame,
  Target,
  Layers,
  Info
} from 'lucide-react';
import { ConversionMode, ConvertResponse, ProviderId } from '../types';
import { api } from '../services/api';
import { PRESET_EXAMPLES, PresetExample } from '../utils/presets';
import { PipelineInspector } from './PipelineInspector';

interface TextToEmojiViewProps {
  activeProvider: ProviderId;
  onShowMessage: (msg: string) => void;
}

export const TextToEmojiView: React.FC<TextToEmojiViewProps> = ({
  activeProvider,
  onShowMessage,
}) => {
  const [inputText, setInputText] = useState(
    '私は今日、会社でとても忙しく仕事をしましたが、帰宅後にビールを飲んで幸せな気分になりました。'
  );
  const [mode, setMode] = useState<ConversionMode>('forced');
  const [usePipeline, setUsePipeline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = async () => {
    if (!inputText.trim()) {
      onShowMessage('変換するテキストを入力してください。');
      return;
    }
    if (inputText.length > 2000) {
      onShowMessage('テキストは2000文字以内にしてください。');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.convert({
        text: inputText,
        mode,
        providerId: activeProvider,
        usePipeline,
      });
      setResult(res);
      onShowMessage('絵文字への変換が完了しました！');
    } catch (err: any) {
      onShowMessage(`変換エラー: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (preset: PresetExample) => {
    setInputText(preset.text);
    setMode(preset.recommendedMode);
    onShowMessage(`例文「${preset.title}」をセットしました。`);
  };

  const handleCopy = async () => {
    if (!result?.emojis) return;
    try {
      await navigator.clipboard.writeText(result.emojis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowMessage('絵文字列をクリップボードにコピーしました！');
    } catch {
      onShowMessage('コピーに失敗しました。');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 説明ヘッダー */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span className="text-2xl">📝</span> テキスト文章 → 絵文字列 変換
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              入力した文章の意味をAIが深く解釈し、<strong className="text-amber-400">文字を一切使わず絵文字だけで表現</strong>します。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
              AI: {activeProvider.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* プリセット例文 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ワンクリックで試せる例文</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(ex)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>{ex.recommendedMode === 'exact' ? '🎯' : ex.recommendedMode === 'forced' ? '🔨' : '🌀'}</span>
              <span>{ex.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* メイン入力フォーム */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 入力側 */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>入力文章</span>
                <span className="text-[10px] text-slate-500">(最大2000文字)</span>
              </label>
              <span className={`text-xs font-mono ${inputText.length > 1800 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                {inputText.length} / 2000
              </span>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="ここに変換したいテキスト文章を入力してください..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all resize-y leading-relaxed font-sans"
            />

            {/* モード選択 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>変換モードを選択</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('exact')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === 'exact'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/50'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>🎯 正確モード</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">意味を忠実に維持</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('forced')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === 'forced'
                      ? 'border-orange-500 bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/50'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5 text-orange-400" />
                    <span>🔨 強引モード</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">比喩・連想で無理矢理</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('chaos')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === 'chaos'
                      ? 'border-pink-500 bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/50'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Flame className="w-3.5 h-3.5 text-pink-400" />
                    <span>🌀 カオスモード</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">面白くシュールに</p>
                </button>
              </div>
            </div>

            {/* パイプライン設定 */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={usePipeline}
                  onChange={(e) => setUsePipeline(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950"
                />
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>3段階ハイブリッド解析を有効にする (高精度)</span>
                </span>
              </label>
            </div>

            {/* 変換実行ボタン */}
            <button
              type="button"
              onClick={handleConvert}
              disabled={isLoading || !inputText.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:via-orange-400 hover:to-pink-400 text-slate-950 shadow-amber-500/20 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-amber-400 rounded-full animate-spin" />
                  <span>AIが絵文字を生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>全部絵文字に変換する！</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 出力側 */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4 min-h-[420px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>絵文字変換結果</span>
                </label>
                {result && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      モード: {result.mode}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-all"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'コピー完了！' : 'コピー'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 絵文字メイン出力 */}
              {result ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 shadow-inner">
                    <p className="text-3xl sm:text-4xl leading-relaxed tracking-wider select-all break-words text-center py-2 animate-pulse-glow">
                      {result.emojis}
                    </p>
                  </div>

                  {/* 内訳・解説カード */}
                  {result.breakdown && result.breakdown.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                        <span>絵文字の意味・対応表</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {result.breakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                          >
                            <span className="text-xl select-all">{item.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-200 truncate">{item.meaning}</p>
                              {item.note && <p className="text-[10px] text-slate-500 truncate">{item.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl">
                    ✨
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400">変換結果がここに表示されます</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      左の入力欄に文章を入力して「全部絵文字に変換する！」ボタンを押してください。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* パイプライン詳細インスペクター */}
            {result && <PipelineInspector pipeline={result.pipeline} />}
          </div>
        </div>
      </div>
    </div>
  );
};

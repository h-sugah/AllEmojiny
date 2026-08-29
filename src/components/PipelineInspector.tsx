import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Brain,
  BookMarked,
  Sparkles
} from 'lucide-react';
import { Stage1Analysis } from '../types';

interface PipelineInspectorProps {
  pipeline: {
    stage1Analysis?: Stage1Analysis;
    stage2DictionaryMatches?: Record<string, string>;
    stage3RawResponse?: string;
  };
}

export const PipelineInspector: React.FC<PipelineInspectorProps> = ({ pipeline }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  if (!pipeline.stage1Analysis && !pipeline.stage2DictionaryMatches && !pipeline.stage3RawResponse) {
    return null;
  }

  const dictMatchesCount = Object.keys(pipeline.stage2DictionaryMatches || {}).length;

  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-850 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <Layers className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>ハイブリッド3段階パイプライン解析プロセス</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
            思考ステップ
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <span>{isOpen ? '閉じる' : '展開して確認'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-800 space-y-4">
          {/* ステップ切り替えボタン */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveStep(1)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                activeStep === 1
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                <span>第1段階: 意味・構文解析</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                主語・行動・時間・感情の抽出
              </p>
            </button>

            <button
              onClick={() => setActiveStep(2)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                activeStep === 2
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <BookMarked className="w-3.5 h-3.5 text-emerald-400" />
                <span>第2段階: 辞書＋連想</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                {dictMatchesCount > 0 ? `${dictMatchesCount}件の辞書照合` : '連想マッピング'}
              </p>
            </button>

            <button
              onClick={() => setActiveStep(3)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                activeStep === 3
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>第3段階: 絵文字再構成</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                最終シーケンス & 内訳
              </p>
            </button>
          </div>

          {/* ステップ詳細表示 */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
            {activeStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-semibold pb-2 border-b border-slate-800">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>LLMによる文章構造と要素の分解</span>
                </div>
                {pipeline.stage1Analysis ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {pipeline.stage1Analysis.subject && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block">主語 / 登場人物</span>
                        <span className="text-slate-200">{pipeline.stage1Analysis.subject}</span>
                      </div>
                    )}
                    {pipeline.stage1Analysis.time && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block">時間 / 時系列</span>
                        <span className="text-slate-200">{pipeline.stage1Analysis.time}</span>
                      </div>
                    )}
                    {pipeline.stage1Analysis.place && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block">場所 / 空間</span>
                        <span className="text-slate-200">{pipeline.stage1Analysis.place}</span>
                      </div>
                    )}
                    {pipeline.stage1Analysis.emotion && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block">感情 / 心理</span>
                        <span className="text-slate-200">{pipeline.stage1Analysis.emotion}</span>
                      </div>
                    )}
                    {pipeline.stage1Analysis.actions && pipeline.stage1Analysis.actions.length > 0 && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 md:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 block">行動 / 出来事 (時系列)</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {pipeline.stage1Analysis.actions.map((act, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 text-xs">
                              {i + 1}. {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {pipeline.stage1Analysis.abstract_concepts && pipeline.stage1Analysis.abstract_concepts.length > 0 && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 md:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 block">連想が必要な抽象概念</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {pipeline.stage1Analysis.abstract_concepts.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 bg-pink-950/40 text-pink-300 border border-pink-800/40 rounded text-xs">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">単一パスモードまたはデータがありません</p>
                )}
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-semibold pb-2 border-b border-slate-800">
                  <BookMarked className="w-4 h-4 text-emerald-400" />
                  <span>絵文字辞書照合 & 連想候補</span>
                </div>
                {dictMatchesCount > 0 ? (
                  <div>
                    <p className="text-[11px] text-slate-400 mb-2">
                      入力文から辞書に登録された以下のキーワードが検出され、LLMの連想コンテキストとして活用されました:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {Object.entries(pipeline.stage2DictionaryMatches || {}).map(([word, emoji]) => (
                        <div key={word} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-300 truncate mr-2">{word}</span>
                          <span className="text-base select-all">{emoji}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400">
                    直接一致する辞書単語はありませんでした。LLMが文脈から直接比喩・連想を生成しました。
                  </p>
                )}
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-semibold pb-2 border-b border-slate-800">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>LLMによる最終絵文字シーケンス出力</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  意味解析と辞書・連想ルールを統合し、絵文字のみで再構成された出力データです。
                </p>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-48">
                  {pipeline.stage3RawResponse || 'データなし'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

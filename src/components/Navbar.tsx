import React from 'react';
import {
  Sparkles,
  FileSearch,
  HelpCircle,
  BookOpen,
  Settings,
  Cpu
} from 'lucide-react';
import { ProviderId, ProviderMeta, ProviderSettingsMap } from '../types';

interface NavbarProps {
  activeTab: 'text-to-emoji' | 'emoji-to-text' | 'quiz' | 'dictionary';
  setActiveTab: (tab: 'text-to-emoji' | 'emoji-to-text' | 'quiz' | 'dictionary') => void;
  activeProvider: ProviderId;
  setActiveProvider: (p: ProviderId) => void;
  providersMeta: ProviderMeta[];
  providerSettings: ProviderSettingsMap;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeProvider,
  setActiveProvider,
  providersMeta,
  providerSettings,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-bounce-soft">
              <span className="text-2xl select-none">✨</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl bg-gradient-to-r from-amber-400 via-orange-300 to-pink-400 bg-clip-text text-transparent tracking-tight">
                  全部絵文字に〜
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  AllEmojiny
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                テキスト文章をAIが強制的に絵文字列に変換するアプリ
              </p>
            </div>
          </div>

          {/* タブナビゲーション */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('text-to-emoji')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'text-to-emoji'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>文章 → 絵文字</span>
            </button>

            <button
              onClick={() => setActiveTab('emoji-to-text')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'emoji-to-text'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>絵文字 → 文章 (逆変換)</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'quiz'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>絵文字クイズ (全3問)</span>
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dictionary'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>絵文字辞書</span>
            </button>
          </nav>

          {/* プロバイダー切替 & 設定ボタン */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value as ProviderId)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer text-slate-200"
              >
                {providersMeta.map((p) => {
                  const isReady = p.id === 'lmstudio' || providerSettings[p.id]?.configured;
                  return (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {isReady ? '●' : '○'} {p.name.split(' ')[0]}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
              title="AIプロバイダー設定"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">AI設定</span>
            </button>
          </div>
        </div>

        {/* モバイル用タブバー */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('text-to-emoji')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'text-to-emoji' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>文章→絵文字</span>
          </button>
          <button
            onClick={() => setActiveTab('emoji-to-text')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'emoji-to-text' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>逆変換</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'quiz' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>クイズ</span>
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'dictionary' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>辞書</span>
          </button>
        </div>
      </div>
    </header>
  );
};

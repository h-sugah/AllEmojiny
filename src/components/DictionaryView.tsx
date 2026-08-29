import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Tag,
  Check
} from 'lucide-react';
import { EmojiEntry } from '../types';
import { api } from '../services/api';

interface DictionaryViewProps {
  onShowMessage: (msg: string) => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({ onShowMessage }) => {
  const [entries, setEntries] = useState<EmojiEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // カスタム登録フォーム
  const [newKeyword, setNewKeyword] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const fetchEntries = async (q = searchQuery) => {
    setIsLoading(true);
    try {
      const res = await api.getDictionary(q);
      setEntries(res.entries || []);
    } catch (err: any) {
      onShowMessage(`辞書の取得に失敗しました: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntries(searchQuery);
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newEmoji.trim()) {
      onShowMessage('単語と絵文字の両方を入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.addCustomEmoji(newKeyword.trim(), newEmoji.trim());
      onShowMessage(res.message);
      setNewKeyword('');
      setNewEmoji('');
      await fetchEntries();
    } catch (err: any) {
      onShowMessage(`登録エラー: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWord = async (keyword: string) => {
    if (!confirm(`「${keyword}」をカスタム辞書から削除しますか？`)) return;
    try {
      const res = await api.deleteCustomEmoji(keyword);
      onShowMessage(res.message);
      await fetchEntries();
    } catch (err: any) {
      onShowMessage(`削除エラー: ${err.message}`);
    }
  };

  const handleCopyEmoji = async (entry: EmojiEntry) => {
    try {
      await navigator.clipboard.writeText(entry.emoji);
      setCopiedKeyword(entry.keyword);
      setTimeout(() => setCopiedKeyword(null), 1500);
      onShowMessage(`「${entry.emoji}」をコピーしました！`);
    } catch {}
  };

  // カテゴリ一覧抽出
  const categories = ['all', ...Array.from(new Set(entries.map(e => e.category)))];

  // フィルタ
  const filteredEntries = entries.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-purple-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span className="text-2xl">📖</span> 絵文字辞書 & 連想ルール
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              AIがハイブリッド変換（第2段階）で参照する絵文字辞書です。<strong className="text-purple-400">独自のカスタム単語・絵文字を追加登録</strong>することもできます。
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 self-start sm:self-center">
            登録数: {entries.length} 語
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左側: 単語追加フォーム & フィルタ */}
        <div className="lg:col-span-4 space-y-4">
          {/* カスタム単語登録カード */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>カスタム絵文字ルールの追加</span>
            </h2>

            <form onSubmit={handleAddWord} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  単語・概念 (キーワード)
                </label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="例: 超集中、テレワーク"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  対応する絵文字
                </label>
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="例: 🧠🔥⚡、🏠💻☕"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newKeyword || !newEmoji}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>辞書に登録する</span>
              </button>
            </form>
          </div>

          {/* カテゴリフィルタ */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-2">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <span>カテゴリで絞り込み</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-850'
                  }`}
                >
                  {cat === 'all' ? 'すべて' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右側: 辞書一覧 */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
            {/* 検索バー */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="単語や絵文字で辞書を検索..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-20 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold hover:bg-purple-500/30"
              >
                検索
              </button>
            </form>

            {/* 一覧グリッド */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>{filteredEntries.length} 件のエントリ</span>
                <span className="text-[10px]">クリックで絵文字をコピー</span>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-slate-500">読み込み中...</div>
              ) : filteredEntries.length === 0 ? (
                <div className="py-12 text-center text-slate-500">該当する単語が見つかりませんでした。</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.keyword}
                      onClick={() => handleCopyEmoji(entry)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 hover:border-purple-500/40 hover:bg-slate-950 transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs font-bold text-slate-200 truncate">{entry.keyword}</p>
                        <span className="text-[9px] text-slate-500 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                          {entry.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xl select-all">{entry.emoji}</span>
                        {entry.category === 'カスタム' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWord(entry.keyword);
                            }}
                            className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="削除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        {copiedKeyword === entry.keyword && (
                          <Check className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

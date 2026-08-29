import React, { useState } from 'react';
import { Smile, ArrowRight, Activity, Building2, Laptop } from 'lucide-react';

interface EmojiPaletteProps {
  onSelectEmoji: (emoji: string) => void;
}

const PALETTE_CATEGORIES = [
  {
    id: 'arrows',
    name: '矢印・接続',
    icon: ArrowRight,
    emojis: ['➡️', '⬅️', '⬆️', '⬇️', '🔄', '⚡', '❗', '❓', '✨', '💥', '🏁', '🚫', '✅', '🔜', '🔙'],
  },
  {
    id: 'people',
    name: '人・表情',
    icon: Smile,
    emojis: ['🙋‍♂️', '🙋‍♀️', '🧑‍💼', '👔', '👥', '😊', '😆', '😵‍💫', '😱', '😡', '😴', '💪', '🤔', '🤦‍♂️', '🔥'],
  },
  {
    id: 'actions',
    name: '行動・状態',
    icon: Activity,
    emojis: ['💻', '📄', '✍️', '🏃💨', '🚶', '🍺', '☕', '🍜', '🛌', '🗣️', '💬', '🎉', '💔', '📈', '📉'],
  },
  {
    id: 'tech',
    name: 'IT・ビジネス',
    icon: Laptop,
    emojis: ['🤖', '🧠', '🔐', '🕳️', '🔍', '🖥️', '☁️', '📊', '🎤', '🏆', '🎯', '💰', '📱', '🐛', '🔧'],
  },
  {
    id: 'places',
    name: '場所・時間',
    icon: Building2,
    emojis: ['🏢', '🏠', '🏪', '🌳', '🚉', '📅', '⏰', '🌅', '☀️', '🌆', '🌃', '🌧️', '☂️', '🌸', '❄️'],
  },
];

export const EmojiPalette: React.FC<EmojiPaletteProps> = ({ onSelectEmoji }) => {
  const [activeCategory, setActiveCategory] = useState(PALETTE_CATEGORIES[0].id);

  const currentCat = PALETTE_CATEGORIES.find(c => c.id === activeCategory) || PALETTE_CATEGORIES[0];

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-1 mb-2 border-b border-slate-800 pb-1.5 overflow-x-auto">
        {PALETTE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-15 gap-1">
        {currentCat.emojis.map((emoji, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="h-8 flex items-center justify-center text-lg hover:bg-slate-800 hover:scale-125 transition-all rounded active:scale-95"
            title={`クリックで挿入: ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

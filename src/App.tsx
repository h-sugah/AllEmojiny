import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TextToEmojiView } from './components/TextToEmojiView';
import { EmojiToTextView } from './components/EmojiToTextView';
import { QuizView } from './components/QuizView';
import { DictionaryView } from './components/DictionaryView';
import { SettingsModal } from './components/SettingsModal';
import { ProviderId, ProviderMeta, ProviderSettingsMap } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'text-to-emoji' | 'emoji-to-text' | 'quiz' | 'dictionary'>('text-to-emoji');
  const [activeProvider, setActiveProvider] = useState<ProviderId>('lmstudio');
  const [providersMeta, setProvidersMeta] = useState<ProviderMeta[]>([]);
  const [providerSettings, setProviderSettings] = useState<ProviderSettingsMap>({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      if (data.active_provider) {
        setActiveProvider(data.active_provider);
      }
      if (data.providers_meta) {
        setProvidersMeta(data.providers_meta);
      }
      if (data.provider_settings) {
        setProviderSettings(data.provider_settings);
      }
    } catch (err) {
      console.warn('設定の読み込みに失敗しました:', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeProvider={activeProvider}
          setActiveProvider={async (pid) => {
            setActiveProvider(pid);
            try {
              await api.saveSettings({ active_provider: pid });
              showToast(`プロバイダーを「${pid.toUpperCase()}」に切り替えました。`);
            } catch {}
          }}
          providersMeta={providersMeta}
          providerSettings={providerSettings}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'text-to-emoji' && (
            <TextToEmojiView
              activeProvider={activeProvider}
              onShowMessage={showToast}
            />
          )}

          {activeTab === 'emoji-to-text' && (
            <EmojiToTextView
              activeProvider={activeProvider}
              onShowMessage={showToast}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              activeProvider={activeProvider}
              onShowMessage={showToast}
            />
          )}

          {activeTab === 'dictionary' && (
            <DictionaryView
              onShowMessage={showToast}
            />
          )}
        </main>
      </div>

      {/* フッター */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">全部絵文字に〜 (AllEmojiny)</span>
            <span>•</span>
            <span>LLM-powered Text ⇄ Emoji Converter & Quiz Game</span>
          </div>
          <div>
            <span>対応AI: LM Studio, Google Gemini, OpenAI, Anthropic Claude</span>
          </div>
        </div>
      </footer>

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
        providersMeta={providersMeta}
        providerSettings={providerSettings}
        onSettingsSaved={loadSettings}
        onShowMessage={showToast}
      />

      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-amber-400">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
export default App;

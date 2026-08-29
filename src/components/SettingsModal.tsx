import React, { useState } from 'react';
import {
  X,
  Settings,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Radio
} from 'lucide-react';
import { ProviderId, ProviderMeta, ProviderSettingsMap } from '../types';
import { api } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProvider: ProviderId;
  setActiveProvider: (p: ProviderId) => void;
  providersMeta: ProviderMeta[];
  providerSettings: ProviderSettingsMap;
  onSettingsSaved: () => void;
  onShowMessage: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeProvider,
  setActiveProvider,
  providersMeta,
  providerSettings: initialSettings,
  onSettingsSaved,
  onShowMessage,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>(activeProvider);
  const [formSettings, setFormSettings] = useState<ProviderSettingsMap>(initialSettings);
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; models?: string[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currentMeta = providersMeta.find(p => p.id === selectedProvider) || providersMeta[0];
  const currentConfig = formSettings[selectedProvider] || {
    url: currentMeta?.defaultBaseUrl || '',
    model: currentMeta?.defaultModel || '',
    configured: false,
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const token = tokenInputs[selectedProvider] || undefined;
      const res = await api.testProvider(selectedProvider, {
        url: currentConfig.url,
        token,
        model: currentConfig.model,
      });

      setTestResult({
        success: true,
        message: res.message || '接続に成功しました！',
        models: res.models,
      });

      if (res.models && res.models.length > 0 && !currentConfig.model) {
        setFormSettings(prev => ({
          ...prev,
          [selectedProvider]: {
            ...prev[selectedProvider],
            model: res.models[0],
          }
        }));
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || '接続に失敗しました。',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payloadSettings: Record<string, any> = {};
      for (const [pid, conf] of Object.entries(formSettings)) {
        payloadSettings[pid] = {
          url: conf.url,
          model: conf.model,
          token: tokenInputs[pid] || undefined,
        };
      }

      await api.saveSettings({
        active_provider: activeProvider,
        provider_settings: payloadSettings,
      });

      onShowMessage('AIプロバイダー設定を保存しました。');
      onSettingsSaved();
      onClose();
    } catch (err: any) {
      onShowMessage(`設定保存エラー: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-100">
                AI プロバイダー設定
              </h2>
              <p className="text-[11px] text-slate-400">
                LM Studio (ローカル) / OpenAI / Anthropic / Google Gemini の接続設定
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* モーダル本体 */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 左カラム: プロバイダー一覧 */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              プロバイダーを選択
            </label>
            {providersMeta.map((p) => {
              const isSelected = selectedProvider === p.id;
              const isActive = activeProvider === p.id;
              const isConfigured = p.id === 'lmstudio' || formSettings[p.id]?.configured || Boolean(tokenInputs[p.id]);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProvider(p.id);
                    setTestResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span className={isConfigured ? 'text-emerald-400' : 'text-slate-600'}>●</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold shrink-0">
                      使用中
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 右カラム: 詳細設定フォーム */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs text-slate-200">{currentMeta?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProvider(selectedProvider)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    activeProvider === selectedProvider
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {activeProvider === selectedProvider ? '✓ アクティブに設定中' : 'このプロバイダーを有効化'}
                </button>
              </div>

              {/* Base URL */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                  <Globe className="w-3 h-3 text-slate-500" />
                  <span>API Base URL</span>
                </label>
                <input
                  type="text"
                  value={currentConfig.url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormSettings(prev => ({
                      ...prev,
                      [selectedProvider]: { ...prev[selectedProvider], url: val }
                    }));
                  }}
                  placeholder={currentMeta?.defaultBaseUrl}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* API Key / Token */}
              {selectedProvider !== 'lmstudio' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                    <Key className="w-3 h-3 text-slate-500" />
                    <span>API キー / トークン</span>
                    {currentConfig.configured && (
                      <span className="text-[10px] text-emerald-400 ml-auto font-normal">✓ サーバー保存済み</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={tokenInputs[selectedProvider] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTokenInputs(prev => ({ ...prev, [selectedProvider]: val }));
                    }}
                    placeholder={currentConfig.configured ? '●●●●●●●●●● (設定済み・変更する場合のみ入力)' : 'APIキーを入力'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              )}

              {/* Model Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between mb-1">
                  <span>モデル名 (Model)</span>
                  <span className="text-[10px] text-slate-500">直接入力または下から選択</span>
                </label>
                <input
                  type="text"
                  value={currentConfig.model}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormSettings(prev => ({
                      ...prev,
                      [selectedProvider]: { ...prev[selectedProvider], model: val }
                    }));
                  }}
                  placeholder={currentMeta?.defaultModel}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />

                {/* 推奨モデル選択肢 */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(testResult?.models && testResult.models.length > 0
                    ? testResult.models
                    : currentMeta?.popularModels || []
                  ).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setFormSettings(prev => ({
                          ...prev,
                          [selectedProvider]: { ...prev[selectedProvider], model: m }
                        }));
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                        currentConfig.model === m
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 接続テストボタン */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTesting ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isTesting ? '接続テスト中...' : '接続テスト & モデル取得'}</span>
                </button>
              </div>

              {/* テスト結果 */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold">{testResult.success ? '疎通成功' : '接続エラー'}</p>
                    <p className="text-[11px] mt-0.5">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* モーダルフッター */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <span className="text-[11px] text-slate-500">
            設定はローカルデータベース（SQLite）に安全に保存されます。
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              閉じる
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              {isSaving ? '保存中...' : '設定を保存する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Router } from 'express';
import { getSetting, setSetting } from '../config.js';
import { getAllProviders, getProvider, getProviderMetaList } from '../services/llm/llm.factory.js';
import { ProviderId, ProviderConfig } from '../services/llm/provider.interface.js';

export const settingsRouter = Router();

settingsRouter.get('/', (_req, res) => {
  const activeProvider = getSetting('active_provider', 'lmstudio') as ProviderId;

  const providerSettings: Record<string, any> = {};
  for (const p of getAllProviders()) {
    providerSettings[p.id] = {
      url: getSetting(`${p.id}_url`, p.defaultBaseUrl),
      model: getSetting(`${p.id}_model`, p.defaultModel),
      configured: Boolean(getSetting(`${p.id}_token`, '') || p.id === 'lmstudio'),
    };
  }

  res.json({
    active_provider: activeProvider,
    providers_meta: getProviderMetaList(),
    provider_settings: providerSettings,
  });
});

settingsRouter.put('/', (req, res) => {
  const b = req.body;

  if (typeof b.active_provider === 'string') {
    setSetting('active_provider', b.active_provider);
  }

  for (const p of getAllProviders()) {
    const pid = p.id;
    if (typeof b[`${pid}_url`] === 'string') setSetting(`${pid}_url`, b[`${pid}_url`]);
    if (typeof b[`${pid}_model`] === 'string') setSetting(`${pid}_model`, b[`${pid}_model`]);
    if (typeof b[`${pid}_token`] === 'string' && b[`${pid}_token`].trim()) {
      setSetting(`${pid}_token`, b[`${pid}_token`].trim());
    }
    if (b[`clear_${pid}_token`] === true) {
      setSetting(`${pid}_token`, '');
    }
  }

  if (b.provider_settings && typeof b.provider_settings === 'object') {
    for (const [pid, ps] of Object.entries(b.provider_settings) as [string, any][]) {
      if (typeof ps.url === 'string') setSetting(`${pid}_url`, ps.url);
      if (typeof ps.model === 'string') setSetting(`${pid}_model`, ps.model);
      if (typeof ps.token === 'string' && ps.token.trim()) setSetting(`${pid}_token`, ps.token.trim());
      if (ps.clear_token === true) setSetting(`${pid}_token`, '');
    }
  }

  res.json({ success: true, message: '設定を保存しました。' });
});

settingsRouter.post('/providers/:id/test', async (req, res) => {
  const pid = req.params.id as ProviderId;
  try {
    const provider = getProvider(pid);
    const config: ProviderConfig = {
      id: pid,
      name: provider.name,
      baseUrl: (typeof req.body.url === 'string' && req.body.url.trim()) ? req.body.url.trim() : getSetting(`${pid}_url`, provider.defaultBaseUrl),
      token: (typeof req.body.token === 'string' && req.body.token.trim()) ? req.body.token.trim() : getSetting(`${pid}_token`, ''),
      model: (typeof req.body.model === 'string' && req.body.model.trim()) ? req.body.model.trim() : getSetting(`${pid}_model`, provider.defaultModel),
    };

    const result = await provider.testConnection(config);
    res.json({
      success: true,
      provider: pid,
      models: result.models,
      message: result.message,
    });
  } catch (error: any) {
    console.error(`接続テストエラー (${pid}):`, error);
    res.status(502).json({ error: error.message || '接続に失敗しました。' });
  }
});

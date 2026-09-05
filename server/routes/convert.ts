import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { converterService, ConversionMode } from '../services/converter.service.js';
<<<<<<< HEAD
import { getProviderConfig, getSetting, db } from '../config.js';
import { ProviderId } from '../services/llm/provider.interface.js';
import { validateConvertInput } from '../middleware/security.js';
=======
import { getProviderConfig, getSetting, recordConversionHistory } from '../config.js';
import { ProviderId } from '../services/llm/provider.interface.js';
import { validateConvertInput } from '../middleware/security.js';
import { safeError, safeWarn } from '../utils/safeLog.js';
>>>>>>> 1d87e71 (updated)

export const convertRouter = Router();

convertRouter.post('/', validateConvertInput, async (req, res) => {
  try {
    const { text, mode = 'forced', providerId, model, usePipeline = true } = req.body;

    const activePid = (providerId || getSetting('active_provider', 'lmstudio')) as ProviderId;
    const config = getProviderConfig(activePid);

    if (model) {
      config.model = model;
    }

    const conversionMode = ['exact', 'forced', 'chaos'].includes(mode) ? (mode as ConversionMode) : 'forced';

    const result = await converterService.convert(text, conversionMode, config, usePipeline);

    // 履歴に保存
    try {
<<<<<<< HEAD
      db.prepare('INSERT INTO conversion_history VALUES (?,?,?,?,?,?,?,?,?)').run(
        randomUUID(),
        'text_to_emoji',
        text,
        result.emojis,
        conversionMode,
        activePid,
        config.model,
        JSON.stringify(result.breakdown),
        new Date().toISOString()
      );
    } catch (e) {
      console.warn('履歴の保存に失敗:', e);
=======
      recordConversionHistory({
        id: randomUUID(),
        type: 'text_to_emoji',
        inputText: text,
        outputText: result.emojis,
        mode: conversionMode,
        provider: activePid,
        model: config.model,
        metadataJson: JSON.stringify(result.breakdown),
      });
    } catch (e) {
      safeWarn('履歴の保存に失敗:', e);
>>>>>>> 1d87e71 (updated)
    }

    res.json({
      success: true,
      provider: activePid,
      model: config.model,
      ...result,
    });
  } catch (error: any) {
<<<<<<< HEAD
    console.error('変換エラー:', error);
=======
    safeError('変換エラー:', error);
>>>>>>> 1d87e71 (updated)
    res.status(500).json({ error: error.message || '絵文字への変換処理中にエラーが発生しました。' });
  }
});

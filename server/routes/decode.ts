import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { decoderService } from '../services/decoder.service.js';
<<<<<<< HEAD
import { getProviderConfig, getSetting, db } from '../config.js';
import { ProviderId } from '../services/llm/provider.interface.js';
import { validateDecodeInput } from '../middleware/security.js';
=======
import { getProviderConfig, getSetting, recordConversionHistory } from '../config.js';
import { ProviderId } from '../services/llm/provider.interface.js';
import { validateDecodeInput } from '../middleware/security.js';
import { safeError, safeWarn } from '../utils/safeLog.js';
>>>>>>> 1d87e71 (updated)

export const decodeRouter = Router();

decodeRouter.post('/', validateDecodeInput, async (req, res) => {
  try {
    const { emojis, providerId, model } = req.body;

    const activePid = (providerId || getSetting('active_provider', 'lmstudio')) as ProviderId;
    const config = getProviderConfig(activePid);

    if (model) {
      config.model = model;
    }

    const result = await decoderService.decode(emojis, config);

    // 履歴に保存
    try {
<<<<<<< HEAD
      db.prepare('INSERT INTO conversion_history VALUES (?,?,?,?,?,?,?,?,?)').run(
        randomUUID(),
        'emoji_to_text',
        emojis,
        result.text,
        'decode',
        activePid,
        config.model,
        JSON.stringify(result.interpretations),
        new Date().toISOString()
      );
    } catch (e) {
      console.warn('履歴の保存に失敗:', e);
=======
      recordConversionHistory({
        id: randomUUID(),
        type: 'emoji_to_text',
        inputText: emojis,
        outputText: result.text,
        mode: 'decode',
        provider: activePid,
        model: config.model,
        metadataJson: JSON.stringify(result.interpretations),
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
    console.error('デコードエラー:', error);
=======
    safeError('デコードエラー:', error);
>>>>>>> 1d87e71 (updated)
    res.status(500).json({ error: error.message || '絵文字列の解読中にエラーが発生しました。' });
  }
});

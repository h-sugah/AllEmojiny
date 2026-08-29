import { Router } from 'express';
import { dictionaryService } from '../services/dictionary.service.js';

export const dictionaryRouter = Router();

dictionaryRouter.get('/', (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const entries = dictionaryService.search(q);
    res.json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

dictionaryRouter.post('/', (req, res) => {
  try {
    const { keyword, emoji } = req.body;
    dictionaryService.addCustomWord(keyword, emoji);
    res.json({
      success: true,
      message: `「${keyword}」→「${emoji}」を辞書に登録しました。`,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

dictionaryRouter.delete('/:keyword', (req, res) => {
  try {
    const keyword = decodeURIComponent(req.params.keyword);
    const removed = dictionaryService.removeCustomWord(keyword);
    if (removed) {
      res.json({ success: true, message: `「${keyword}」をカスタム辞書から削除しました。` });
    } else {
      res.status(404).json({ error: '指定されたカスタム単語が見つかりませんでした。' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

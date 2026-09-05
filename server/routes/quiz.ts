import { Router } from 'express';
import { quizService, QuizQuestion } from '../services/quiz.service.js';
import { getProviderConfig, getSetting } from '../config.js';
import { ProviderId } from '../services/llm/provider.interface.js';
<<<<<<< HEAD
import { validateQuizAnswerInput } from '../middleware/security.js';

export const quizRouter = Router();

quizRouter.post('/generate', async (req, res) => {
=======
import { validateQuizAnswerInput, validateQuizGenerateInput } from '../middleware/security.js';
import { safeError } from '../utils/safeLog.js';

export const quizRouter = Router();

quizRouter.post('/generate', validateQuizGenerateInput, async (req, res) => {
>>>>>>> 1d87e71 (updated)
  try {
    const { genre = 'all', count = 3, providerId, model } = req.body;

    const activePid = (providerId || getSetting('active_provider', 'lmstudio')) as ProviderId;
    const config = getProviderConfig(activePid);

    if (model) {
      config.model = model;
    }

    const questions = await quizService.generateQuizSet(genre, config, count);

    res.json({
      success: true,
      questions,
    });
  } catch (error: any) {
<<<<<<< HEAD
    console.error('クイズ生成エラー:', error);
=======
    safeError('クイズ生成エラー:', error);
>>>>>>> 1d87e71 (updated)
    res.status(500).json({ error: error.message || 'クイズの生成中にエラーが発生しました。' });
  }
});

quizRouter.post('/evaluate', validateQuizAnswerInput, async (req, res) => {
  try {
    const { question, answer, providerId, model } = req.body;

    if (!question || !question.originalText) {
      return res.status(400).json({ error: '問題データが不足しています。' });
    }

    const activePid = (providerId || getSetting('active_provider', 'lmstudio')) as ProviderId;
    const config = getProviderConfig(activePid);

    if (model) {
      config.model = model;
    }

    const evaluation = await quizService.evaluateAnswer(question as QuizQuestion, answer, config);

    res.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
<<<<<<< HEAD
    console.error('クイズ判定エラー:', error);
=======
    safeError('クイズ判定エラー:', error);
>>>>>>> 1d87e71 (updated)
    res.status(500).json({ error: error.message || '回答判定中にエラーが発生しました。' });
  }
});

import { Router } from 'express';
import { quizService, QuizQuestion } from '../services/quiz.service.js';
import { getProviderConfig, getSetting } from '../config.js';
import { ProviderId } from '../services/llm/provider.interface.js';
import { validateQuizAnswerInput } from '../middleware/security.js';

export const quizRouter = Router();

quizRouter.post('/generate', async (req, res) => {
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
    console.error('クイズ生成エラー:', error);
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
    console.error('クイズ判定エラー:', error);
    res.status(500).json({ error: error.message || '回答判定中にエラーが発生しました。' });
  }
});

import express from 'express';
import { generateQuiz, evaluateQuiz } from '../controllers/quizController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/generate', authenticate, generateQuiz);
router.post('/evaluate', authenticate, evaluateQuiz);

export default router;

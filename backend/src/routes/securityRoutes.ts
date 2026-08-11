/* eslint-disable */
import { Router } from 'express';
import { getThreatLogs, seedThreats } from '../controllers/securityController';

const router = Router();

router.get('/logs', getThreatLogs);
router.post('/seed', seedThreats); // Only for demo purposes!

export default router;

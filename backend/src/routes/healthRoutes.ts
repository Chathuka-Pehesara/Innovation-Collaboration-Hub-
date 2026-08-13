/**
 * @file        healthRoutes.ts
 * @owner       Networking Team
 * @description Health check and liveness probe routes.
 *              GET /api/health        → Full system status report
 *              GET /api/health/live   → Lightweight liveness probe
 */

import { Router } from 'express';
import { getHealth, getLiveness } from '../controllers/healthController';

const router = Router();

// Full health report — all service dependencies checked
router.get('/', getHealth);

// Lightweight liveness probe — just confirms the process is alive
router.get('/live', getLiveness);

export default router;

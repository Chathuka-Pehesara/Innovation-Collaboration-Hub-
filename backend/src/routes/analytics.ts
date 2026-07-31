import express from 'express';
import { getDashboardAnalytics } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// GET /api/analytics/dashboard (Admin only)
router.get('/dashboard', authenticate, authorize('admin'), getDashboardAnalytics);

export default router;


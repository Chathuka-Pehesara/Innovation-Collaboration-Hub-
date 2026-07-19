/**
 * @file        profileRoutes.ts
 * @owner       IT Team
 * @description Profile management routes: public view, edits, avatar, skills, portfolio, availability, student search.
 * @depends     backend/src/controllers/userController.ts, backend/src/middleware/auth.ts
 *
 * Mount in routes/index.ts:
 *   import profileRoutes from './users';
 *   router.use('/profile', profileRoutes);
 *   router.use('/students', profileRoutes); // for /students/search
 */

import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getSkills,
  getBadges,
  addSkill,
  removeSkill,
  getPortfolio,
  addPortfolioItem,
  analyzePortfolioProject,
  submitPortfolioProject,
  removePortfolioItem,
  updatePortfolioItem,
  updateAvailability,
  searchStudents,
  getAllUsersAdmin,
  upload,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProfileSchema,
  addSkillSchema,
  addPortfolioItemSchema,
  updateAvailabilitySchema,
} from '../validators/userValidator';

const router = Router();

// ─── Student search (public) ────────────────────────────────────────────────
// GET /students/search?q=alice&skill=React&page=1&limit=12
router.get('/search', searchStudents);

// ─── Admin Users ────────────────────────────────────────────────────────────
// GET /admin/all
router.get('/admin/all', authenticate, getAllUsersAdmin);

// ─── Public profile ─────────────────────────────────────────────────────────
// GET /profile/:id
router.get('/:id', getProfile);

// ─── Authenticated profile mutations ────────────────────────────────────────
// PUT /profile/:id
router.put('/:id', authenticate, validate(updateProfileSchema), updateProfile);

// POST /profile/:id/avatar  (multipart/form-data, field name: "avatar")
router.post('/:id/avatar', authenticate, upload.single('avatar'), uploadAvatar);

// ─── Skills ─────────────────────────────────────────────────────────────────
// GET  /profile/:id/skills
router.get('/:id/skills', getSkills);

// POST /profile/:id/skills
router.post('/:id/skills', authenticate, validate(addSkillSchema), addSkill);

// DELETE /profile/:id/skills/:skillId
router.delete('/:id/skills/:skillId', authenticate, removeSkill);

// ─── Badges ─────────────────────────────────────────────────────────────────
// GET  /profile/:id/badges
router.get('/:id/badges', getBadges);

// ─── Portfolio ───────────────────────────────────────────────────────────────
// GET  /profile/:id/portfolio
router.get('/:id/portfolio', getPortfolio);

// POST /profile/:id/portfolio/analyze
router.post('/:id/portfolio/analyze', authenticate, analyzePortfolioProject);

// POST /profile/:id/portfolio/submit
router.post('/:id/portfolio/submit', authenticate, submitPortfolioProject);

// POST /profile/:id/portfolio (Legacy direct add)
router.post('/:id/portfolio', authenticate, validate(addPortfolioItemSchema), addPortfolioItem);

// PUT /profile/:id/portfolio/:itemId
router.put('/:id/portfolio/:itemId', authenticate, validate(addPortfolioItemSchema), updatePortfolioItem);

// DELETE /profile/:id/portfolio/:itemId
router.delete('/:id/portfolio/:itemId', authenticate, removePortfolioItem);

// ─── Availability ────────────────────────────────────────────────────────────
// PUT /profile/:id/availability
router.put('/:id/availability', authenticate, validate(updateAvailabilitySchema), updateAvailability);

export default router;

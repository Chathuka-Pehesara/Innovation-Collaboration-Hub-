import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getCategories,
  addTagsToProject,
  addSkillsToProject,
  updateProjectStatus,
  receiveAIResult
} from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Categories
router.get('/categories', getCategories);

// Project CRUD
router.post('/', authenticate, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

// Project specific actions
router.post('/:id/tags', authenticate, addTagsToProject);
router.post('/:id/skills', authenticate, addSkillsToProject);
router.put('/:id/status', authenticate, updateProjectStatus);
router.post('/:id/ai-result', receiveAIResult); // System AI endpoint

export default router;

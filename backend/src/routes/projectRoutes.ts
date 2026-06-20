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

const router = express.Router();

// Categories
router.get('/categories', getCategories);

// Project CRUD
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project specific actions
router.post('/:id/tags', addTagsToProject);
router.post('/:id/skills', addSkillsToProject);
router.put('/:id/status', updateProjectStatus);
router.post('/:id/ai-result', receiveAIResult);

export default router;

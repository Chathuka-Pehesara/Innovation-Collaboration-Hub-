import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createTeam,
  getTeamByProject,
  getTeamDetails,
  sendInvite,
  applyToTeam,
  respondToInvite,
  updateMemberRole,
  removeMember,
  createTask,
  updateTask,
  deleteTask,
  uploadResource
} from '../controllers/teamController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadDir)
  },
  filename: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Routes
router.post('/', authenticate, createTeam);
router.get('/project/:projectId', authenticate, getTeamByProject);
router.get('/:id', authenticate, getTeamDetails);

// Invites & Applications
router.post('/:id/invite', authenticate, sendInvite);
router.post('/:id/apply', authenticate, applyToTeam);
router.put('/:id/invite/:inviteId', authenticate, respondToInvite);

// Members
router.put('/:id/members/:userId/role', authenticate, updateMemberRole);
router.delete('/:id/members/:userId', authenticate, removeMember);

// Kanban tasks
router.post('/:id/tasks', authenticate, createTask);
router.put('/:id/tasks/:taskId', authenticate, updateTask);
router.delete('/:id/tasks/:taskId', authenticate, deleteTask);

// Resources
router.post('/:id/resources', authenticate, upload.single('file'), uploadResource);

export default router;

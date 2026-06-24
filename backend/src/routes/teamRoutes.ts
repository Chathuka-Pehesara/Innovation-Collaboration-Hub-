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

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Routes
router.post('/', createTeam);
router.get('/project/:projectId', getTeamByProject);
router.get('/:id', getTeamDetails);

// Invites & Applications
router.post('/:id/invite', sendInvite);
router.post('/:id/apply', applyToTeam);
router.put('/:id/invite/:inviteId', respondToInvite);

// Members
router.put('/:id/members/:userId/role', updateMemberRole);
router.delete('/:id/members/:userId', removeMember);

// Kanban tasks
router.post('/:id/tasks', createTask);
router.put('/:id/tasks/:taskId', updateTask);
router.delete('/:id/tasks/:taskId', deleteTask);

// Resources
router.post('/:id/resources', upload.single('file'), uploadResource);

export default router;

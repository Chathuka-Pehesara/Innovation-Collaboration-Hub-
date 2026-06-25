import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getTeamMessages,
  sendTeamMessage,
  getDMMessages,
  sendDMMessage,
  uploadChatFile
} from '../controllers/chatController';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadDir);
  },
  filename: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.get('/team/:teamId/messages', getTeamMessages);
router.post('/team/:teamId/messages', sendTeamMessage);
router.get('/dm/:userId/messages', getDMMessages);
router.post('/dm/:userId/messages', sendDMMessage);
router.post('/:chatId/files', upload.single('file'), uploadChatFile);

export default router;

import express from 'express';
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  addQuestionToSession,
  completeSession,
} from '../controllers/sessionController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/').get(getSessions).post(createSession);
router.route('/user').get(getSessions); // Alias for user sessions (same as getSessions)
router.route('/:id').get(getSession).put(updateSession).delete(deleteSession);
router.route('/:id/questions').post(addQuestionToSession);
router.route('/:id/complete').put(completeSession);

export default router;

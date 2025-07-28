import express from 'express';
import {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  setDefaultResume,
} from '../controllers/resumeController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/').get(getResumes).post(createResume);
router.route('/:id').get(getResume).put(updateResume).delete(deleteResume);
router.put('/:id/default', setDefaultResume);

export default router;

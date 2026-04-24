import express from 'express';
import protect from '../middleware/auth.js';
import { completeWorkout, getHistory, getMyReviews, getAllReviews } from '../controllers/workoutController.js';

const router = express.Router();

router.post('/complete',     protect, completeWorkout);
router.get('/history',       protect, getHistory);
router.get('/my-reviews',    protect, getMyReviews);
router.get('/all-reviews',   getAllReviews);          // public — for homepage

export default router;

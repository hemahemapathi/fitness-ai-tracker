import express from 'express';
import protect from '../middleware/auth.js';
import { getGoal, saveGoal, getProgress, checkDay, autoCalculate, getHistory } from '../controllers/goalController.js';

const router = express.Router();

router.get('/',                protect, getGoal);
router.get('/history',         protect, getHistory);
router.post('/',               protect, saveGoal);
router.get('/progress',        protect, getProgress);
router.post('/check-day',      protect, checkDay);
router.get('/auto-calculate',  protect, autoCalculate);

export default router;

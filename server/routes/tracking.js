import express from 'express';
import protect from '../middleware/auth.js';
import { getToday, updateLog, getWeekly } from '../controllers/trackingController.js';

const router = express.Router();

router.get('/today',  protect, getToday);
router.post('/log',   protect, updateLog);
router.get('/weekly', protect, getWeekly);

export default router;

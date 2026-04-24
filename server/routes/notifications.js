import express from 'express';
import protect from '../middleware/auth.js';
import { getNotifications, getUnreadCount, markAllRead, markOneRead, clearAll } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/',              protect, getNotifications);
router.get('/unread-count',  protect, getUnreadCount);
router.put('/read-all',      protect, markAllRead);
router.put('/:id/read',      protect, markOneRead);
router.delete('/clear',      protect, clearAll);

export default router;

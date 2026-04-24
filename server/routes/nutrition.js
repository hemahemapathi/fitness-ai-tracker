import express from 'express';
import protect from '../middleware/auth.js';
import {
  getDailyLog, addFoodItem, removeFoodItem, updateCalorieGoal,
  getWeeklyLogs, searchFood, getMealPlan, saveMealPlan,
  logOutsideFood, removeOutsideFood, getProfileGoals
} from '../controllers/nutritionController.js';

const router = express.Router();

router.get('/daily',              protect, getDailyLog);
router.post('/add',               protect, addFoodItem);
router.post('/remove',            protect, removeFoodItem);
router.put('/calorie-goal',       protect, updateCalorieGoal);
router.get('/weekly',             protect, getWeeklyLogs);
router.get('/search',             protect, searchFood);
router.get('/meal-plan',          protect, getMealPlan);
router.post('/meal-plan',         protect, saveMealPlan);
router.post('/outside-food',      protect, logOutsideFood);
router.post('/outside-food/remove', protect, removeOutsideFood);
router.get('/profile-goals',      protect, getProfileGoals);

export default router;

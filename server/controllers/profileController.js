import User from '../models/User.js';
import Tracking from '../models/Tracking.js';
import Goal from '../models/Goal.js';
import NutritionLog from '../models/Nutrition.js';
import WorkoutLog from '../models/WorkoutLog.js';

// GET /profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    // Fitness stats from tracking
    const trackingLogs = await Tracking.find({ userId: req.user.id });
    const totalSteps        = trackingLogs.reduce((s, l) => s + (l.steps || 0), 0);
    const totalCalBurned    = trackingLogs.reduce((s, l) => s + (l.caloriesBurned || 0), 0);
    const totalWater        = trackingLogs.reduce((s, l) => s + (l.water || 0), 0);
    const workoutDays       = trackingLogs.filter(l => l.workoutDone).length;

    // Streak from active goal
    const goal = await Goal.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    // Total nutrition logs
    const nutritionLogs = await NutritionLog.find({ userId: req.user.id });
    const totalCalConsumed = nutritionLogs.reduce((s, l) => {
      const items = [...l.breakfast, ...l.lunch, ...l.dinner, ...l.snacks];
      return s + items.reduce((a, i) => a + i.calories * i.quantity, 0);
    }, 0);

    // BMI, BMR, TDEE
    const p = user.profile || {};
    const weight = p.weight || 0;
    const height = p.height || 0;
    const age    = p.age    || 0;
    const gender = p.gender || 'male';
    const level  = p.fitnessLevel || 'Beginner';

    const bmi = weight && height ? Math.round((weight / ((height / 100) ** 2)) * 10) / 10 : 0;
    const bmr = weight && height && age
      ? Math.round(gender === 'female'
          ? 10 * weight + 6.25 * height - 5 * age - 161
          : 10 * weight + 6.25 * height - 5 * age + 5)
      : 0;
    const activityMap = { Beginner: 1.375, Intermediate: 1.55, Advanced: 1.725 };
    const tdee = bmr ? Math.round(bmr * (activityMap[level] || 1.375)) : 0;

    res.json({
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        createdAt: user.createdAt,
        profile:   user.profile,
      },
      stats: {
        totalSteps,
        totalCalBurned,
        totalCalConsumed: Math.round(totalCalConsumed),
        totalWater,
        workoutDays,
        streak:     goal?.streak     || 0,
        bestStreak: goal?.bestStreak || 0,
        goalsCompleted: goal?.completedDays?.length || 0,
      },
      metrics: { bmi, bmr, tdee },
      activeGoal: goal ? {
        goalType:  goal.goalType,
        pct:       goal.startDate ? Math.min(Math.round((Math.floor((new Date() - new Date(goal.startDate)) / 86400000) / goal.timeline) * 100), 100) : 0,
        timeline:  goal.timeline,
        isActive:  goal.isActive,
      } : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /profile
export const updateProfile = async (req, res) => {
  try {
    const { name, profile } = req.body;
    const update = {};
    if (name) update.name = name;
    if (profile) update.profile = profile;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true }
    ).select('-password');

    // Update localStorage name hint
    res.json({ user: { id: user._id, name: user.name, email: user.email, profile: user.profile, createdAt: user.createdAt } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /profile/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'All fields required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await User.findById(req.user.id);
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

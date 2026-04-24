import Goal from '../models/Goal.js';
import Tracking from '../models/Tracking.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const todayStr = () => new Date().toISOString().split('T')[0];
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

// Auto-calculate TDEE and macros from user profile
const calcFromProfile = (profile, goalType) => {
  const weight = profile?.weight || 70;
  const height = profile?.height || 170;
  const age    = profile?.age    || 25;
  const gender = profile?.gender || 'male';
  const level  = profile?.fitnessLevel || 'Beginner';

  const bmr = gender === 'female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;

  const activityMap = { Beginner: 1.375, Intermediate: 1.55, Advanced: 1.725 };
  const tdee = Math.round(bmr * (activityMap[level] || 1.375));

  let calories;
  if (goalType === 'Weight Loss')   calories = Math.round(tdee - 400);
  else if (goalType === 'Muscle Gain') calories = Math.round(tdee + 300);
  else calories = tdee;

  const protein = Math.round((calories * 0.30) / 4);
  const carbs   = Math.round((calories * 0.45) / 4);
  const fat     = Math.round((calories * 0.25) / 9);

  return { calories, protein, carbs, fat, tdee };
};

// GET /goals
export const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goal || null);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /goals/history
export const getHistory = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /goals
export const saveGoal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profile');
    const auto = calcFromProfile(user?.profile, req.body.goalType);

    const today = todayStr();
    const endDate = (() => {
      const d = new Date();
      d.setDate(d.getDate() + (req.body.timeline || 30));
      return d.toISOString().split('T')[0];
    })();

    const fields = {
      goalType:        req.body.goalType        || 'General Health',
      calories:        req.body.calories        || auto.calories,
      protein:         req.body.protein         || auto.protein,
      carbs:           req.body.carbs           || auto.carbs,
      fat:             req.body.fat             || auto.fat,
      steps:           req.body.steps           || 10000,
      workoutDays:     req.body.workoutDays      || 4,
      workoutDuration: req.body.workoutDuration  || 45,
      water:           req.body.water           || 8,
      sleep:           req.body.sleep           || 8,
      currentWeight:   req.body.currentWeight   || user?.profile?.weight || 0,
      targetWeight:    req.body.targetWeight     || 0,
      timeline:        req.body.timeline        || 30,
      startDate:       today,
      endDate,
      missedDays:      [],
      completedDays:   [],
      streak:          0,
      bestStreak:      0,
      isActive:        true,
    };

    // Deactivate any existing active goal first
    await Goal.updateMany({ userId: req.user.id, isActive: true }, { $set: { isActive: false } });

    let goal;
    try {
      const newGoal = new Goal({ userId: req.user.id, ...fields });
      goal = await newGoal.save();
    } catch (dupErr) {
      if (dupErr.code === 11000) {
        // Force update the existing document
        goal = await Goal.findOneAndUpdate(
          { userId: req.user.id },
          { $set: { ...fields, isActive: true } },
          { new: true }
        );
      } else {
        throw dupErr;
      }
    }

    // Create a start notification
    try {
      await Notification.create({
        userId: req.user.id,
        message: `🎯 Your ${fields.goalType} goal has started! ${fields.timeline} days to go. You got this!`,
        type: 'success',
        date: today,
      });
    } catch { /* silent */ }

    res.json(goal);
  } catch (err) {
    console.error('saveGoal error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /goals/progress
export const getProgress = async (req, res) => {
  try {
    const goal = await Goal.findOne({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    if (!goal) return res.json(null);

    const today = todayStr();
    const start = new Date(goal.startDate);
    const end   = new Date(goal.endDate);
    const now   = new Date(today);

    const totalDays    = goal.timeline;
    const daysPassed   = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
    const currentDay   = Math.min(daysPassed + 1, totalDays);
    const pct          = Math.round((daysPassed / totalDays) * 100);

    res.json({
      goalType:      goal.goalType,
      totalDays,
      currentDay,
      daysRemaining,
      pct,
      streak:        goal.streak,
      bestStreak:    goal.bestStreak,
      missedDays:    goal.missedDays.length,
      completedDays: goal.completedDays.length,
      startDate:     goal.startDate,
      endDate:       goal.endDate,
      isActive:      goal.isActive,
      targetWeight:  goal.targetWeight,
      currentWeight: goal.currentWeight,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /goals/check-day
export const checkDay = async (req, res) => {
  try {
    const goal = await Goal.findOne({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    if (!goal || !goal.isActive) return res.json({ message: 'No active goal' });

    const yesterday = yesterdayStr();
    const today     = todayStr();

    // Already checked today
    if (goal.completedDays.includes(yesterday) || goal.missedDays.includes(yesterday)) {
      return res.json({ message: 'Already checked', goal });
    }

    // Check yesterday's tracking log
    const tracking = await Tracking.findOne({ userId: req.user.id, date: yesterday });
    const hasActivity = tracking && (tracking.steps > 0 || tracking.water > 0 || tracking.sleepHours > 0);

    if (hasActivity) {
      // Completed day
      goal.completedDays.push(yesterday);
      goal.streak += 1;
      if (goal.streak > goal.bestStreak) goal.bestStreak = goal.streak;

      await Notification.create({
        userId: req.user.id,
        message: `✅ Day ${goal.completedDays.length} completed! Streak: ${goal.streak} days 🔥`,
        type: 'success',
        date: today,
      });
    } else {
      // Missed day — flexible mode, streak pauses
      goal.missedDays.push(yesterday);
      goal.streak = 0;

      await Notification.create({
        userId: req.user.id,
        message: `⚠️ You missed Day ${goal.completedDays.length + goal.missedDays.length} of your ${goal.goalType} goal. Keep going — don't give up!`,
        type: 'missed',
        date: today,
      });
    }

    // Check if goal period is over
    if (today > goal.endDate) {
      goal.isActive = false;
      await Notification.create({
        userId: req.user.id,
        message: `🎉 Your ${goal.goalType} goal period is complete! ${goal.completedDays.length} days completed, ${goal.missedDays.length} missed.`,
        type: 'success',
        date: today,
      });
    }

    await goal.save();
    res.json({ message: hasActivity ? 'completed' : 'missed', goal });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /goals/auto-calculate  — returns auto-calculated values from profile
export const autoCalculate = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profile');
    const goalType = req.query.goalType || 'General Health';
    const result = calcFromProfile(user?.profile, goalType);
    res.json({ ...result, profile: user?.profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

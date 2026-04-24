import WorkoutLog from '../models/WorkoutLog.js';
import User from '../models/User.js';

// POST /api/workouts/complete — save session + optional review
export const completeWorkout = async (req, res) => {
  try {
    const { planId, planName, category, duration, calories, exerciseCount, rating, review } = req.body;
    const user = await User.findById(req.user.id).select('name');
    const log = await WorkoutLog.create({
      userId: req.user.id,
      userName: user?.name || 'Anonymous',
      planId, planName, category, duration, calories, exerciseCount,
      rating:  rating  || null,
      review:  review  || '',
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/workouts/history — how many times each plan was done
export const getHistory = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user.id }).sort({ completedAt: -1 });
    // group by planId
    const map = {};
    logs.forEach(l => {
      if (!map[l.planId]) map[l.planId] = { planId: l.planId, count: 0, lastDone: l.completedAt };
      map[l.planId].count++;
    });
    res.json(Object.values(map));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/workouts/my-reviews — current user's reviews
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await WorkoutLog.find({ userId: req.user.id, rating: { $ne: null } })
      .sort({ completedAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/workouts/all-reviews — all users reviews (for homepage)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await WorkoutLog.find({ rating: { $ne: null }, review: { $ne: '' } })
      .sort({ completedAt: -1 })
      .limit(20);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

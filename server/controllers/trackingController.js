import Tracking from '../models/Tracking.js';

const todayStr = () => new Date().toISOString().split('T')[0];

const getOrCreate = async (userId, date) => {
  let log = await Tracking.findOne({ userId, date });
  if (!log) log = await Tracking.create({ userId, date });
  return log;
};

// GET /tracking/today
export const getToday = async (req, res) => {
  try {
    const date = req.query.date || todayStr();
    const log = await getOrCreate(req.user.id, date);
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /tracking/log
export const updateLog = async (req, res) => {
  try {
    const { date, ...fields } = req.body;
    const d = date || todayStr();
    const log = await Tracking.findOneAndUpdate(
      { userId: req.user.id, date: d },
      { $set: fields },
      { new: true, upsert: true }
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /tracking/weekly
export const getWeekly = async (req, res) => {
  try {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const logs = await Tracking.find({ userId: req.user.id, date: { $in: dates } });

    const weekly = dates.map(date => {
      const log = logs.find(l => l.date === date);
      return {
        date,
        steps:          log?.steps          || 0,
        water:          log?.water          || 0,
        sleepHours:     log?.sleepHours     || 0,
        weight:         log?.weight         || 0,
        caloriesBurned: log?.caloriesBurned || 0,
        workoutDone:    log?.workoutDone    || false,
      };
    });

    res.json(weekly.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

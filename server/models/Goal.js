import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalType:         { type: String, default: 'General Health' }, // Weight Loss, Muscle Gain, Maintain, Custom
  calories:         { type: Number, default: 2000 },
  protein:          { type: Number, default: 120 },
  carbs:            { type: Number, default: 250 },
  fat:              { type: Number, default: 65 },
  steps:            { type: Number, default: 10000 },
  workoutDays:      { type: Number, default: 4 },
  workoutDuration:  { type: Number, default: 45 },
  water:            { type: Number, default: 8 },
  sleep:            { type: Number, default: 8 },
  currentWeight:    { type: Number, default: 0 },
  targetWeight:     { type: Number, default: 0 },
  timeline:         { type: Number, default: 30 }, // days
  startDate:        { type: String, default: '' },
  endDate:          { type: String, default: '' },
  missedDays:       [{ type: String }],
  completedDays:    [{ type: String }],
  streak:           { type: Number, default: 0 },
  bestStreak:       { type: Number, default: 0 },
  isActive:         { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);

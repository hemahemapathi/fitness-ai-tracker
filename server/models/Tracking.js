import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  steps: { type: Number, default: 0 },
  distance: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  water: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  sleepStart: { type: String, default: '' },
  sleepEnd: { type: String, default: '' },
  weight: { type: Number, default: 0 },
  workoutDone: { type: Boolean, default: false },
  workoutDuration: { type: Number, default: 0 },
  workoutName: { type: String, default: '' },
}, { timestamps: true });

trackingSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('Tracking', trackingSchema);

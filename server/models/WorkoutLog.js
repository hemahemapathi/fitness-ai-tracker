import mongoose from 'mongoose';

const workoutLogSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId:       { type: Number, required: true },
  planName:     { type: String, required: true },
  category:     { type: String },
  duration:     { type: Number },           // seconds
  calories:     { type: Number },
  exerciseCount:{ type: Number },
  completedAt:  { type: Date, default: Date.now },
  // review
  rating:       { type: Number, min: 1, max: 5 },
  review:       { type: String, trim: true },
  userName:     { type: String },
}, { timestamps: true });

export default mongoose.model('WorkoutLog', workoutLogSchema);

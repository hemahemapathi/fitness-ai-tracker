import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    height: Number,
    weight: Number,
    age: Number,
    gender: String,
    fitnessLevel: String,
    goals: [String],
    concerns: [String]
  },
  mealPlan: {
    name:        { type: String, default: '' },
    description: { type: String, default: '' },
    meals: [
      {
        mealType: String,
        foods:    [String],
        calories: Number,
      }
    ]
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  resetOtp: Number,
  resetOtpExpires: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  calories: { type: Number, required: true },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  unit:     { type: String, default: 'serving' }
});

const outsideFoodSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  calories:    { type: Number, default: 0 },
  loggedAt:    { type: Date, default: Date.now },
});

const dailyLogSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:         { type: String, required: true },
  calorieGoal:  { type: Number, default: 2000 },
  breakfast:    [mealItemSchema],
  lunch:        [mealItemSchema],
  dinner:       [mealItemSchema],
  snacks:       [mealItemSchema],
  outsideFoods: [outsideFoodSchema],
}, { timestamps: true });

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('NutritionLog', dailyLogSchema);

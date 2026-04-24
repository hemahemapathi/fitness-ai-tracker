import NutritionLog from '../models/Nutrition.js';
import User from '../models/User.js';

const today = () => new Date().toISOString().split('T')[0];

const getOrCreate = async (userId, date) => {
  let log = await NutritionLog.findOne({ userId, date });
  if (!log) log = await NutritionLog.create({ userId, date });
  return log;
};

export const getDailyLog = async (req, res) => {
  try {
    const date = req.query.date || today();
    const log = await getOrCreate(req.user.id, date);
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addFoodItem = async (req, res) => {
  try {
    const { date, meal, item } = req.body;
    const validMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    if (!validMeals.includes(meal))
      return res.status(400).json({ message: 'Invalid meal type' });

    const log = await getOrCreate(req.user.id, date || today());
    log[meal].push(item);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const removeFoodItem = async (req, res) => {
  try {
    const { date, meal, itemId } = req.body;
    const log = await NutritionLog.findOne({ userId: req.user.id, date: date || today() });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    log[meal] = log[meal].filter(i => i._id.toString() !== itemId);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateCalorieGoal = async (req, res) => {
  try {
    const { date, calorieGoal } = req.body;
    const log = await getOrCreate(req.user.id, date || today());
    log.calorieGoal = calorieGoal;
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getWeeklyLogs = async (req, res) => {
  try {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const logs = await NutritionLog.find({ userId: req.user.id, date: { $in: dates } });

    const weekly = dates.map(date => {
      const log = logs.find(l => l.date === date);
      if (!log) return { date, calories: 0, protein: 0, carbs: 0, fat: 0 };
      const allItems = [...log.breakfast, ...log.lunch, ...log.dinner, ...log.snacks];
      return {
        date,
        calories: allItems.reduce((s, i) => s + i.calories * i.quantity, 0),
        protein:  allItems.reduce((s, i) => s + i.protein  * i.quantity, 0),
        carbs:    allItems.reduce((s, i) => s + i.carbs    * i.quantity, 0),
        fat:      allItems.reduce((s, i) => s + i.fat      * i.quantity, 0),
      };
    });

    res.json(weekly.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const searchFood = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });

    const foods = [
      { name: 'Chicken Breast (100g)',  calories: 165, protein: 31,  carbs: 0,    fat: 3.6 },
      { name: 'Brown Rice (100g)',       calories: 216, protein: 5,   carbs: 45,   fat: 1.8 },
      { name: 'Egg (1 large)',           calories: 78,  protein: 6,   carbs: 0.6,  fat: 5   },
      { name: 'Banana (1 medium)',       calories: 105, protein: 1.3, carbs: 27,   fat: 0.4 },
      { name: 'Oats (100g)',             calories: 389, protein: 17,  carbs: 66,   fat: 7   },
      { name: 'Milk (250ml)',            calories: 122, protein: 8,   carbs: 12,   fat: 5   },
      { name: 'Greek Yogurt (100g)',     calories: 59,  protein: 10,  carbs: 3.6,  fat: 0.4 },
      { name: 'Almonds (30g)',           calories: 174, protein: 6,   carbs: 6,    fat: 15  },
      { name: 'Sweet Potato (100g)',     calories: 86,  protein: 1.6, carbs: 20,   fat: 0.1 },
      { name: 'Salmon (100g)',           calories: 208, protein: 20,  carbs: 0,    fat: 13  },
      { name: 'Broccoli (100g)',         calories: 34,  protein: 2.8, carbs: 7,    fat: 0.4 },
      { name: 'White Rice (100g)',       calories: 130, protein: 2.7, carbs: 28,   fat: 0.3 },
      { name: 'Bread (1 slice)',         calories: 79,  protein: 3,   carbs: 15,   fat: 1   },
      { name: 'Apple (1 medium)',        calories: 95,  protein: 0.5, carbs: 25,   fat: 0.3 },
      { name: 'Peanut Butter (2 tbsp)', calories: 188, protein: 8,   carbs: 6,    fat: 16  },
      { name: 'Tuna (100g)',             calories: 116, protein: 26,  carbs: 0,    fat: 1   },
      { name: 'Orange (1 medium)',       calories: 62,  protein: 1.2, carbs: 15,   fat: 0.2 },
      { name: 'Cottage Cheese (100g)',   calories: 98,  protein: 11,  carbs: 3.4,  fat: 4.3 },
      { name: 'Pasta (100g cooked)',     calories: 131, protein: 5,   carbs: 25,   fat: 1.1 },
      { name: 'Avocado (100g)',          calories: 160, protein: 2,   carbs: 9,    fat: 15  },
      { name: 'Paneer (100g)',           calories: 265, protein: 18,  carbs: 1.2,  fat: 20  },
      { name: 'Dal (100g cooked)',       calories: 116, protein: 9,   carbs: 20,   fat: 0.4 },
      { name: 'Roti (1 medium)',         calories: 104, protein: 3,   carbs: 18,   fat: 2.5 },
      { name: 'Idli (1 piece)',          calories: 39,  protein: 2,   carbs: 8,    fat: 0.2 },
      { name: 'Dosa (1 medium)',         calories: 133, protein: 3.5, carbs: 22,   fat: 3.7 },
      { name: 'Whey Protein (1 scoop)', calories: 120, protein: 25,  carbs: 3,    fat: 1.5 },
      { name: 'Peanuts (30g)',           calories: 166, protein: 7.5, carbs: 4.5,  fat: 14  },
      { name: 'Curd (100g)',             calories: 61,  protein: 3.5, carbs: 4.7,  fat: 3.3 },
      { name: 'Spinach (100g)',          calories: 23,  protein: 2.9, carbs: 3.6,  fat: 0.4 },
      { name: 'Potato (100g boiled)',    calories: 87,  protein: 1.9, carbs: 20,   fat: 0.1 },
    ];

    const results = foods.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET auto-calculated nutrition goals from user profile
export const getProfileGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profile');
    const p = user?.profile || {};

    const weight = p.weight || 70;
    const height = p.height || 170;
    const age    = p.age    || 25;
    const gender = p.gender || 'male';
    const goal   = (p.goals || [])[0] || 'General Health';
    const level  = p.fitnessLevel || 'Beginner';

    // BMR (Mifflin-St Jeor)
    const bmr = gender === 'female'
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;

    // Activity multiplier
    const activityMap = { Beginner: 1.375, Intermediate: 1.55, Advanced: 1.725 };
    const tdee = Math.round(bmr * (activityMap[level] || 1.375));

    // Calorie target by goal
    let calories;
    if (goal === 'Weight Loss')   calories = Math.round(tdee - 400);
    else if (goal === 'Muscle Gain') calories = Math.round(tdee + 300);
    else                          calories = tdee;

    // Macro split (protein: 30%, carbs: 45%, fat: 25%)
    const protein = Math.round((calories * 0.30) / 4);
    const carbs   = Math.round((calories * 0.45) / 4);
    const fat     = Math.round((calories * 0.25) / 9);

    res.json({ calories, protein, carbs, fat, goal, weight, tdee });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET user's meal plan
export const getMealPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('mealPlan');
    res.json(user?.mealPlan || null);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Save/update meal plan
export const saveMealPlan = async (req, res) => {
  try {
    const { name, description, meals } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { mealPlan: { name, description, meals } },
      { new: true }
    ).select('mealPlan');
    res.json(user.mealPlan);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Log outside food
export const logOutsideFood = async (req, res) => {
  try {
    const { date, name, description, calories } = req.body;
    const log = await getOrCreate(req.user.id, date || today());
    log.outsideFoods.push({ name, description, calories: calories || 0 });
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove outside food
export const removeOutsideFood = async (req, res) => {
  try {
    const { date, itemId } = req.body;
    const log = await NutritionLog.findOne({ userId: req.user.id, date: date || today() });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    log.outsideFoods = log.outsideFoods.filter(i => i._id.toString() !== itemId);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

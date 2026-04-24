import Groq from 'groq-sdk';
import User from '../models/User.js';
import Tracking from '../models/Tracking.js';
import Goal from '../models/Goal.js';
import NutritionLog from '../models/Nutrition.js';

const todayStr = () => new Date().toISOString().split('T')[0];

const buildContext = async (userId) => {
  try {
    const user     = await User.findById(userId).select('name profile');
    const tracking = await Tracking.findOne({ userId, date: todayStr() });
    const goal     = await Goal.findOne({ userId }).sort({ createdAt: -1 });
    const nutrition = await NutritionLog.findOne({ userId, date: todayStr() });

    const p = user?.profile || {};
    const totalCal = nutrition
      ? [...nutrition.breakfast, ...nutrition.lunch, ...nutrition.dinner, ...nutrition.snacks]
          .reduce((s, i) => s + i.calories * i.quantity, 0)
      : 0;

    return `
User Profile:
- Name: ${user?.name || 'User'}
- Age: ${p.age || 'unknown'}, Gender: ${p.gender || 'unknown'}
- Weight: ${p.weight || 'unknown'}kg, Height: ${p.height || 'unknown'}cm
- Fitness Level: ${p.fitnessLevel || 'unknown'}
- Goals: ${p.goals?.join(', ') || 'unknown'}
- Concerns: ${p.concerns?.join(', ') || 'none'}

Today's Tracking (${todayStr()}):
- Steps: ${tracking?.steps || 0} / 10,000
- Water: ${tracking?.water || 0} glasses
- Sleep: ${tracking?.sleepHours || 0}h
- Calories Burned: ${tracking?.caloriesBurned || 0} kcal
- Workout: ${tracking?.workoutDone ? `Done (${tracking.workoutName || 'unnamed'}, ${tracking.workoutDuration || 0} mins)` : 'Not done'}

Today's Nutrition:
- Calories Consumed: ${Math.round(totalCal)} kcal

Active Goal:
- Type: ${goal?.goalType || 'none'}
- Calorie Target: ${goal?.calories || 'none'} kcal/day
- Protein: ${goal?.protein || 'none'}g, Carbs: ${goal?.carbs || 'none'}g, Fat: ${goal?.fat || 'none'}g
- Steps Goal: ${goal?.steps || 'none'}/day
- Timeline: ${goal?.timeline || 'none'} days
- Streak: ${goal?.streak || 0} days
    `.trim();
  } catch {
    return 'User data unavailable.';
  }
};

// POST /ai/chat
export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const context = await buildContext(req.user.id);

    const systemPrompt = `You are FitAI, a personal fitness and nutrition coach. You have access to the user's real fitness data shown below. Use this data to give personalized, specific advice.

${context}

Rules:
- Always be encouraging and motivating
- Give specific advice based on the user's actual data
- Keep responses concise (2-4 sentences max unless asked for detail)
- Only answer fitness, nutrition, health, and wellness questions
- If asked about something unrelated, politely redirect to fitness topics
- Use the user's name when appropriate`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // last 10 messages for context
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ message: 'AI error', error: err.message });
  }
};

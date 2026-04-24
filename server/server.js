import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import nutritionRoutes from './routes/nutrition.js';
import workoutRoutes from './routes/workout.js';
import trackingRoutes from './routes/tracking.js';
import goalRoutes from './routes/goals.js';
import notificationRoutes from './routes/notifications.js';
import profileRoutes from './routes/profile.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Fitness App API is running!' }));

app.use('/api/auth',          authRoutes);
app.use('/api/nutrition',     nutritionRoutes);
app.use('/api/workouts',      workoutRoutes);
app.use('/api/tracking',      trackingRoutes);
app.use('/api/goals',         goalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/ai',            aiRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

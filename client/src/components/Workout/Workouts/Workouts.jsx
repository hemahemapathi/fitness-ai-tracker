import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavbar from '../../Navbar/Navbar';
import './Workouts.css';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('token');

const categoryColors = {
  'weight-loss':    { from: '#ef4444', to: '#f97316' },
  'weight-gain':    { from: '#3b82f6', to: '#6366f1' },
  'muscle-gain':    { from: '#a855f7', to: '#ec4899' },
  'endurance':      { from: '#f59e0b', to: '#ef4444' },
  'flexibility':    { from: '#10b981', to: '#3b82f6' },
  'core-strength':  { from: '#00ff00', to: '#10b981' },
  'rehabilitation': { from: '#64748b', to: '#94a3b8' },
  'sports-training':{ from: '#f97316', to: '#f59e0b' },
  'stress-relief':  { from: '#8b5cf6', to: '#3b82f6' },
  'all':            { from: '#00ff00', to: '#3b82f6' },
};

const categoryIcons = {
  'weight-loss':    '🔥',
  'weight-gain':    '💪',
  'muscle-gain':    '🏋️',
  'endurance':      '⚡',
  'flexibility':    '🧘',
  'core-strength':  '🎯',
  'rehabilitation': '🩺',
  'sports-training':'🏃',
  'stress-relief':  '🌿',
  'all':            '💪',
};

const muscleGroups = {
  'weight-loss':    ['Full Body', 'Cardio', 'Core'],
  'weight-gain':    ['Chest', 'Back', 'Legs'],
  'muscle-gain':    ['Chest', 'Arms', 'Shoulders'],
  'endurance':      ['Cardio', 'Legs', 'Core'],
  'flexibility':    ['Hips', 'Back', 'Hamstrings'],
  'core-strength':  ['Abs', 'Obliques', 'Lower Back'],
  'rehabilitation': ['Joints', 'Mobility', 'Balance'],
  'sports-training':['Agility', 'Speed', 'Power'],
  'stress-relief':  ['Mind', 'Breathing', 'Stretch'],
};

const categories = [
  { id: 'all',            name: 'All Workouts' },
  { id: 'weight-loss',    name: 'Weight Loss' },
  { id: 'weight-gain',    name: 'Weight Gain' },
  { id: 'muscle-gain',    name: 'Muscle Gain' },
  { id: 'endurance',      name: 'Endurance' },
  { id: 'flexibility',    name: 'Flexibility' },
  { id: 'core-strength',  name: 'Core Strength' },
  { id: 'rehabilitation', name: 'Rehabilitation' },
  { id: 'sports-training','name': 'Sports Training' },
  { id: 'stress-relief',  name: 'Stress Relief' },
];

const workoutPlans = [
  { id: 1,  name: 'Fat Burn HIIT',       category: 'weight-loss',    duration: '4 min',  difficulty: 'Beginner',     exercises: 4, calories: '50-80',   description: 'High-intensity interval training for quick results',      exercises_list: ['Jumping Jacks','Push-ups','Squats','Plank'] },
  { id: 2,  name: 'Quick Fat Burner',    category: 'weight-loss',    duration: '7 min',  difficulty: 'Intermediate', exercises: 5, calories: '70-100',  description: 'Quick and effective fat burning routine',                 exercises_list: ['Jumping Jacks','Squats','Push-ups','Mountain Climbers','Burpees'] },
  { id: 3,  name: 'Cardio Blast',        category: 'weight-loss',    duration: '10 min', difficulty: 'Intermediate', exercises: 6, calories: '100-130', description: 'High-energy cardio for maximum burn',                     exercises_list: ['High Knees','Butt Kicks','Jump Squats','Burpees','Mountain Climbers','Jumping Jacks'] },
  { id: 4,  name: 'Metabolic Booster',   category: 'weight-loss',    duration: '12 min', difficulty: 'Advanced',     exercises: 7, calories: '120-160', description: 'Boost your metabolism with intense exercises',            exercises_list: ['Burpees','Jump Squats','Push-ups','Mountain Climbers','Plank Jacks','High Knees','Russian Twists'] },
  { id: 5,  name: 'Fat Melter',          category: 'weight-loss',    duration: '15 min', difficulty: 'Advanced',     exercises: 8, calories: '150-200', description: 'Ultimate fat burning workout',                            exercises_list: ['Burpees','Jump Squats','Push-ups','Mountain Climbers','Plank Jacks','High Knees','Tricep Dips','Bicycle Crunches'] },
  { id: 6,  name: 'Strength Builder',    category: 'weight-gain',    duration: '8 min',  difficulty: 'Beginner',     exercises: 5, calories: '80-100',  description: 'Build strength and muscle mass',                          exercises_list: ['Push-ups','Squats','Lunges','Plank','Wall Sit'] },
  { id: 7,  name: 'Mass Gainer',         category: 'weight-gain',    duration: '12 min', difficulty: 'Intermediate', exercises: 6, calories: '120-150', description: 'Focus on muscle building exercises',                      exercises_list: ['Push-ups','Pike Push-ups','Tricep Dips','Squats','Lunges','Plank'] },
  { id: 8,  name: 'Power Builder',       category: 'weight-gain',    duration: '15 min', difficulty: 'Intermediate', exercises: 7, calories: '150-180', description: 'Build power and muscle definition',                       exercises_list: ['Push-ups','Pike Push-ups','Tricep Dips','Jump Squats','Lunges','Plank','Mountain Climbers'] },
  { id: 9,  name: 'Muscle Maximizer',    category: 'weight-gain',    duration: '18 min', difficulty: 'Advanced',     exercises: 8, calories: '180-220', description: 'Maximum muscle building workout',                         exercises_list: ['Push-ups','Pike Push-ups','Tricep Dips','Jump Squats','Lunges','Plank','Mountain Climbers','Burpees'] },
  { id: 10, name: 'Bulk Builder',        category: 'weight-gain',    duration: '20 min', difficulty: 'Advanced',     exercises: 9, calories: '200-250', description: 'Complete muscle building routine',                        exercises_list: ['Push-ups','Pike Push-ups','Tricep Dips','Jump Squats','Lunges','Plank','Mountain Climbers','Burpees','Russian Twists'] },
  { id: 11, name: 'Muscle Starter',      category: 'muscle-gain',    duration: '6 min',  difficulty: 'Beginner',     exercises: 4, calories: '60-80',   description: 'Start your muscle building journey',                      exercises_list: ['Push-ups','Squats','Plank','Lunges'] },
  { id: 12, name: 'Muscle Builder',      category: 'muscle-gain',    duration: '10 min', difficulty: 'Intermediate', exercises: 6, calories: '100-120', description: 'Build upper body muscle and strength',                    exercises_list: ['Push-ups','Pike Push-ups','Tricep Dips','Plank','Mountain Climbers','Squats'] },
  { id: 13, name: 'Muscle Sculptor',     category: 'muscle-gain',    duration: '12 min', difficulty: 'Intermediate', exercises: 7, calories: '120-140', description: 'Sculpt and define your muscles',                          exercises_list: ['Push-ups','Pike Push-ups','Tricep Dips','Plank','Mountain Climbers','Squats','Lunges'] },
  { id: 14, name: 'Muscle Dominator',    category: 'muscle-gain',    duration: '15 min', difficulty: 'Advanced',     exercises: 8, calories: '150-180', description: 'Dominate your muscle building goals',                     exercises_list: ['Push-ups','Pike Push-ups','Tricep Dips','Plank','Mountain Climbers','Squats','Lunges','Burpees'] },
  { id: 15, name: 'Muscle Master',       category: 'muscle-gain',    duration: '18 min', difficulty: 'Advanced',     exercises: 9, calories: '180-220', description: 'Master level muscle building',                            exercises_list: ['Push-ups','Pike Push-ups','Tricep Dips','Plank','Mountain Climbers','Squats','Lunges','Burpees','Russian Twists'] },
  { id: 16, name: 'Cardio Starter',      category: 'endurance',      duration: '5 min',  difficulty: 'Beginner',     exercises: 4, calories: '50-70',   description: 'Build your cardio foundation',                            exercises_list: ['Jumping Jacks','High Knees','Butt Kicks','March in Place'] },
  { id: 17, name: 'Cardio Endurance',    category: 'endurance',      duration: '10 min', difficulty: 'Beginner',     exercises: 5, calories: '100-150', description: 'Get your heart pumping with cardio exercises',            exercises_list: ['Jumping Jacks','High Knees','Butt Kicks','Mountain Climbers','Burpees'] },
  { id: 18, name: 'Stamina Builder',     category: 'endurance',      duration: '12 min', difficulty: 'Intermediate', exercises: 6, calories: '120-160', description: 'Build lasting stamina and endurance',                     exercises_list: ['Jumping Jacks','High Knees','Butt Kicks','Mountain Climbers','Burpees','Jump Squats'] },
  { id: 19, name: 'Endurance Pro',       category: 'endurance',      duration: '15 min', difficulty: 'Advanced',     exercises: 7, calories: '150-200', description: 'Professional level endurance training',                   exercises_list: ['Jumping Jacks','High Knees','Butt Kicks','Mountain Climbers','Burpees','Jump Squats','Plank Jacks'] },
  { id: 20, name: 'Cardio Master',       category: 'endurance',      duration: '20 min', difficulty: 'Advanced',     exercises: 8, calories: '200-250', description: 'Master your cardiovascular fitness',                      exercises_list: ['Jumping Jacks','High Knees','Butt Kicks','Mountain Climbers','Burpees','Jump Squats','Plank Jacks','Russian Twists'] },
  { id: 21, name: 'Gentle Stretch',      category: 'flexibility',    duration: '5 min',  difficulty: 'Beginner',     exercises: 4, calories: '20-30',   description: 'Gentle stretching for beginners',                         exercises_list: ['Cat Cow Stretch','Child Pose','Seated Twist','Forward Fold'] },
  { id: 22, name: 'Flexibility Flow',    category: 'flexibility',    duration: '8 min',  difficulty: 'Beginner',     exercises: 6, calories: '30-50',   description: 'Improve flexibility and mobility',                        exercises_list: ['Cat Cow Stretch','Downward Dog','Child Pose','Cobra Stretch','Seated Twist','Forward Fold'] },
  { id: 23, name: 'Mobility Master',     category: 'flexibility',    duration: '10 min', difficulty: 'Intermediate', exercises: 7, calories: '40-60',   description: 'Master your mobility and flexibility',                    exercises_list: ['Cat Cow Stretch','Downward Dog','Child Pose','Cobra Stretch','Seated Twist','Forward Fold','Hip Circles'] },
  { id: 24, name: 'Core Basics',         category: 'core-strength',  duration: '6 min',  difficulty: 'Beginner',     exercises: 4, calories: '40-60',   description: 'Basic core strengthening exercises',                      exercises_list: ['Plank','Crunches','Dead Bug','Bird Dog'] },
  { id: 25, name: 'Core Builder',        category: 'core-strength',  duration: '8 min',  difficulty: 'Intermediate', exercises: 5, calories: '50-70',   description: 'Build a stronger core foundation',                        exercises_list: ['Plank','Russian Twists','Bicycle Crunches','Dead Bug','Mountain Climbers'] },
  { id: 26, name: 'Core Crusher',        category: 'core-strength',  duration: '12 min', difficulty: 'Advanced',     exercises: 6, calories: '60-90',   description: 'Targeted core strengthening workout',                     exercises_list: ['Plank','Russian Twists','Bicycle Crunches','Dead Bug','Mountain Climbers','Leg Raises'] },
  { id: 27, name: 'Gentle Recovery',     category: 'rehabilitation', duration: '8 min',  difficulty: 'Beginner',     exercises: 5, calories: '20-30',   description: 'Gentle movements for recovery',                           exercises_list: ['Gentle Stretches','Joint Mobility','Light Movement','Breathing Exercises','Balance Work'] },
  { id: 28, name: 'Athletic Basics',     category: 'sports-training',duration: '10 min', difficulty: 'Beginner',     exercises: 5, calories: '80-100',  description: 'Basic athletic training foundation',                      exercises_list: ['Agility Ladder','Cone Drills','Sprint Intervals','Jump Training','Coordination'] },
  { id: 29, name: 'Speed & Agility',     category: 'sports-training',duration: '15 min', difficulty: 'Intermediate', exercises: 6, calories: '120-150', description: 'Improve speed and agility',                               exercises_list: ['Agility Ladder','Cone Drills','Sprint Intervals','Jump Training','Coordination','Plyometric Jumps'] },
  { id: 30, name: 'Calm & Relax',        category: 'stress-relief',  duration: '8 min',  difficulty: 'Beginner',     exercises: 4, calories: '20-30',   description: 'Simple relaxation techniques',                            exercises_list: ['Deep Breathing','Gentle Yoga','Meditation','Progressive Relaxation'] },
];

const difficultyColor = { Beginner: '#f7faf7', Intermediate: '#f8f6f3', Advanced: '#faf6f6' };

const Workouts = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [history, setHistory] = useState({});   // { planId: { count, lastDone } }
  const plansRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API}/workouts/history`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const map = {};
        data.forEach(h => { map[h.planId] = h; });
        setHistory(map);
      } catch { /* silent */ }
    };
    fetchHistory();
  }, []);

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    setTimeout(() => {
      plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const filtered = selectedCategory === 'all'
    ? workoutPlans
    : workoutPlans.filter(p => p.category === selectedCategory);

  return (
    <div className="workouts-page">
      <CustomNavbar />

      {/* Hero */}
      <div className="workouts-hero">
        <div className="workouts-hero-overlay" />
        <div className="workouts-hero-content">
          <p className="tag">TRAINING PROGRAMS</p>
          <h1>Choose Your <span className="neon">WORKOUT</span></h1>
          <p className="hero-sub">Select a category and start training with our curated workout plans.</p>
        </div>
      </div>

      <div className="workouts-body">

        {/* Categories */}
        <div className="categories-wrap">
          <div className="categories-scroll">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="plans-grid" ref={plansRef}>
          {filtered.map(plan => {
            const colors = categoryColors[plan.category] || categoryColors['all'];
            const icon   = categoryIcons[plan.category] || '💪';
            const muscles = muscleGroups[plan.category] || [];
            const diffPct = plan.difficulty === 'Beginner' ? 33 : plan.difficulty === 'Intermediate' ? 66 : 100;
            const diffColor = difficultyColor[plan.difficulty];
            return (
              <div key={plan.id} className="plan-card">

                {/* Card Top Bar */}
               <div className="plan-body">
                  <h5>{plan.name}</h5>
                  <p className="plan-desc">{plan.description}</p>
                  {/* Stats Row */}
                  <div className="plan-stats">
                    <div className="plan-stat">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>{plan.duration}</span>
                    </div>
                    <div className="plan-stat">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4"/></svg>
                      <span>{plan.exercises} exercises</span>
                    </div>
                  </div>

                  {/* Difficulty Meter */}
                  <div className="plan-diff-wrap">
                    <div className="plan-diff-info">
                      <span className="plan-diff-label">Difficulty</span>
                      <span className="plan-diff-val" style={{ color: diffColor }}>{plan.difficulty}</span>
                    </div>
                    <div className="plan-diff-bar">
                      <div className="plan-diff-fill" style={{ width: `${diffPct}%`, background: diffColor, boxShadow: `0 0 6px ${diffColor}66` }} />
                    </div>
                  </div>

                

                  <button className="start-btn" onClick={() => navigate('/workout-player', { state: { workoutPlan: plan } })}>
                    Start Workout
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Workouts;

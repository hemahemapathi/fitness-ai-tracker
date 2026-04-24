import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip
} from 'chart.js';
import CustomNavbar from '../Navbar/Navbar';
import './TrackingPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const API = `${import.meta.env.VITE_API_URL}/tracking`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });
const todayStr = () => new Date().toISOString().split('T')[0];

const GOALS = { steps: 10000, water: 8, sleep: 8, calories: 500 };

const calcSleep = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
};

export default function TrackingPage() {
  const [date, setDate] = useState(todayStr());
  const [log, setLog] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Athlete');
  const [activeChart, setActiveChart] = useState('steps');
  const [sleepInput, setSleepInput] = useState({ start: '', end: '' });
  const [weightInput, setWeightInput] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [workoutInput, setWorkoutInput] = useState({ name: '', duration: '' });
  const saveTimer = useRef(null);

  const fetchToday = async (d) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/today?date=${d}`, { headers: headers() });
      const data = await res.json();
      if (res.ok) {
        setLog(data);
        setSleepInput({ start: data.sleepStart || '', end: data.sleepEnd || '' });
        setWeightInput(data.weight || '');
        setStepsInput(data.steps || '');
        setWorkoutInput({ name: data.workoutName || '', duration: data.workoutDuration || '' });
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchWeekly = async () => {
    try {
      const res = await fetch(`${API}/weekly`, { headers: headers() });
      const data = await res.json();
      if (res.ok) setWeekly(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUserName(JSON.parse(stored).name || 'Athlete'); } catch { /* silent */ }
    }
  }, []);

  useEffect(() => { fetchToday(date); fetchWeekly(); }, [date]);

  const save = async (fields) => {
    try {
      const res = await fetch(`${API}/log`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ date, ...fields }),
      });
      const data = await res.json();
      if (res.ok) { setLog(data); fetchWeekly(); }
    } catch { /* silent */ }
  };

  const debounce = (fields) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(fields), 800);
  };

  const addWater = () => { const w = (log?.water || 0) + 1; save({ water: w }); };
  const removeWater = () => { const w = Math.max(0, (log?.water || 0) - 1); save({ water: w }); };
  const toggleWorkout = () => save({ workoutDone: !log?.workoutDone });

  const handleSleep = (field, val) => {
    const updated = { ...sleepInput, [field]: val };
    setSleepInput(updated);
    const hrs = calcSleep(updated.start, updated.end);
    debounce({ sleepStart: updated.start, sleepEnd: updated.end, sleepHours: hrs });
  };

  const handleWeight = (val) => {
    setWeightInput(val);
    debounce({ weight: parseFloat(val) || 0 });
  };

  const handleSteps = (val) => {
    setStepsInput(val);
    debounce({ steps: parseInt(val) || 0, distance: Math.round((parseInt(val) || 0) * 0.0008 * 10) / 10 });
  };

  const handleWorkout = (field, val) => {
    const updated = { ...workoutInput, [field]: val };
    setWorkoutInput(updated);
    debounce({ workoutName: updated.name, workoutDuration: parseInt(updated.duration) || 0 });
  };

  const steps = log?.steps || 0;
  const water = log?.water || 0;
  const sleep = log?.sleepHours || 0;
  const weight = log?.weight || 0;
  const calBurned = log?.caloriesBurned || 0;
  const workoutDone = log?.workoutDone || false;

  const stepsPct  = Math.min((steps / GOALS.steps) * 100, 100);
  const waterPct  = Math.min((water / GOALS.water) * 100, 100);
  const sleepPct  = Math.min((sleep / GOALS.sleep) * 100, 100);

  const chartConfigs = {
    steps:      { label: 'Steps',           color: '#00ff00', key: 'steps' },
    water:      { label: 'Water (glasses)', color: '#3b82f6', key: 'water' },
    sleep:      { label: 'Sleep (hrs)',     color: '#a855f7', key: 'sleepHours' },
    calories:   { label: 'Cal Burned',      color: '#f59e0b', key: 'caloriesBurned' },
    weight:     { label: 'Weight (kg)',     color: '#ef4444', key: 'weight' },
  };

  const cfg = chartConfigs[activeChart];
  const chartLabels = weekly.map(w => new Date(w.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', day: 'numeric' }));
  const chartData = weekly.map(w => w[cfg.key] || 0);

  const chartDataset = {
    labels: chartLabels,
    datasets: [{
      label: cfg.label,
      data: chartData,
      borderColor: cfg.color,
      backgroundColor: `${cfg.color}15`,
      borderWidth: 2,
      pointBackgroundColor: cfg.color,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: '#111',
      borderColor: cfg.color,
      borderWidth: 1,
      titleColor: '#888',
      bodyColor: cfg.color,
      bodyFont: { weight: 'bold' },
    }},
    scales: {
      x: { grid: { color: '#0f0f0f' }, ticks: { color: '#333', font: { size: 11 } } },
      y: { grid: { color: '#0f0f0f' }, ticks: { color: '#333', font: { size: 11 } }, beginAtZero: true },
    },
  };

  const insights = () => {
    const tips = [];
    if (steps < GOALS.steps) tips.push({ icon: '🚶', text: `${(GOALS.steps - steps).toLocaleString()} more steps to hit your goal`, color: '#00ff00' });
    else tips.push({ icon: '🎉', text: 'Steps goal crushed today!', color: '#00ff00' });
    if (water < GOALS.water) tips.push({ icon: '💧', text: `Drink ${GOALS.water - water} more glasses of water`, color: '#3b82f6' });
    else tips.push({ icon: '✅', text: 'Hydration goal complete!', color: '#3b82f6' });
    if (sleep < 6) tips.push({ icon: '🌙', text: 'You slept less than 6hrs. Sleep earlier tonight', color: '#a855f7' });
    else if (sleep >= GOALS.sleep) tips.push({ icon: '😴', text: 'Great sleep! Your body is recovering well', color: '#a855f7' });
    else tips.push({ icon: '🌙', text: `${(GOALS.sleep - sleep).toFixed(1)} more hours of sleep recommended`, color: '#a855f7' });
    if (!workoutDone) tips.push({ icon: '🏋️', text: "Don't forget your workout today!", color: '#ef4444' });
    else tips.push({ icon: '💪', text: 'Workout done! Great discipline!', color: '#ef4444' });
    return tips;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Good Morning';
    if (h >= 12 && h < 17) return 'Good Afternoon';
    if (h >= 17 && h < 21) return 'Good Evening';
    return 'Good Night';
  };

  if (loading) return (
    <div className="track-page">
      <CustomNavbar />
      <div className="track-loading"><div className="track-spinner" /></div>
    </div>
  );

  return (
    <div className="track-page">
      <CustomNavbar />

      {/* ── Hero ── */}
      <div className="track-hero">
        <div className="track-hero-left">
          <span className="track-eyebrow">DAILY TRACKING</span>
          <h1 className="track-h1">{greeting()}, <span className="track-accent">{userName}</span></h1>
          <p className="track-sub">
            {new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="track-date-nav">
          <button className="track-date-btn" onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d.toISOString().split('T')[0]); }}>‹</button>
          <span className="track-date-label">{new Date(date + 'T00:00:00').toLocaleDateString('en', { day: '2-digit', month: 'short' })}</span>
          <button className="track-date-btn" onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); const next = d.toISOString().split('T')[0]; if (next <= todayStr()) setDate(next); }} disabled={date === todayStr()}>›</button>
        </div>
      </div>

      <div className="track-body">

        {/* ── Summary Cards ── */}
        <div className="summary-grid">

          {/* Steps */}
          <div className="summary-card steps-card">
            <div className="sc-top">
              <span className="sc-heading">ACTIVITY</span>
              <span className={`sc-status ${steps >= GOALS.steps ? 'done' : ''}`}>{steps >= GOALS.steps ? '✅' : '○'}</span>
            </div>
            <div className="sc-ring-wrap">
              <svg viewBox="0 0 80 80" className="sc-ring">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#111" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#00ff00" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - stepsPct / 100)}
                  transform="rotate(-90 40 40)"
                  style={{ filter: 'drop-shadow(0 0 6px #00ff00)', transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="sc-ring-center">
                <span className="sc-val steps-val">{steps.toLocaleString()}</span>
                <span className="sc-unit">steps</span>
              </div>
            </div>
            <div className="sc-goal"></div>
            <div className="sc-bottom">
              <input className="sc-log-inputs" type="number" placeholder="Log steps..."
                value={stepsInput} onChange={e => handleSteps(e.target.value)} />
            </div>
          </div>

          {/* Water */}
          <div className="summary-card water-card">
            <div className="sc-top">
              <span className="sc-heading">WATER</span>
              <span className={`sc-status ${water >= GOALS.water ? 'done' : ''}`}>{water >= GOALS.water ? '✅' : '○'}</span>
            </div>
            <div className="water-glass-wrap">
              <div className="water-glass">
                <div className="water-fill" style={{ height: `${waterPct}%` }} />
                <span className="water-label">{water}/{GOALS.water}</span>
              </div>
            </div>
            <div className="sc-goal"></div>
            <div className="sc-bottom">
              <button className="sc-log-inputs" onClick={removeWater}>−</button>
              <span className="sc-log-val">{water} glasses</span>
              <button className="sc-log-inputs" onClick={addWater}>+</button>
            </div>
          </div>

          {/* Sleep */}
          <div className="summary-card sleep-card">
            <div className="sc-top">
              <span className="sc-heading">SLEEP</span>
              <span className={`sc-status ${sleep >= GOALS.sleep ? 'done' : ''}`}>{sleep >= GOALS.sleep ? '✅' : '○'}</span>
            </div>
            <div className="sleep-arc-wrap">
              <svg viewBox="0 0 100 60" className="sleep-arc">
                <path d="M10,55 A40,40 0 0,1 90,55" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" />
                <path d="M10,55 A40,40 0 0,1 90,55" fill="none" stroke="#a855f7" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 * (1 - sleepPct / 100)}
                  style={{ filter: 'drop-shadow(0 0 6px #a855f7)', transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="sleep-arc-center">
                <span className="sc-val sleep-val">{sleep}h</span>
                <span className="sc-unit">sleep</span>
              </div>
            </div>
            <div className="sc-goal"></div>
            <div className="sc-bottom">
              <input className="sc-log-inputs" type="time" value={sleepInput.start} onChange={e => handleSleep('start', e.target.value)} />
              <input className="sc-log-inputs" type="time" value={sleepInput.end} onChange={e => handleSleep('end', e.target.value)} />
            </div>
          </div>

          {/* Calories Burned */}
          <div className="summary-card cal-card">
            <div className="sc-top">
              <span className="sc-heading">CALORIES BURNED</span>
              <span className={`sc-status ${calBurned >= GOALS.calories ? 'done' : ''}`}>{calBurned >= GOALS.calories ? '✅' : '○'}</span>
            </div>
            <div className="cal-display">
              <span className="cal-big">{calBurned}</span>
              <span className="cal-unit">kcal burned</span>
            </div>
            <div className="cal-bar-wrap">
              <div className="cal-bar-bg">
                <div className="cal-bar-fill" style={{ width: `${Math.min((calBurned / GOALS.calories) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="sc-bottom">
              <input className="sc-log-inputs" type="number" placeholder="Log calories burned..."
                onChange={e => debounce({ caloriesBurned: parseInt(e.target.value) || 0 })}
                defaultValue={calBurned || ''} />
            </div>
          </div>

          {/* Weight */}
          <div className="summary-card weight-card">
            <div className="sc-top">
              <span className="sc-heading">WEIGHT</span>
              <span className="sc-status">{weight > 0 ? '✅' : '○'}</span>
            </div>
            <div className="weight-display">
              <span className="weight-big">{weight > 0 ? weight : '—'}</span>
              <span className="weight-unit">kg</span>
            </div>
            <div className="weight-trend">
              {weekly.filter(w => w.weight > 0).length > 1 && (() => {
                const vals = weekly.filter(w => w.weight > 0);
                const diff = (vals[vals.length - 1].weight - vals[0].weight).toFixed(1);
                return <span style={{ color: diff > 0 ? '#ef4444' : '#00ff00' }}>{diff > 0 ? '▲' : '▼'} {Math.abs(diff)} kg this week</span>;
              })()}
            </div>
            <div className="sc-bottom">
              <input className="sc-log-inputs" type="number" placeholder="Log weight (kg)..." step="0.1"
                value={weightInput} onChange={e => handleWeight(e.target.value)} />
            </div>
          </div>

          {/* Workout */}
          <div className="summary-card workout-card">
            <div className="sc-top">
              <span className="sc-heading">WORKOUT</span>
              <span className={`sc-status ${workoutDone ? 'done' : ''}`}>{workoutDone ? '✅' : '○'}</span>
            </div>
            <div className="workout-display">
              <span className="workout-name">{log?.workoutName || 'No workout logged'}</span>
              {log?.workoutDuration > 0 && <span className="workout-dur">{log.workoutDuration} mins</span>}
            </div>
            <div className="sc-bottom sc-bottom-col">
              <input className="sc-log-inputs" placeholder="Workout name..." value={workoutInput.name}
                onChange={e => handleWorkout('name', e.target.value)} />
              <input className="sc-log-inputs" placeholder="Duration (mins)..." value={workoutInput.duration}
                onChange={e => handleWorkout('duration', e.target.value)} />
              <button className={`sc-log-btn sc-log-btn-full ${workoutDone ? 'active' : ''}`} onClick={toggleWorkout}>
                {workoutDone ? '✓ Done' : 'Mark Done'}
              </button>
            </div>
          </div>

        </div>

        {/* ── Charts ── */}
        <div className="chart-section">
          <div className="chart-header">
            <div>
              <span className="track-eyebrow">7-DAY TRENDS</span>
              <h2 className="section-title">Progress <span className="track-accent">Charts</span></h2>
            </div>
            <div className="chart-tabs">
              {Object.entries(chartConfigs).map(([key, c]) => (
                <button key={key} className={`chart-tab ${activeChart === key ? 'active' : ''}`}
                  style={{ '--tab-color': c.color }}
                  onClick={() => setActiveChart(key)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-wrap">
            <Line data={chartDataset} options={chartOptions} />
          </div>
        </div>

        {/* ── Smart Insights ── */}
        <div className="insights-section">
          <span className="track-eyebrow">SMART INSIGHTS</span>
          <h2 className="section-title">Today's <span className="track-accent">Insights</span></h2>
          <div className="insights-grid">
            {insights().map((tip, i) => (
              <div key={i} className="insight-card" style={{ borderColor: tip.color }}>
                <span className="insight-icon">{tip.icon}</span>
                <span className="insight-text">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

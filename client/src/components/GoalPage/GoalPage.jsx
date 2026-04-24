import { useState, useEffect } from 'react';
import CustomNavbar from '../Navbar/Navbar';
import './GoalPage.css';

const API = `${import.meta.env.VITE_API_URL}/goals`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const GOAL_TYPES = [
  { id: 'Weight Loss',   icon: '🔥', desc: 'Burn fat, lose weight',       color: '#ef4444' },
  { id: 'Muscle Gain',   icon: '💪', desc: 'Build muscle, gain strength',  color: '#f59e0b' },
  { id: 'Maintain',      icon: '⚖️', desc: 'Stay fit, maintain weight',    color: '#3b82f6' },
  { id: 'Custom',        icon: '🎯', desc: 'Set your own targets',         color: '#a855f7' },
];

const ACTIVITY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const STEPS = ['Goal Type', 'Calories', 'Macros', 'Activity', 'Water & Sleep', 'Weight Target', 'Summary'];

export default function GoalPage() {
  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [existing, setExisting]   = useState(null);
  const [progress, setProgress]   = useState(null);
  const [autoData, setAutoData]   = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [history, setHistory]     = useState([]);

  const [form, setForm] = useState({
    goalType: '',
    calories: 2000, protein: 120, carbs: 250, fat: 65,
    steps: 10000, workoutDays: 4, workoutDuration: 45,
    water: 8, sleep: 8,
    currentWeight: 0, targetWeight: 0, timeline: 30,
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, pRes, hRes] = await Promise.all([
          fetch(`${API}`, { headers: headers() }),
          fetch(`${API}/progress`, { headers: headers() }),
          fetch(`${API}/history`, { headers: headers() }),
        ]);
        const g = await gRes.json();
        const p = await pRes.json();
        const h = await hRes.json();
        if (g) { setExisting(g); setForm(prev => ({ ...prev, ...g })); }
        if (p) setProgress(p);
        if (Array.isArray(h)) setHistory(h);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const selectGoalType = (type) => {
    set('goalType', type);
    fetchAuto(type);
  };

  const fetchAuto = async (goalType) => {
    try {
      const res = await fetch(`${API}/auto-calculate?goalType=${goalType}`, { headers: headers() });
      const data = await res.json();
      setAutoData(data);
      setForm(p => ({
        ...p,
        goalType,
        calories: data.calories,
        protein:  data.protein,
        carbs:    data.carbs,
        fat:      data.fat,
        currentWeight: data.profile?.weight || p.currentWeight,
      }));
    } catch { /* silent */ }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setExisting(data);
        const pRes = await fetch(`${API}/progress`, { headers: headers() });
        const p = await pRes.json();
        setProgress(p);
        setStep(7); // done screen
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const restart = () => {
    setShowWizard(true);
    setStep(0);
    setAutoData(null);
    setForm({
      goalType: '', calories: 2000, protein: 120, carbs: 250, fat: 65,
      steps: 10000, workoutDays: 4, workoutDuration: 45, water: 8, sleep: 8,
      currentWeight: 0, targetWeight: 0, timeline: 30,
    });
  };

  if (loading) return (
    <div className="goal-page">
      <CustomNavbar />
      <div className="goal-loading"><div className="goal-spinner" /></div>
    </div>
  );

  // Active goal dashboard
  if (existing && !showWizard && progress) return (
    <div className="goal-page">
      <CustomNavbar />
      <div className="goal-dashboard">

        {/* Hero */}
        <div className="gd-hero">
          <div>
            <span className="goal-eyebrow">ACTIVE GOAL</span>
            <h1 className="goal-h1">{existing.goalType} <span className="goal-accent">Plan</span></h1>
            <p className="goal-sub">Started {existing.startDate} · Ends {existing.endDate}</p>
          </div>
          <button className="goal-restart-btn" onClick={restart}>+ New Goal</button>
        </div>

        {/* Tabs */}
        <div className="gd-tabs">
          {['overview','reports','history'].map(t => (
            <button key={t} className={`gd-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'overview' ? '📊 Overview' : t === 'reports' ? '📈 Reports' : '📋 History'}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Progress */}
            <div className="gd-progress-card">
              <div className="gd-progress-top">
                <span className="gd-day-label">Day {progress.currentDay} of {progress.totalDays}</span>
                <span className="gd-pct">{progress.pct}%</span>
              </div>
              <div className="gd-bar-bg"><div className="gd-bar-fill" style={{ width: `${progress.pct}%` }} /></div>
              <div className="gd-progress-stats">
                {[
                  { num: progress.daysRemaining, lbl: 'Days Left',    color: '#00ff00' },
                  { num: progress.streak,        lbl: 'Streak',       color: '#00ff00' },
                  { num: progress.bestStreak,    lbl: 'Best Streak',  color: '#00ff00' },
                  { num: progress.completedDays, lbl: 'Completed',    color: '#00ff00' },
                  { num: progress.missedDays,    lbl: 'Missed',       color: '#00ff00' },
                ].map(s => (
                  <div key={s.lbl} className="gd-stat">
                    <span className="gd-stat-num" style={{color: s.color}}>{s.num}</span>
                    <span className="gd-stat-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>
              {progress.missedDays > 0 && (
                <div className="gd-missed-warn">⚠️ {progress.missedDays} day{progress.missedDays > 1 ? 's' : ''} missed — streak paused. Keep going!</div>
              )}
            </div>

            {/* Targets */}
            <div className="gd-section-title">Goal <span className="goal-accent">Targets</span></div>
            <div className="gd-targets-grid">
              {[
                { label: 'Calories', val: `${existing.calories} kcal/day`, color: '#00ff00', icon: '🔥' },
                { label: 'Protein',  val: `${existing.protein}g/day`,       color: '#00ff00', icon: '💪' },
                { label: 'Carbs',    val: `${existing.carbs}g/day`,         color: '#00ff00', icon: '🍞' },
                { label: 'Fat',      val: `${existing.fat}g/day`,           color: '#00ff00', icon: '🧈' },
                { label: 'Steps',    val: `${existing.steps.toLocaleString()}/day`, color: '#00ff00', icon: '🚶' },
                { label: 'Workout',  val: `${existing.workoutDays} days/week`, color: '#00ff00', icon: '🏋️' },
                { label: 'Water',    val: `${existing.water} glasses/day`,  color: '#00ff00', icon: '💧' },
                { label: 'Sleep',    val: `${existing.sleep}h/day`,         color: '#00ff00', icon: '🌙' },
              ].map(t => (
                <div key={t.label} className="gd-target-card" style={{'--tc': t.color}}>
                  <span className="gd-target-icon">{t.icon}</span>
                  <span className="gd-target-val" style={{color: t.color}}>{t.val}</span>
                  <span className="gd-target-lbl">{t.label}</span>
                </div>
              ))}
            </div>

            {/* Weight Target */}
            {existing.targetWeight > 0 && (
              <div className="gd-weight-card">
                <span className="goal-eyebrow">WEIGHT TARGET</span>
                <div className="gd-weight-row">
                  <div className="gd-weight-item"><span className="gd-weight-num">{existing.currentWeight}kg</span><span className="gd-weight-lbl">Current</span></div>
                  <div className="gd-weight-arrow">→</div>
                  <div className="gd-weight-item"><span className="gd-weight-num" style={{color:'#00ff00'}}>{existing.targetWeight}kg</span><span className="gd-weight-lbl">Target</span></div>
                  <div className="gd-weight-item"><span className="gd-weight-num" style={{color:'#f59e0b'}}>{existing.timeline} days</span><span className="gd-weight-lbl">Timeline</span></div>
                  <div className="gd-weight-item"><span className="gd-weight-num" style={{color:'#3b82f6'}}>{Math.abs(existing.currentWeight - existing.targetWeight).toFixed(1)}kg</span><span className="gd-weight-lbl">To Go</span></div>
                </div>
                <div className="gd-bar-bg" style={{marginTop:'8px'}}>
                  <div className="gd-bar-fill" style={{ width: `${Math.min(((existing.currentWeight - existing.targetWeight) / (existing.currentWeight - existing.targetWeight || 1)) * 100, 100)}%`, background: '#3b82f6' }} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── REPORTS TAB ── */}
        {activeTab === 'reports' && (
          <>
            <div className="gd-section-title">Progress <span className="goal-accent">Reports</span></div>
            <div className="gd-reports-grid">
              {/* Daily */}
              <div className="gd-report-card">
                <div className="gd-report-header">
                  <span className="gd-report-icon">📅</span>
                  <span className="gd-report-title">Daily Summary</span>
                </div>
                <div className="gd-report-rows">
                  <div className="gd-report-row"><span>Today</span><span style={{color:'#00ff00'}}>Day {progress.currentDay}</span></div>
                  <div className="gd-report-row"><span>Streak</span><span style={{color:'#00ff00'}}>{progress.streak} days</span></div>
                  <div className="gd-report-row"><span>Status</span><span style={{color: progress.missedDays > 0 ? '#ef4444' : '#00ff00'}}>{progress.missedDays > 0 ? 'Missed days' : 'On track ✓'}</span></div>
                  <div className="gd-report-row"><span>Completion</span><span style={{color:'#00ff00'}}>{progress.pct}%</span></div>
                </div>
              </div>

              {/* Weekly */}
              <div className="gd-report-card">
                <div className="gd-report-header">
                  <span className="gd-report-icon">📊</span>
                  <span className="gd-report-title">Weekly Summary</span>
                </div>
                <div className="gd-report-rows">
                  <div className="gd-report-row"><span>Days Completed</span><span style={{color:'#00ff00'}}>{Math.min(progress.completedDays, 7)}</span></div>
                  <div className="gd-report-row"><span>Days Missed</span><span style={{color:'#00ff00'}}>{Math.min(progress.missedDays, 7)}</span></div>
                  <div className="gd-report-row"><span>Best Streak</span><span style={{color:'#00ff00'}}>{progress.bestStreak} days</span></div>
                  <div className="gd-report-row"><span>Week Rate</span><span style={{color:'#00ff00'}}>{progress.completedDays > 0 ? Math.round((progress.completedDays / (progress.completedDays + progress.missedDays)) * 100) : 0}%</span></div>
                </div>
              </div>

              {/* Monthly */}
              <div className="gd-report-card">
                <div className="gd-report-header">
                  <span className="gd-report-icon">📈</span>
                  <span className="gd-report-title">Monthly Summary</span>
                </div>
                <div className="gd-report-rows">
                  <div className="gd-report-row"><span>Total Days</span><span style={{color:'#00ff00'}}>{progress.totalDays}</span></div>
                  <div className="gd-report-row"><span>Completed</span><span style={{color:'#00ff00'}}>{progress.completedDays}</span></div>
                  <div className="gd-report-row"><span>Missed</span><span style={{color:'#00ff00'}}>{progress.missedDays}</span></div>
                  <div className="gd-report-row"><span>Remaining</span><span style={{color:'#00ff00'}}>{progress.daysRemaining}</span></div>
                </div>
              </div>

              {/* Goal Progress */}
              <div className="gd-report-card">
                <div className="gd-report-header">
                  <span className="gd-report-icon">🎯</span>
                  <span className="gd-report-title">Goal Progress</span>
                </div>
                <div className="gd-report-rows">
                  <div className="gd-report-row"><span>Goal Type</span><span style={{color:'#00ff00'}}>{existing.goalType}</span></div>
                  <div className="gd-report-row"><span>Start Date</span><span style={{color:'#00ff00'}}>{existing.startDate}</span></div>
                  <div className="gd-report-row"><span>End Date</span><span style={{color:'#00ff00'}}>{existing.endDate}</span></div>
                  <div className="gd-report-row"><span>Overall</span><span style={{color:'#00ff00'}}>{progress.pct}% done</span></div>
                </div>
              </div>
            </div>

            {/* Progress Bar per metric */}
            <div className="gd-section-title" style={{marginTop:'8px'}}>Metric <span className="goal-accent">Breakdown</span></div>
            <div className="gd-metric-bars">
              {[
                { label: 'Plan Completion',  pct: progress.pct,  color: '#00ff00' },
                { label: 'Days Completed',   pct: progress.totalDays > 0 ? Math.round((progress.completedDays / progress.totalDays) * 100) : 0, color: '#00ff00' },
                { label: 'Streak vs Best',   pct: progress.bestStreak > 0 ? Math.round((progress.streak / progress.bestStreak) * 100) : 0, color: '#00ff00' },
                { label: 'Days Remaining',   pct: progress.totalDays > 0 ? Math.round((progress.daysRemaining / progress.totalDays) * 100) : 0, color: '#00ff00' },
              ].map(m => (
                <div key={m.label} className="gd-metric-row">
                  <div className="gd-metric-info">
                    <span className="gd-metric-label">{m.label}</span>
                    <span className="gd-metric-pct" style={{color: m.color}}>{m.pct}%</span>
                  </div>
                  <div className="gd-bar-bg">
                    <div className="gd-bar-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <>
            <div className="gd-section-title">All <span className="goal-accent">Plans</span></div>
            {history.length === 0 ? (
              <div className="gd-empty">No goal history yet.</div>
            ) : (
              <div className="gd-history-list">
                {history.map((g) => {
                  const total = g.completedDays?.length + g.missedDays?.length || 0;
                  const rate  = total > 0 ? Math.round((g.completedDays?.length / total) * 100) : 0;
                  return (
                    <div key={g._id} className={`gd-history-card ${g.isActive ? 'active' : ''}`}>
                      <div className="gd-hc-top">
                        <div className="gd-hc-left">
                          <span className="gd-hc-type">{g.goalType}</span>
                          <span className="gd-hc-dates">{g.startDate} → {g.endDate} · {g.timeline} days</span>
                        </div>
                        <span className={`gd-hc-badge ${g.isActive ? 'active' : ''}`}>{g.isActive ? 'ACTIVE' : 'ENDED'}</span>
                      </div>
                      <div className="gd-hc-stats">
                        <div className="gd-hc-stat"><span style={{color:'#00ff00'}}>{g.completedDays?.length || 0}</span><span>Completed</span></div>
                        <div className="gd-hc-stat"><span style={{color:'#00ff00'}}>{g.missedDays?.length || 0}</span><span>Missed</span></div>
                        <div className="gd-hc-stat"><span style={{color:'#00ff00'}}>{g.bestStreak}</span><span>Best Streak</span></div>
                        <div className="gd-hc-stat"><span style={{color:'#00ff00'}}>{rate}%</span><span>Success Rate</span></div>
                      </div>
                      <div className="gd-bar-bg">
                        <div className="gd-bar-fill" style={{ width: `${rate}%`, background: g.isActive ? '#00ff00' : '#3b82f6' }} />
                      </div>
                      <div className="gd-hc-targets">
                        <span>🔥 {g.calories} kcal</span>
                        <span>💪 {g.protein}g protein</span>
                        <span>🚶 {g.steps?.toLocaleString()} steps</span>
                        <span>💧 {g.water} glasses</span>
                        <span>🌙 {g.sleep}h sleep</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );

  // Wizard — done screen
  if (step === 7) return (
    <div className="goal-page">
      <CustomNavbar />
      <div className="goal-done">
        <div className="goal-done-icon">🎯</div>
        <h2 className="goal-done-title">Goal Set Successfully!</h2>
        <p className="goal-done-sub">Your {form.goalType} plan is now active. Stay consistent!</p>
        <button className="goal-done-btn" onClick={() => { setShowWizard(false); setStep(0); }}>View My Goal</button>
      </div>
    </div>
  );

  // Wizard steps
  return (
    <div className="goal-page">
      <CustomNavbar />
      <div className="goal-wizard">

        {/* Progress */}
        <div className="wizard-progress">
          {STEPS.map((s, i) => (
            <div key={i} className={`wizard-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="wizard-dot" />
              <span className="wizard-dot-label">{s}</span>
            </div>
          ))}
        </div>

        <div className="wizard-card">

          {/* Step 0 — Goal Type */}
          {step === 0 && (
            <div className="wizard-step">
              <span className="goal-eyebrow">STEP 1 OF 7</span>
              <h2 className="wizard-title">What's your <span className="goal-accent">Goal?</span></h2>
              <p className="wizard-sub">Choose your primary fitness objective</p>
              <div className="goal-type-grid">
                {GOAL_TYPES.map(g => (
                  <div key={g.id} className={`goal-type-card ${form.goalType === g.id ? 'selected' : ''}`}
                    style={{'--gtc': g.color}} onClick={() => selectGoalType(g.id)}>
                    <span className="gt-icon">{g.icon}</span>
                    <span className="gt-name">{g.id}</span>
                    <span className="gt-desc">{g.desc}</span>
                    {form.goalType === g.id && <span className="gt-check">✓</span>}
                  </div>
                ))}
              </div>
              <button className="goal-next-btn" disabled={!form.goalType} onClick={() => setStep(1)}>Next →</button>
            </div>
          )}

          {/* Step 1 — Calories */}
          {step === 1 && (
            <div className="wizard-step">
              <span className="goal-eyebrow">STEP 2 OF 7</span>
              <h2 className="wizard-title">Daily <span className="goal-accent">Calorie</span> Goal</h2>
              <p className="wizard-sub">Auto-calculated from your profile. Edit if needed.</p>
              {autoData && <div className="auto-badge">🧮 TDEE: {autoData.tdee} kcal · Adjusted for {form.goalType}</div>}
              <div className="wizard-field">
                <label>Daily Calories (kcal)</label>
                <input type="number" value={form.calories} onChange={e => set('calories', +e.target.value)} />
              </div>
              <div className="wizard-nav">
                <button className="goal-back-btn" onClick={() => setStep(0)}>← Back</button>
                <button className="goal-next-btn" onClick={() => setStep(2)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 2 — Macros */}
          {step === 2 && (
            <div className="wizard-step">
              <span className="goal-eyebrow">STEP 3 OF 7</span>
              <h2 className="wizard-title">Macro <span className="goal-accent">Goals</span></h2>
              <p className="wizard-sub">Auto-split from your calorie goal. Edit if needed.</p>
              <div className="wizard-grid">
                {[
                  { key: 'protein', label: 'Protein (g)', color: '#3b82f6' },
                  { key: 'carbs',   label: 'Carbs (g)',   color: '#f59e0b' },
                  { key: 'fat',     label: 'Fat (g)',     color: '#ef4444' },
                ].map(m => (
                  <div key={m.key} className="wizard-field">
                    <label style={{color: m.color}}>{m.label}</label>
                    <input type="number" value={form[m.key]} onChange={e => set(m.key, +e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="wizard-nav">
                <button className="goal-back-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="goal-next-btn" onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 3 — Activity */}
          {step === 3 && (
            <div className="wizard-step">
              <span className="goal-eyebrow">STEP 4 OF 7</span>
              <h2 className="wizard-title">Activity <span className="goal-accent">Goals</span></h2>
              <div className="wizard-grid">
                <div className="wizard-field">
                  <label>Daily Steps</label>
                  <input type="number" value={form.steps} onChange={e => set('steps', +e.target.value)} />
                </div>
                <div className="wizard-field">
                  <label>Workout Days / Week</label>
                  <input type="number" min="1" max="7" value={form.workoutDays} onChange={e => set('workoutDays', +e.target.value)} />
                </div>
                <div className="wizard-field">
                  <label>Workout Duration (mins)</label>
                  <input type="number" value={form.workoutDuration} onChange={e => set('workoutDuration', +e.target.value)} />
                </div>
              </div>
              <div className="wizard-nav">
                <button className="goal-back-btn" onClick={() => setStep(2)}>← Back</button>
                <button className="goal-next-btn" onClick={() => setStep(4)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 4 — Water & Sleep */}
          {step === 4 && (
            <div className="wizard-step">
              <span className="goal-eyebrow">STEP 5 OF 7</span>
              <h2 className="wizard-title">Water & <span className="goal-accent">Sleep</span></h2>
              <div className="wizard-grid">
                <div className="wizard-field">
                  <label>💧 Water Goal (glasses/day)</label>
                  <input type="number" value={form.water} onChange={e => set('water', +e.target.value)} />
                </div>
                <div className="wizard-field">
                  <label>🌙 Sleep Goal (hours/day)</label>
                  <input type="number" value={form.sleep} onChange={e => set('sleep', +e.target.value)} />
                </div>
              </div>
              <div className="wizard-nav">
                <button className="goal-back-btn" onClick={() => setStep(3)}>← Back</button>
                <button className="goal-next-btn" onClick={() => setStep(5)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 5 — Weight Target */}
          {step === 5 && (
            <div className="wizard-step">
              <span className="goal-eyebrow">STEP 6 OF 7</span>
              <h2 className="wizard-title">Weight <span className="goal-accent">Target</span></h2>
              <div className="wizard-grid">
                <div className="wizard-field">
                  <label>Current Weight (kg)</label>
                  <input type="number" step="0.1" value={form.currentWeight} onChange={e => set('currentWeight', +e.target.value)} />
                </div>
                <div className="wizard-field">
                  <label>Target Weight (kg)</label>
                  <input type="number" step="0.1" value={form.targetWeight} onChange={e => set('targetWeight', +e.target.value)} />
                </div>
                <div className="wizard-field">
                  <label>Timeline (days)</label>
                  <input type="number" value={form.timeline} onChange={e => set('timeline', +e.target.value)} />
                </div>
              </div>
              <div className="wizard-nav">
                <button className="goal-back-btn" onClick={() => setStep(4)}>← Back</button>
                <button className="goal-next-btn" onClick={() => setStep(6)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 6 — Summary */}
          {step === 6 && (
            <div className="wizard-step">
              <span className="goal-eyebrow">STEP 7 OF 7</span>
              <h2 className="wizard-title">Your <span className="goal-accent">Plan</span></h2>
              <p className="wizard-sub">Review everything before saving</p>
              <div className="summary-list">
                {[
                  { label: '🎯 Goal',        val: form.goalType },
                  { label: '🔥 Calories',    val: `${form.calories} kcal/day` },
                  { label: '💪 Protein',     val: `${form.protein}g/day` },
                  { label: '🍞 Carbs',       val: `${form.carbs}g/day` },
                  { label: '🧈 Fat',         val: `${form.fat}g/day` },
                  { label: '🚶 Steps',       val: `${form.steps.toLocaleString()}/day` },
                  { label: '🏋️ Workout',    val: `${form.workoutDays} days/week · ${form.workoutDuration} mins` },
                  { label: '💧 Water',       val: `${form.water} glasses/day` },
                  { label: '🌙 Sleep',       val: `${form.sleep}h/day` },
                  { label: '⚖️ Weight',      val: `${form.currentWeight}kg → ${form.targetWeight}kg` },
                  { label: '📅 Timeline',    val: `${form.timeline} days` },
                ].map(s => (
                  <div key={s.label} className="summary-row">
                    <span className="summary-label">{s.label}</span>
                    <span className="summary-val">{s.val}</span>
                  </div>
                ))}
              </div>
              <div className="wizard-nav">
                <button className="goal-back-btn" onClick={() => setStep(5)}>← Back</button>
                <button className="goal-save-btn" onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : '🎯 Save My Goal'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

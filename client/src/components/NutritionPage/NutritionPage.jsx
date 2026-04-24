import { useState, useEffect, useRef } from 'react';
import CustomNavbar from '../Navbar/Navbar';
import './NutritionPage.css';

const API = `${import.meta.env.VITE_API_URL}/nutrition`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const MEAL_CONFIG = {
  breakfast: { label: 'Breakfast', color: '#f59e0b'},
  lunch:     { label: 'Lunch',     color: '#f97316'},
  dinner:    { label: 'Dinner',    color: '#ef4444'},
  snacks:    { label: 'Snacks',    color: '#a855f7'},
};

const todayStr = () => new Date().toISOString().split('T')[0];

const calcMacros = (items) =>
  items.reduce((acc, i) => ({
    calories: acc.calories + i.calories * i.quantity,
    protein:  acc.protein  + i.protein  * i.quantity,
    carbs:    acc.carbs    + i.carbs    * i.quantity,
    fat:      acc.fat      + i.fat      * i.quantity,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

export default function NutritionPage() {
  const [date, setDate]           = useState(todayStr());
  const [log, setLog]             = useState(null);
  const [weekly, setWeekly]       = useState([]);
  const [mealPlan, setMealPlan]   = useState(null);
  const [profileGoals, setProfileGoals] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editGoal, setEditGoal]   = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [search, setSearch]       = useState({});
  const [results, setResults]     = useState({});
  const [qty, setQty]             = useState({});
  const [addAnim, setAddAnim]     = useState(null);
  const [showOutside, setShowOutside] = useState(false);
  const [outsideFood, setOutsideFood] = useState({ name: '', description: '', calories: '' });
  const [addModal, setAddModal] = useState(null); // meal name or null
  const [modalTab, setModalTab] = useState('search'); // 'search' | 'custom'
  const [modalSearch, setModalSearch] = useState('');
  const [modalResults, setModalResults] = useState([]);
  const [modalQty, setModalQty] = useState(1);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const searchTimers = useRef({});

  const fetchLog = async (d) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/daily?date=${d}`, { headers: headers() });
      const data = await res.json();
      if (res.ok) setLog(data);
      else setLog({ breakfast: [], lunch: [], dinner: [], snacks: [], outsideFoods: [], calorieGoal: 2000 });
    } catch {
      setLog({ breakfast: [], lunch: [], dinner: [], snacks: [], outsideFoods: [], calorieGoal: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekly = async () => {
    try {
      const res = await fetch(`${API}/weekly`, { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      setWeekly(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  const fetchMealPlan = async () => {
    try {
      const res = await fetch(`${API}/meal-plan`, { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      setMealPlan(data);
    } catch { /* silent */ }
  };

  const fetchProfileGoals = async () => {
    try {
      const res = await fetch(`${API}/profile-goals`, { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      setProfileGoals(data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchLog(date); fetchWeekly(); fetchMealPlan(); fetchProfileGoals(); }, [date]);

  const totals = log
    ? calcMacros([...log.breakfast, ...log.lunch, ...log.dinner, ...log.snacks])
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const goal = log?.calorieGoal || profileGoals?.calories || 2000;
  const macroGoals = {
    protein: profileGoals?.protein || 120,
    carbs:   profileGoals?.carbs   || 200,
    fat:     profileGoals?.fat     || 65,
  };

  const generateTips = () => {
    if (!log) return [];
    const tips = [];
    const remaining = goal - totals.calories;
    const pRotein = macroGoals.protein - totals.protein;
    const cArbs   = macroGoals.carbs   - totals.carbs;
    const fAt     = macroGoals.fat     - totals.fat;

    if (totals.calories === 0) {
      tips.push({ icon: '🍽️', text: "You haven't logged any food yet today. Start tracking!", color: '#888' });
      return tips;
    }
    if (remaining > 600)  tips.push({ icon: '⚡', text: `You still have ${Math.round(remaining)} kcal remaining. Don't forget to eat!`, color: '#f59e0b' });
    if (remaining < 0)    tips.push({ icon: '⚠️', text: `You're ${Math.round(Math.abs(remaining))} kcal over your goal today.`, color: '#ef4444' });
    if (remaining >= 0 && remaining <= 200) tips.push({ icon: '🎯', text: "Great job! You're right on track with your calorie goal.", color: '#00ff00' });
    if (pRotein > 30)     tips.push({ icon: '💪', text: `You need ${Math.round(pRotein)}g more protein. Try chicken, eggs or paneer.`, color: '#3b82f6' });
    if (pRotein < -20)    tips.push({ icon: '✅', text: `Protein goal crushed! You're ${Math.round(Math.abs(pRotein))}g over target.`, color: '#00ff00' });
    if (cArbs < -50)      tips.push({ icon: '🍞', text: `High carb day — ${Math.round(Math.abs(cArbs))}g over carb goal.`, color: '#f97316' });
    if (fAt < -15)        tips.push({ icon: '🧈', text: `Fat intake is ${Math.round(Math.abs(fAt))}g over goal. Watch oily foods.`, color: '#ef4444' });
    if (log.outsideFoods?.length > 0) tips.push({ icon: '🍔', text: `You logged ${log.outsideFoods.length} outside meal(s). Try to stay on plan tomorrow.`, color: '#a855f7' });
    if (tips.length === 0) tips.push({ icon: '👍', text: 'Your nutrition looks balanced today. Keep it up!', color: '#00ff00' });
    return tips;
  };

  const tips = generateTips();
  const pct = Math.min((totals.calories / goal) * 100, 100);
  const over = totals.calories > goal;
  const ringColor = over ? '#ef4444' : '#00ff00';
  const circumference = 2 * Math.PI * 54;
  const dash = circumference - (pct / 100) * circumference;

  const openModal = (meal) => {
    setAddModal(meal);
    setModalTab('search');
    setModalSearch('');
    setModalResults([]);
    setModalQty(1);
    setSelectedFood(null);
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const handleModalSearch = (val) => {
    setModalSearch(val);
    setSelectedFood(null);
    clearTimeout(searchTimers.current['modal']);
    if (!val.trim()) { setModalResults([]); return; }
    searchTimers.current['modal'] = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/search?q=${val}`, { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        setModalResults(data);
      } catch { /* silent */ }
    }, 300);
  };

  const handleModalAdd = async () => {
    if (!addModal) return;
    if (modalTab === 'search' && selectedFood) {
      await addFood(addModal, selectedFood, modalQty);
      setAddModal(null);
    } else if (modalTab === 'custom' && customFood.name && customFood.calories) {
      await addFood(addModal, {
        name: customFood.name,
        calories: parseFloat(customFood.calories) || 0,
        protein: parseFloat(customFood.protein) || 0,
        carbs: parseFloat(customFood.carbs) || 0,
        fat: parseFloat(customFood.fat) || 0,
      }, 1);
      setAddModal(null);
    }
  };

  const addFood = async (meal, item, quantity = 1) => {
    try {
      const res = await fetch(`${API}/add`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ date, meal, item: { ...item, quantity } }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLog(data);
      const added = data[meal][data[meal].length - 1];
      setAddAnim(added._id);
      setTimeout(() => setAddAnim(null), 600);
      fetchWeekly();
    } catch { /* silent */ }
  };

  const removeFood = async (meal, itemId) => {
    try {
      const res = await fetch(`${API}/remove`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ date, meal, itemId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLog(data);
      fetchWeekly();
    } catch { /* silent */ }
  };

  const updateQty = async (meal, item, newQty) => {
    if (newQty < 1) return;
    await removeFood(meal, item._id);
    await addFood(meal, { name: item.name, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat }, newQty);
  };

  const saveGoal = async () => {
    const val = parseInt(goalInput);
    if (!val || val < 1) { setEditGoal(false); return; }
    try {
      const res = await fetch(`${API}/calorie-goal`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ date, calorieGoal: val }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLog(data);
      fetchWeekly();
    } catch { /* silent */ }
    setEditGoal(false);
  };

  const logOutside = async () => {
    if (!outsideFood.name) return;
    try {
      const res = await fetch(`${API}/outside-food`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ date, ...outsideFood, calories: parseFloat(outsideFood.calories) || 0 }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLog(data);
      setOutsideFood({ name: '', description: '', calories: '' });
      setShowOutside(false);
    } catch { /* silent */ }
  };

  const removeOutside = async (itemId) => {
    try {
      const res = await fetch(`${API}/outside-food/remove`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ date, itemId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLog(data);
    } catch { /* silent */ }
  };

  const maxCal = Math.max(...weekly.map(w => w.calories), goal, 1);

  return (
    <div className="nutr-page">
      <CustomNavbar />
      {loading && <div className="nutr-loading"><div className="nutr-spinner" /></div>}
      {!loading && !log && (
        <div className="nutr-loading"><span style={{color:'#555',fontSize:'0.9rem'}}>Could not load data. Is the server running?</span></div>
      )}
      {!loading && log && <>
      <div className="nutr-header">
        <div className="nutr-header-top">
          <div>
            <span className="tag">NUTRITION</span>
            <h1 className="nutr-title">Daily <span className="neon">Tracker</span></h1>
          </div>
          <div className="nutr-date-wrap">
            <button className="date-nav-btn" onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d.toISOString().split('T')[0]); }}>‹</button>
            <span className="nutr-date-label">{new Date(date + 'T00:00:00').toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <button className="date-nav-btn" onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); const t = todayStr(); const next = d.toISOString().split('T')[0]; if (next <= t) setDate(next); }} disabled={date === todayStr()}>›</button>
          </div>
        </div>

        <div className="nutr-summary">
          <div className="nutr-ring-wrap">
            <svg className="nutr-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a1a" strokeWidth="10" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={ringColor} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dash} transform="rotate(-90 60 60)"
                className="ring-progress" style={{ filter: `drop-shadow(0 0 8px ${ringColor})` }} />
            </svg>
            <div className="nutr-ring-center">
              {over && <span className="over-warn">⚠️</span>}
              <span className="ring-cal" style={{ color: ringColor }}>{Math.round(totals.calories)}</span>
              <span className="ring-lbl">kcal</span>
              {editGoal ? (
                <div className="goal-edit">
                  <input autoFocus type="number" className="goal-input" value={goalInput}
                    onChange={e => setGoalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveGoal()} onBlur={saveGoal} />
                </div>
              ) : (
                <span className="ring-goal" onClick={() => { setEditGoal(true); setGoalInput(goal); }}>/ {goal} goal</span>
              )}
            </div>
          </div>

          <div className="nutr-macros">
            {[
              { label: 'Protein', val: totals.protein, max: macroGoals.protein, color: '#3b82f6', unit: 'g' },
              { label: 'Carbs',   val: totals.carbs,   max: macroGoals.carbs,   color: '#f59e0b', unit: 'g' },
              { label: 'Fat',     val: totals.fat,     max: macroGoals.fat,     color: '#ef4444', unit: 'g' },
            ].map(m => (
              <div key={m.label} className="macro-row">
                <div className="macro-info">
                  <span className="macro-label">{m.label}</span>
                </div>
                <div className="macro-bar-bg">
                  <div className="macro-bar-fill" style={{ width: `${Math.min((m.val / m.max) * 100, 100)}%`, background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="nutr-pills">
            <div className="nutr-pill"><span className="pill-num">{Math.round(totals.calories)}</span><span className="pill-lbl">Consumed</span></div>
            <div className="nutr-pill"><span className="pill-num" style={{ color: goal - totals.calories < 0 ? '#ef4444' : '#00ff00' }}>{Math.round(Math.max(0, goal - totals.calories))}</span><span className="pill-lbl">Remaining</span></div>
            <div className="nutr-pill"><span className="pill-num" style={{ color: '#3b82f6' }}>{Math.round(totals.protein)}g</span><span className="pill-lbl">Protein</span></div>
            <div className="nutr-pill"><span className="pill-num" style={{ color: '#f59e0b' }}>{Math.round(totals.carbs)}g</span><span className="pill-lbl">Carbs</span></div>
            <div className="nutr-pill"><span className="pill-num" style={{ color: '#ef4444' }}>{Math.round(totals.fat)}g</span><span className="pill-lbl">Fat</span></div>
          </div>
        </div>
      </div>

      <div className="nutr-body">

        {/* ── Smart Tips ── */}
        {tips.length > 0 && (
          <div className="tips-section">
            <span className="tag">SMART TIPS</span>
            <div className="tips-list">
              {tips.map((tip, i) => (
                <div key={i} className="tip-item" style={{ borderLeftColor: tip.color }}>
                  <span className="tip-icon">{tip.icon}</span>
                  <span className="tip-text">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mealPlan?.name && (
          <div className="meal-plan-section">
            <div className="section-header">
              <span className="tag">MY MEAL PLAN</span>
              <h2>{mealPlan.name}</h2>
              {mealPlan.description && <p className="plan-desc">{mealPlan.description}</p>}
            </div>
            <div className="plan-meals">
              {mealPlan.meals?.map((m, i) => (
                <div key={i} className="plan-meal-card">
                  <div className="plan-meal-header">
                    <span className="plan-meal-icon">{MEAL_CONFIG[m.mealType?.toLowerCase()]?.icon || '🍽️'}</span>
                    <span className="plan-meal-type">{m.mealType}</span>
                    <span className="plan-meal-cal">{m.calories} kcal</span>
                  </div>
                  <ul className="plan-foods">
                    {m.foods?.map((f, j) => <li key={j}>{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="meals-grid">
          {Object.entries(MEAL_CONFIG).map(([meal, cfg]) => {
            const items = log[meal] || [];
            const mTotals = calcMacros(items);
            return (
              <div key={meal} className="meal-card" style={{ '--meal-color': cfg.color }}>
                <div className="meal-header">
                  <div className="meal-title-row">
                    <span className="meal-icon">{cfg.icon}</span>
                    <span className="meal-label">{cfg.label}</span>
                    <span className="meal-cal-badge">{Math.round(mTotals.calories)} kcal</span>
                  </div>
                </div>

                <div className="meal-items">
                  {items.length === 0 ? (
                    <div className="meal-empty"><span>No foods logged yet</span></div>
                  ) : items.map(item => (
                    <div key={item._id} className={`food-item ${addAnim === item._id ? 'slide-in' : ''}`}>
                      <div className="food-item-top">
                        <span className="food-name">{item.name}</span>
                        <div className="food-item-right">
                          <span className="food-kcal">{Math.round(item.calories * item.quantity)} kcal</span>
                          <div className="qty-stepper">
                            <button onClick={() => updateQty(meal, item, item.quantity - 1)}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQty(meal, item, item.quantity + 1)}>+</button>
                          </div>
                          <button className="food-remove" onClick={() => removeFood(meal, item._id)}>✕</button>
                        </div>
                      </div>
                     
                    </div>
                  ))}
                </div>

                <button className="meal-add-btn" onClick={() => openModal(meal)}
                  >
                  + Add Food
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Add Food Modal ── */}
        {addModal && (
          <div className="modal-overlay" onClick={() => setAddModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <span>{MEAL_CONFIG[addModal].icon}</span>
                  <span>Add Food to {MEAL_CONFIG[addModal].label}</span>
                </div>
                <button className="modal-close" onClick={() => setAddModal(null)}>✕</button>
              </div>

              <div className="modal-tabs">
                <button className={modalTab === 'search' ? 'active' : ''} onClick={() => setModalTab('search')}>🔍 Search</button>
                <button className={modalTab === 'custom' ? 'active' : ''} onClick={() => setModalTab('custom')}>✏️ Custom</button>
              </div>

              {modalTab === 'search' && (
                <div className="modal-search-section">
                  <div className="modal-search-bar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      autoFocus
                      placeholder="Search food e.g. chicken, rice, egg..."
                      value={modalSearch}
                      onChange={e => handleModalSearch(e.target.value)}
                    />
                    {modalSearch && <button className="modal-search-clear" onClick={() => { setModalSearch(''); setModalResults([]); setSelectedFood(null); }}>✕</button>}
                  </div>

                  <div className="modal-results">
                    {modalResults.length === 0 && modalSearch && (
                      <div className="modal-no-results">No results for "{modalSearch}"</div>
                    )}
                    {modalResults.length === 0 && !modalSearch && (
                      <div className="modal-hint">Start typing to search from 30+ foods</div>
                    )}
                    {modalResults.map((food, idx) => (
                      <div
                        key={idx}
                        className={`modal-food-row ${selectedFood?.name === food.name ? 'selected' : ''}`}
                        onClick={() => { setSelectedFood(food); setModalQty(1); }}
                      >
                        <div className="modal-food-info">
                          <span className="modal-food-name">{food.name}</span>
                          <div className="modal-food-macros">
                            <span className="mpill p">P {food.protein}g</span>
                            <span className="mpill c">C {food.carbs}g</span>
                            <span className="mpill f">F {food.fat}g</span>
                          </div>
                        </div>
                        <span className="modal-food-cal">{food.calories} kcal</span>
                        {selectedFood?.name === food.name && <span className="modal-check">✓</span>}
                      </div>
                    ))}
                  </div>

                  {selectedFood && (
                    <div className="modal-selected-bar">
                      <div className="modal-selected-info">
                        <span className="modal-selected-name">{selectedFood.name}</span>
                        <span className="modal-selected-cal">{Math.round(selectedFood.calories * modalQty)} kcal</span>
                      </div>
                      <div className="modal-qty-row">
                        <span>Qty:</span>
                        <div className="qty-stepper">
                          <button onClick={() => setModalQty(q => Math.max(1, q - 1))}>−</button>
                          <span>{modalQty}</span>
                          <button onClick={() => setModalQty(q => q + 1)}>+</button>
                        </div>
                        <button className="modal-add-btn" onClick={handleModalAdd}>Add to {MEAL_CONFIG[addModal].label}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'custom' && (
                <div className="modal-custom-section">
                  <div className="modal-custom-grid">
                    <div className="modal-field full">
                      <label>Food Name *</label>
                      <input placeholder="e.g. Homemade Dal" value={customFood.name}
                        onChange={e => setCustomFood(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="modal-field">
                      <label>Calories *</label>
                      <input type="number" placeholder="kcal" value={customFood.calories}
                        onChange={e => setCustomFood(p => ({ ...p, calories: e.target.value }))} />
                    </div>
                    <div className="modal-field">
                      <label>Protein (g)</label>
                      <input type="number" placeholder="0" value={customFood.protein}
                        onChange={e => setCustomFood(p => ({ ...p, protein: e.target.value }))} />
                    </div>
                    <div className="modal-field">
                      <label>Carbs (g)</label>
                      <input type="number" placeholder="0" value={customFood.carbs}
                        onChange={e => setCustomFood(p => ({ ...p, carbs: e.target.value }))} />
                    </div>
                    <div className="modal-field">
                      <label>Fat (g)</label>
                      <input type="number" placeholder="0" value={customFood.fat}
                        onChange={e => setCustomFood(p => ({ ...p, fat: e.target.value }))} />
                    </div>
                  </div>
                  <button className="modal-add-btn full" onClick={handleModalAdd}
                    disabled={!customFood.name || !customFood.calories}>
                    Add to {MEAL_CONFIG[addModal].label}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="outside-section">
          <div className="outside-header-row">
            <div>
              <span className="tag">OUTSIDE DIET</span>
              <h2 className="outside-title">Food Eaten Outside Plan</h2>
            </div>
            <button className="outside-add-btn" onClick={() => setShowOutside(!showOutside)}>+ Log Outside Food</button>
          </div>
          {showOutside && (
            <div className="outside-form">
              <input placeholder="Food name" value={outsideFood.name} onChange={e => setOutsideFood({ ...outsideFood, name: e.target.value })} />
              <input placeholder="Description (optional)" value={outsideFood.description} onChange={e => setOutsideFood({ ...outsideFood, description: e.target.value })} />
              <input type="number" placeholder="Calories (optional)" value={outsideFood.calories} onChange={e => setOutsideFood({ ...outsideFood, calories: e.target.value })} />
              <button className="outside-submit" onClick={logOutside}>Log Food</button>
            </div>
          )}
          <div className="outside-list">
            {log?.outsideFoods?.length === 0 ? (
              <div className="outside-empty">No outside foods logged today</div>
            ) : log?.outsideFoods?.map(item => (
              <div key={item._id} className="outside-item">
                <div className="outside-item-left">
                  <span className="outside-name">{item.name}</span>
                  {item.description && <span className="outside-desc-text">{item.description}</span>}
                  {item.calories > 0 && <span className="outside-cal">{item.calories} kcal</span>}
                </div>
                <button className="outside-remove" onClick={() => removeOutside(item._id)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="weekly-section">
          <div className="weekly-header-row">
            <div>
              <span className="tag">WEEKLY OVERVIEW</span>
              <h2 className="weekly-title">Last 7 Days</h2>
            </div>
          </div>
          <div className="weekly-list">
            {weekly.map((w, i) => {
              const isToday = w.date === todayStr();
              const pct = Math.min((w.calories / goal) * 100, 100);
              const isOver = w.calories > goal;
              const barColor = isOver ? '#ef4444' : '#00ff00';
              const dayLabel = new Date(w.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' });
              const dateLabel = new Date(w.date + 'T00:00:00').toLocaleDateString('en', { day: 'numeric', month: 'short' });
              return (
                <div key={i} className={`weekly-row ${isToday ? 'today' : ''}`}>
                  <div className="weekly-row-left">
                    <span className="weekly-day">{isToday ? 'Today' : dayLabel}</span>
                    <span className="weekly-date">{dateLabel}</span>
                  </div>
                  <div className="weekly-row-bar">
                    <div className="weekly-bar-track">
                      <div className="weekly-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </div>
                  <div className="weekly-row-right">
                    <span className="weekly-kcal" style={{ color: isOver ? '#ef4444' : '#fff' }}>
                      {Math.round(w.calories)} <span className="weekly-kcal-lbl">kcal</span>
                    </span>
                    {w.calories > 0 && (
                      <div className="weekly-macros">
                        <span style={{color:'#3b82f6'}}>P{Math.round(w.protein)}g</span>
                        <span style={{color:'#f59e0b'}}>C{Math.round(w.carbs)}g</span>
                        <span style={{color:'#ef4444'}}>F{Math.round(w.fat)}g</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>}
    </div>
  );
}

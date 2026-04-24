import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavbar from '../Navbar/Navbar';
import './ProfilePage.css';

const API = `${import.meta.env.VITE_API_URL}/profile`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const BMI_LABEL = (bmi) => {
  if (!bmi) return { label: 'N/A', color: '#555' };
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25)   return { label: 'Normal',       color: '#00ff00' };
  if (bmi < 30)   return { label: 'Overweight',   color: '#f59e0b' };
  return              { label: 'Obese',            color: '#ef4444' };
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [pwdMode, setPwdMode]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');

  const [form, setForm] = useState({
    name: '', age: '', weight: '', height: '',
    gender: '', fitnessLevel: '', goals: '', concerns: '',
  });

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API, { headers: headers() });
        const d = await res.json();
        if (res.ok) {
          setData(d);
          setForm({
            name:         d.user.name || '',
            age:          d.user.profile?.age || '',
            weight:       d.user.profile?.weight || '',
            height:       d.user.profile?.height || '',
            gender:       d.user.profile?.gender || '',
            fitnessLevel: d.user.profile?.fitnessLevel || '',
            goals:        d.user.profile?.goals?.join(', ') || '',
            concerns:     d.user.profile?.concerns?.join(', ') || '',
          });
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const saveProfile = async () => {
    setSaving(true); setErr(''); setMsg('');
    try {
      const res = await fetch(API, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({
          name: form.name,
          profile: {
            age:          parseInt(form.age) || 0,
            weight:       parseFloat(form.weight) || 0,
            height:       parseFloat(form.height) || 0,
            gender:       form.gender,
            fitnessLevel: form.fitnessLevel,
            goals:        form.goals.split(',').map(s => s.trim()).filter(Boolean),
            concerns:     form.concerns.split(',').map(s => s.trim()).filter(Boolean),
          },
        }),
      });
      const d = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify({ name: d.user.name, id: d.user.id, email: d.user.email }));
        setMsg('Profile updated successfully!');
        setEditing(false);
        // Reload data
        const r2 = await fetch(API, { headers: headers() });
        const d2 = await r2.json();
        if (r2.ok) setData(d2);
      } else setErr(d.message);
    } catch { setErr('Something went wrong'); }
    setSaving(false);
  };

  const changePassword = async () => {
    setErr(''); setMsg('');
    if (pwd.newPassword !== pwd.confirm) { setErr('Passwords do not match'); return; }
    if (pwd.newPassword.length < 6) { setErr('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/password`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword }),
      });
      const d = await res.json();
      if (res.ok) { setMsg('Password changed successfully!'); setPwdMode(false); setPwd({ currentPassword: '', newPassword: '', confirm: '' }); }
      else setErr(d.message);
    } catch { setErr('Something went wrong'); }
    setSaving(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return (
    <div className="prof-page">
      <CustomNavbar />
      <div className="prof-loading"><div className="prof-spinner" /></div>
    </div>
  );

  const { user, stats, metrics, activeGoal } = data || {};
  const bmiInfo = BMI_LABEL(metrics?.bmi);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="prof-page">
      <CustomNavbar />
      <div className="prof-body">

        {/* ── Left Column ── */}
        <div className="prof-left">

          {/* Avatar Card */}
          <div className="prof-avatar-card">
            <div className="prof-avatar">{initials}</div>
            <h2 className="prof-name">{user?.name}</h2>
            <p className="prof-email">{user?.email}</p>
            <p className="prof-since">Member since {memberSince}</p>
            <div className="prof-badges">
              {user?.profile?.fitnessLevel && <span className="prof-badge">{user.profile.fitnessLevel}</span>}
              {user?.profile?.goals?.[0] && <span className="prof-badge goal">{user.profile.goals[0]}</span>}
            </div>
            <div className="prof-avatar-btns">
              <button className="prof-edit-btn" onClick={() => { setEditing(true); setMsg(''); setErr(''); }}>Edit Profile</button>
              <button className="prof-logout-btn" onClick={logout}>Logout</button>
            </div>
          </div>

          {/* Body Metrics */}
          <div className="prof-card">
            <h3 className="prof-card-title">Body <span className="prof-accent">Metrics</span></h3>
            <div className="prof-metrics-grid">
              <div className="prof-metric">
                <span className="prof-metric-val" style={{ color: bmiInfo.color }}>{metrics?.bmi || '—'}</span>
                <span className="prof-metric-lbl">BMI</span>
                <span className="prof-metric-sub" style={{ color: bmiInfo.color }}>{bmiInfo.label}</span>
              </div>
              <div className="prof-metric">
                <span className="prof-metric-val">{metrics?.bmr || '—'}</span>
                <span className="prof-metric-lbl">BMR</span>
                <span className="prof-metric-sub">kcal/day</span>
              </div>
              <div className="prof-metric">
                <span className="prof-metric-val" style={{ color: '#00ff00' }}>{metrics?.tdee || '—'}</span>
                <span className="prof-metric-lbl">TDEE</span>
                <span className="prof-metric-sub">kcal/day</span>
              </div>
              <div className="prof-metric">
                <span className="prof-metric-val">{user?.profile?.weight || '—'}</span>
                <span className="prof-metric-lbl">Weight</span>
                <span className="prof-metric-sub">kg</span>
              </div>
              <div className="prof-metric">
                <span className="prof-metric-val">{user?.profile?.height || '—'}</span>
                <span className="prof-metric-lbl">Height</span>
                <span className="prof-metric-sub">cm</span>
              </div>
              <div className="prof-metric">
                <span className="prof-metric-val">{user?.profile?.age || '—'}</span>
                <span className="prof-metric-lbl">Age</span>
                <span className="prof-metric-sub">years</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column ── */}
        <div className="prof-right">

          {/* Messages */}
          {msg && <div className="prof-msg success">{msg}</div>}
          {err && <div className="prof-msg error">{err}</div>}

          {/* Edit Profile Form */}
          {editing ? (
            <div className="prof-card">
              <h3 className="prof-card-title">Edit <span className="prof-accent">Profile</span></h3>
              <div className="prof-form-grid">
                <div className="prof-field full">
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="prof-field">
                  <label>Age</label>
                  <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="25" />
                </div>
                <div className="prof-field">
                  <label>Weight (kg)</label>
                  <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="70" />
                </div>
                <div className="prof-field">
                  <label>Height (cm)</label>
                  <input type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} placeholder="175" />
                </div>
                <div className="prof-field">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="prof-field">
                  <label>Fitness Level</label>
                  <select value={form.fitnessLevel} onChange={e => setForm(p => ({ ...p, fitnessLevel: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="prof-field full">
                  <label>Goals (comma separated)</label>
                  <input value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} placeholder="Weight Loss, Muscle Gain" />
                </div>
                <div className="prof-field full">
                  <label>Concerns (comma separated)</label>
                  <input value={form.concerns} onChange={e => setForm(p => ({ ...p, concerns: e.target.value }))} placeholder="Back Pain, Stress" />
                </div>
              </div>
              <div className="prof-form-btns">
                <button className="prof-cancel-btn" onClick={() => { setEditing(false); setErr(''); }}>Cancel</button>
                <button className="prof-save-btn" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          ) : (
            /* Personal Info View */
            <div className="prof-card">
              <h3 className="prof-card-title">Personal <span className="prof-accent">Info</span></h3>
              <div className="prof-info-list">
                {[
                  { label: 'Name',          val: user?.name },
                  { label: 'Email',         val: user?.email },
                  { label: 'Age',           val: user?.profile?.age ? `${user.profile.age} years` : '—' },
                  { label: 'Gender',        val: user?.profile?.gender || '—' },
                  { label: 'Fitness Level', val: user?.profile?.fitnessLevel || '—' },
                  { label: 'Goals',         val: user?.profile?.goals?.join(', ') || '—' },
                  { label: 'Concerns',      val: user?.profile?.concerns?.join(', ') || '—' },
                ].map(r => (
                  <div key={r.label} className="prof-info-row">
                    <span className="prof-info-label">{r.label}</span>
                    <span className="prof-info-val">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fitness Stats */}
          <div className="prof-card">
            <h3 className="prof-card-title">Fitness <span className="prof-accent">Stats</span></h3>
            <div className="prof-stats-grid">
              {[
                { icon: '🚶', label: 'Total Steps',      val: stats?.totalSteps?.toLocaleString() || '0',    color: '#00ff00' },
                { icon: '🔥', label: 'Cal Burned',       val: `${stats?.totalCalBurned || 0} kcal`,          color: '#00ff00' },
                { icon: '🍽️', label: 'Cal Consumed',    val: `${stats?.totalCalConsumed || 0} kcal`,         color: '#00ff00' },
                { icon: '💧', label: 'Water Logged',     val: `${stats?.totalWater || 0} glasses`,           color: '#00ff00' },
                { icon: '🏋️', label: 'Workout Days',    val: `${stats?.workoutDays || 0} days`,             color: '#00ff00' },
                { icon: '🔥', label: 'Current Streak',   val: `${stats?.streak || 0} days`,                  color: '#00ff00' },
                { icon: '⭐', label: 'Best Streak',      val: `${stats?.bestStreak || 0} days`,              color: '#00ff00' },
                { icon: '✅', label: 'Goals Completed',  val: `${stats?.goalsCompleted || 0} days`,          color: '#00ff00' },
              ].map(s => (
                <div key={s.label} className="prof-stat-card">
                  <span className="prof-stat-icon">{s.icon}</span>
                  <span className="prof-stat-val" style={{ color: s.color }}>{s.val}</span>
                  <span className="prof-stat-lbl">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Goal */}
          {activeGoal && (
            <div className="prof-card">
              <h3 className="prof-card-title">Active <span className="prof-accent">Goal</span></h3>
              <div className="prof-goal-row">
                <div>
                  <span className="prof-goal-type">{activeGoal.goalType}</span>
                  <span className="prof-goal-sub">{activeGoal.timeline} day plan · {activeGoal.pct}% complete</span>
                </div>
                <button className="prof-goal-btn" onClick={() => navigate('/goals')}>View →</button>
              </div>
              <div className="prof-goal-bar-bg">
                <div className="prof-goal-bar-fill" style={{ width: `${activeGoal.pct}%` }} />
              </div>
            </div>
          )}

          {/* Change Password */}
          <div className="prof-card">
            <div className="prof-card-header">
              <h3 className="prof-card-title">Change <span className="prof-accent">Password</span></h3>
              <button className="prof-toggle-btn" onClick={() => { setPwdMode(!pwdMode); setErr(''); setMsg(''); }}>
                {pwdMode ? 'Cancel' : 'Change'}
              </button>
            </div>
            {pwdMode && (
              <div className="prof-form-grid">
                <div className="prof-field full">
                  <label>Current Password</label>
                  <input type="password" value={pwd.currentPassword} onChange={e => setPwd(p => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="prof-field">
                  <label>New Password</label>
                  <input type="password" value={pwd.newPassword} onChange={e => setPwd(p => ({ ...p, newPassword: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="prof-field">
                  <label>Confirm Password</label>
                  <input type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="prof-field full">
                  <button className="prof-save-btn" onClick={changePassword} disabled={saving}>{saving ? 'Saving...' : 'Update Password'}</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

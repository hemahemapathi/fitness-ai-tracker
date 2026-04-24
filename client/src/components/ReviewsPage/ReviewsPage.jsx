import { useState, useEffect } from 'react';
import CustomNavbar from '../Navbar/Navbar';
import './ReviewsPage.css';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('token');

const Stars = ({ rating }) => (
  <div className="rv-stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#222' }}>★</span>
    ))}
  </div>
);

export default function ReviewsPage() {
  const [reviews, setReviews]   = useState([]);
  const [myOnly, setMyOnly]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState(0); // 0 = all stars

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const url   = myOnly ? `${API}/workouts/my-reviews` : `${API}/workouts/all-reviews`;
        const heads = myOnly
          ? { Authorization: `Bearer ${token()}` }
          : {};
        const res  = await fetch(url, { headers: heads });
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch { setReviews([]); }
      setLoading(false);
    };
    fetchReviews();
  }, [myOnly]);

  const filtered = filter ? reviews.filter(r => r.rating === filter) : reviews;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="rv-page">
      <CustomNavbar />

      <div className="rv-header">
        <span className="tag">COMMUNITY</span>
        <h1 className="rv-title">Workout <span className="neon">Reviews</span></h1>
        <p className="rv-sub">Real feedback from real athletes</p>

        <div className="rv-stats-row">
          <div className="rv-stat"><span className="rv-stat-num">{reviews.length}</span><span className="rv-stat-lbl">Total Reviews</span></div>
          <div className="rv-stat"><span className="rv-stat-num" style={{ color: '#f59e0b' }}>{avgRating}</span><span className="rv-stat-lbl">Avg Rating</span></div>
          <div className="rv-stat"><span className="rv-stat-num">{reviews.filter(r => r.rating >= 4).length}</span><span className="rv-stat-lbl">4★ & Above</span></div>
        </div>
      </div>

      <div className="rv-body">
        {/* Controls */}
        <div className="rv-controls">
          <div className="rv-toggle">
            <button className={!myOnly ? 'active' : ''} onClick={() => setMyOnly(false)}>All Reviews</button>
            <button className={myOnly  ? 'active' : ''} onClick={() => setMyOnly(true)}>My Reviews</button>
          </div>
          <div className="rv-star-filter">
            {[0,5,4,3,2,1].map(s => (
              <button key={s} className={`sf-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s === 0 ? 'All' : `${s}★`}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="rv-loading"><div className="rv-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="rv-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p>No reviews yet</p>
          </div>
        ) : (
          <div className="rv-grid">
            {filtered.map(r => (
              <div key={r._id} className="rv-card">
                <div className="rv-card-top">
                  <div className="rv-avatar">{r.userName?.[0]?.toUpperCase() || 'U'}</div>
                  <div className="rv-card-info">
                    <span className="rv-name">{r.userName || 'Anonymous'}</span>
                    <span className="rv-date">{new Date(r.completedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <div className="rv-plan-badge">{r.planName}</div>
                {r.review && <p className="rv-text">"{r.review}"</p>}
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

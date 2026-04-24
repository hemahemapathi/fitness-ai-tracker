import { useState, useEffect } from 'react';
import CustomNavbar from '../Navbar/Navbar';
import './HomePage.css';

const API = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`${API}/workouts/all-reviews`)
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => {});
  }, []);

  const Stars = ({ rating }) => (
    <div className="stars">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#333' }}>★</span>)}</div>
  );
  return (
    <div className="home-page">
      <CustomNavbar />

      {/* Hero - Full Screen BG */}
      <section className="section-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="tag">AI-POWERED FITNESS PLATFORM</p>
          <h1>BREAK YOUR<br /><span className="neon">LIMITS</span></h1>
          <p className="hero-sub">Train smarter. Recover faster. Achieve more. Your personal AI coach is ready.</p>
          <div className="hero-stats">
            <div className="h-stat"><span className="h-num">50K+</span><span className="h-lbl">Members</span></div>
            <div className="h-divider" />
            <div className="h-stat"><span className="h-num">98%</span><span className="h-lbl">Success Rate</span></div>
            <div className="h-divider" />
            <div className="h-stat"><span className="h-num">200+</span><span className="h-lbl">Workout Plans</span></div>
          </div>
        </div>
        <div className="scroll-hint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </section>

      {/* Features */}
      <section className="section-features">
        <div className="feat-bg-img" />
        <div className="feat-overlay" />
        <div className="feat-content">
          <p className="tag center">FEATURES</p>
          <h2 className="section-heading">Everything In One Place</h2>
          <div className="features-grid">
            <div className="feat-card">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4"/></svg>
              <h3>Strength Training</h3>
              <p>Progressive programs built to maximize muscle and strength gains.</p>
            </div>
            <div className="feat-card">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <h3>Progress Tracking</h3>
              <p>Visual analytics to monitor every improvement you make over time.</p>
            </div>
            <div className="feat-card">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              <h3>Nutrition Plans</h3>
              <p>Custom meal plans tailored to your body type and fitness goals.</p>
            </div>
            <div className="feat-card">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <h3>AI Coach</h3>
              <p>Real-time personalized advice from your AI fitness coach 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-testi">
        <div className="testi-bg-img" />
        <div className="testi-overlay" />
        <div className="testi-content">
          <p className="tag center">TESTIMONIALS</p>
          <h2 className="section-heading">Real People. Real Results.</h2>
          <div className="testi-grid">
            {reviews.length > 0 ? reviews.map((r, i) => (
              <div key={r._id} className={`testi-card ${i === 1 ? 'featured' : ''}`}>
                <Stars rating={r.rating} />
                <p>"{r.review || 'Great workout experience!'}"</p>
                <div className="testi-author">
                  <div className="avatar">{r.userName?.[0]?.toUpperCase() || 'U'}</div>
                  <div>
                    <strong>{r.userName || 'Anonymous'}</strong>
                    <span>{r.planName}</span>
                  </div>
                </div>
              </div>
            )) : [
              { name: 'Alex Chen',       text: 'Lost 20kg in 4 months. The AI coach kept me accountable every single day.',        result: 'Lost 20kg' },
              { name: 'Maria Rodriguez', text: 'FitTracker is the only app that actually adapts to me. Incredible results.',         result: 'Gained 8kg muscle', featured: true },
              { name: 'David Kim',       text: 'The nutrition plans combined with workouts helped me hit my goal weight fast.',      result: 'Hit goal weight' },
            ].map((t, i) => (
              <div key={i} className={`testi-card ${t.featured ? 'featured' : ''}`}>
                <div className="stars">★★★★★</div>
                <p>"{t.text}"</p>
                <div className="testi-author">
                  <div className="avatar">{t.name[0]}</div>
                  <div><strong>{t.name}</strong><span>{t.result}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-cta">
        <div className="cta-bg-img" />
        <div className="cta-overlay" />
        <div className="cta-content">
          <p className="tag center">JOIN US TODAY</p>
          <h2>YOUR BEST SELF<br /><span className="neon">STARTS NOW</span></h2>
          <div className="cta-steps">
            <div className="cta-step">
              <div className="cta-step-num">01</div>
              <strong>Create Profile</strong>
              <span>Tell us your goals and fitness level</span>
            </div>
            <div className="cta-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div className="cta-step">
              <div className="cta-step-num">02</div>
              <strong>Get Your Plan</strong>
              <span>AI builds your personalized program</span>
            </div>
            <div className="cta-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div className="cta-step">
              <div className="cta-step-num">03</div>
              <strong>Track & Improve</strong>
              <span>Log workouts and crush your goals</span>
            </div>
          </div>
          <button className="btn-green large">Get Started</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <span className="footer-logo">Fit<span>Tracker</span></span>
        <p>&copy; 2024 FitTracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;

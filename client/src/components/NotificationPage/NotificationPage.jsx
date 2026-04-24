import { useState, useEffect } from 'react';
import CustomNavbar from '../Navbar/Navbar';
import './NotificationPage.css';

const API = `${import.meta.env.VITE_API_URL}/notifications`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const TYPE_CONFIG = {
  success:  { icon: '✅', color: '#00ff00' },
  missed:   { icon: '⚠️', color: '#f59e0b' },
  warning:  { icon: '🔔', color: '#ef4444' },
  reminder: { icon: '🎯', color: '#3b82f6' },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('all');
  const [clearing, setClearing]           = useState(false);

  const fetch_ = async () => {
    try {
      const res = await fetch(API, { headers: headers() });
      const data = await res.json();
      if (res.ok) setNotifications(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const markOne = async (id) => {
    try {
      await fetch(`${API}/${id}/read`, { method: 'PUT', headers: headers() });
      setNotifications(p => p.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  const markAll = async () => {
    try {
      await fetch(`${API}/read-all`, { method: 'PUT', headers: headers() });
      setNotifications(p => p.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await fetch(`${API}/clear`, { method: 'DELETE', headers: headers() });
      setNotifications([]);
    } catch { /* silent */ }
    setClearing(false);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread')  return !n.read;
    if (filter === 'success') return n.type === 'success';
    if (filter === 'missed')  return n.type === 'missed';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notif-page">
      <CustomNavbar />
      <div className="notif-body">

        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-left">
            <span className="notif-eyebrow">INBOX</span>
            <div className="notif-title-row">
              <h1 className="notif-h1">Notifications</h1>
              {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}
            </div>
          </div>
          <div className="notif-header-btns">
            {unreadCount > 0 && (
              <button className="notif-action-btn" onClick={markAll}>Mark all read</button>
            )}
            {notifications.length > 0 && (
              <button className="notif-action-btn danger" onClick={clearAll} disabled={clearing}>
                {clearing ? 'Clearing...' : 'Clear all'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="notif-tabs">
          {[
            { key: 'all',     label: `All (${notifications.length})` },
            { key: 'unread',  label: `Unread (${unreadCount})` },
            { key: 'success', label: '✅ Success' },
            { key: 'missed',  label: '⚠️ Missed' },
          ].map(t => (
            <button key={t.key} className={`notif-tab ${filter === t.key ? 'active' : ''}`}
              onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="notif-loading"><div className="notif-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <span className="notif-empty-icon">🔔</span>
            <span className="notif-empty-text">
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </span>
            <span className="notif-empty-sub">Notifications will appear here as you use the app</span>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.reminder;
              return (
                <div
                  key={n._id}
                  className={`notif-card ${!n.read ? 'unread' : ''}`}
                  style={{ '--nc': cfg.color }}
                  onClick={() => !n.read && markOne(n._id)}
                >
                  <div className="notif-card-icon" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}33` }}>
                    {cfg.icon}
                  </div>
                  <div className="notif-card-body">
                    <p className="notif-card-msg">{n.message}</p>
                    <span className="notif-card-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.read && <div className="notif-unread-dot" style={{ background: cfg.color }} />}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

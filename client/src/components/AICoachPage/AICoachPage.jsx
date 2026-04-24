import { useState, useEffect, useRef } from 'react';
import CustomNavbar from '../Navbar/Navbar';
import './AICoachPage.css';

const API = `${import.meta.env.VITE_API_URL}/ai`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const SUGGESTIONS = [
  'How is my progress today?',
  'What should I eat for dinner?',
  'How many more steps do I need?',
  'Give me a workout tip',
  'Am I hitting my protein goal?',
  'How can I improve my sleep?',
];

export default function AICoachPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm FitAI, your personal fitness coach 💪 I have access to your real fitness data. Ask me anything about your nutrition, workouts, goals, or progress!" }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(p => [...p, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API}/chat`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : 'Sorry, something went wrong. Please try again.';
      setMessages(p => [...p, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Hi! I'm FitAI, your personal fitness coach 💪 I have access to your real fitness data. Ask me anything about your nutrition, workouts, goals, or progress!" }]);
  };

  return (
    <div className="ai-page">
      <CustomNavbar />
      <div className="ai-body">

        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-avatar">🤖</div>
            <div>
              <h1 className="ai-title">FitAI <span className="ai-accent">Coach</span></h1>
              <p className="ai-sub">Powered by Groq · Personalized to your data</p>
            </div>
          </div>
          <button className="ai-clear-btn" onClick={clearChat}>Clear chat</button>
        </div>

        {/* Chat */}
        <div className="ai-chat">
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>
              {m.role === 'assistant' && <div className="ai-msg-avatar">🤖</div>}
              <div className="ai-msg-bubble">
                <p>{m.content}</p>
              </div>
              {m.role === 'user' && <div className="ai-msg-avatar user">👤</div>}
            </div>
          ))}

          {loading && (
            <div className="ai-msg assistant">
              <div className="ai-msg-avatar">🤖</div>
              <div className="ai-msg-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="ai-suggestions">
            <p className="ai-suggestions-label">Try asking:</p>
            <div className="ai-suggestions-grid">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="ai-suggestion-btn" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="ai-input-wrap">
          <textarea
            ref={inputRef}
            className="ai-input"
            placeholder="Ask your fitness coach anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button className="ai-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
            {loading ? '...' : '↑'}
          </button>
        </div>

      </div>
    </div>
  );
}

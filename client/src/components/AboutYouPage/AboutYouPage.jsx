import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutYouPage.css';

const AboutYouPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    height: '', weight: '', age: '', gender: '', fitnessLevel: '', goals: [],
  });

  const totalSteps = 3;
  const toggleGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal]
    }));
  };

  const handleNext = async () => {
    setError('');
    if (step === 1) {
      if (!formData.height || !formData.weight || !formData.age || !formData.gender) {
        setError('Please fill in all fields before continuing.'); return;
      }
    }
    if (step === 2) {
      if (!formData.fitnessLevel) { setError('Please select your fitness level.'); return; }
      if (formData.goals.length === 0) { setError('Please select at least one fitness goal.'); return; }
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setSaving(true);
      try {
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            profile: {
              height:       parseFloat(formData.height),
              weight:       parseFloat(formData.weight),
              age:          parseInt(formData.age),
              gender:       formData.gender,
              fitnessLevel: formData.fitnessLevel,
              goals:        formData.goals,
            }
          }),
        });
      } catch { /* silent */ }
      setSaving(false);
      navigate('/home');
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <p className="section-label">Basic Information</p>
            <div className="input-grid">
              <div className="input-group-custom">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                  placeholder="170"
                  className="form-input"
                />
              </div>
              <div className="input-group-custom">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  className="form-input"
                />
              </div>
              <div className="input-group-custom">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  placeholder="25"
                  className="form-input"
                />
              </div>
              <div className="input-group-custom">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="form-input"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <p className="section-label">Current Fitness Level</p>
            <div className="options-row">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`option-btn ${formData.fitnessLevel === level ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, fitnessLevel: level })}
                >
                  {level}
                </button>
              ))}
            </div>

            <p className="section-label" style={{ marginTop: '1.5rem' }}>Fitness Goals <span className="hint">(Select all that apply)</span></p>
            <div className="options-grid">
              {['Weight Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Flexibility', 'General Health'].map(goal => (
                <button
                  key={goal}
                  type="button"
                  className={`option-btn ${formData.goals.includes(goal) ? 'selected' : ''}`}
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="summary">
              <p className="section-label">Your Profile Summary</p>
              <div className="summary-grid">
                <div className="summary-item"><span>Height</span><strong>{formData.height} cm</strong></div>
                <div className="summary-item"><span>Weight</span><strong>{formData.weight} kg</strong></div>
                <div className="summary-item"><span>Age</span><strong>{formData.age}</strong></div>
                <div className="summary-item"><span>Gender</span><strong>{formData.gender}</strong></div>
                <div className="summary-item"><span>Fitness Level</span><strong>{formData.fitnessLevel}</strong></div>
                <div className="summary-item"><span>Goals</span><strong>{formData.goals.join(', ')}</strong></div>
              </div>
              <p className="almost-done">Everything looks good! Click <span>Complete Profile</span> to continue.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="about-you-page">
      <div className="about-you-card">
        <h2 className="page-title">Tell Us About Yourself</h2>

        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
        <p className="step-indicator">Step {step} of {totalSteps}</p>

        {error && <div className="error-alert">{error}</div>}

        {renderStep()}

        <div className="button-group">
          <button type="button" className="next-btn" onClick={handleBack} style={{ visibility: step > 1 ? 'visible' : 'hidden' }}>Back</button>
          <button type="button" className="next-btn" onClick={handleNext} disabled={saving}>
            {step === totalSteps ? (saving ? 'Saving...' : 'Complete Profile') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutYouPage;

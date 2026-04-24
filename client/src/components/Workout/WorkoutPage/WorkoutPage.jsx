import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomNavbar from '../../Navbar/Navbar';
import './WorkoutPage.css';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('token');

const WorkoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workoutPlan = location.state?.workoutPlan;
  
  // If no workout plan is provided, redirect back to workouts
  useEffect(() => {
    if (!workoutPlan) {
      navigate('/workouts');
    }
  }, [workoutPlan, navigate]);

  const [currentWorkout, setCurrentWorkout] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFeedback, setShowFeedback]         = useState(false);
  const [rating, setRating]                     = useState(0);
  const [hoverRating, setHoverRating]           = useState(0);
  const [reviewText, setReviewText]             = useState('');
  const [submitting, setSubmitting]             = useState(false);
  const [savedLog, setSavedLog]                 = useState(null);
  const spokenNumbers = useRef(new Set());

  const workouts = workoutPlan ? workoutPlan.exercises_list.map((exercise, index) => ({
    id: index + 1,
    name: exercise,
    duration: 30,
    description: `Perform ${exercise} with proper form`,
  })) : [];

  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const completedDuration = workouts.slice(0, currentWorkout).reduce((sum, workout) => sum + workout.duration, 0) + 
    (workouts[currentWorkout] ? workouts[currentWorkout].duration - timeLeft : 0);
  const progress = (completedDuration / totalDuration) * 100;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          const newTime = timeLeft - 1;
          // Play different tones based on time remaining
          if (newTime > 5) {
            if (newTime <= 10) {
              playEmergencyBeep();
            } else {
              playBeep();
            }
          } else if (newTime <= 5 && newTime >= 0) {
            playFinalCountdownBeep();
          }
          return newTime;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0 && !isPaused) {
      handleExerciseComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isPaused]);

  useEffect(() => {
    let interval = null;
    if (isResting && restTime > 0 && !isPaused) {
      interval = setInterval(() => {
        setRestTime(restTime => {
          const newTime = restTime - 1;
          if (newTime <= 5 && newTime >= 0) {
            playFinalCountdownBeep();
          } else {
            playBeep();
          }
          return newTime;
        });
      }, 1000);
    } else if (isResting && restTime === 0 && !isPaused) {
      handleRestComplete();
    }
    return () => clearInterval(interval);
  }, [isResting, restTime, isPaused]);

  const startSession = () => {
    setSessionStarted(true);
    setCurrentWorkout(0);
    spokenNumbers.current = new Set();
    speak("Workout session started! Get ready for " + workouts[0].name, () => {
      speak("Get started!", () => {
        const duration = workouts[0].duration;
        setTimeLeft(duration);
        setIsActive(true);
        // Speak the starting number immediately
        if (duration <= 10) {
          speak(duration.toString());
          spokenNumbers.current.add(duration);
        }
      });
    });
  };

  const handleExerciseComplete = () => {
    setIsActive(false);
    setTimeLeft(0);
    if (currentWorkout < workouts.length - 1) {
      speak("Exercise complete! Rest for 10 seconds", () => {
        setTimeout(() => {
          if (!isTransitioning) {
            setIsResting(true);
            setRestTime(10);
          }
        }, 1000);
      });
    } else {
      setIsComplete(true);
      speak("Workout complete! Great job!");
      saveSession();
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    setRestTime(0);
    const nextIndex = currentWorkout + 1;
    setCurrentWorkout(nextIndex);
    spokenNumbers.current = new Set();
    speak("Next exercise: " + workouts[nextIndex].name, () => {
      speak("Get started!", () => {
        if (!isTransitioning) {
          const duration = workouts[nextIndex].duration;
          setTimeLeft(duration);
          setIsActive(true);
        }
      });
    });
  };

  const handleNextWorkout = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsActive(false);
    setIsPaused(false);
    if (isResting) {
      setIsResting(false);
      setRestTime(0);
      handleRestComplete();
    } else {
      setTimeLeft(0);
      handleExerciseComplete();
    }
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const handleSkip = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsActive(false);
    setIsPaused(false);
    if (isResting) {
      setIsResting(false);
      setRestTime(0);
      handleRestComplete();
    } else {
      setTimeLeft(0);
      handleExerciseComplete();
    }
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const speak = (text, callback) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      if (callback) {
        utterance.onend = callback;
      }
      speechSynthesis.speak(utterance);
    } else if (callback) {
      setTimeout(callback, 2000);
    }
  };

  const audioContextRef = useRef(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playBeep = () => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const playEmergencyBeep = () => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1200;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const playFinalCountdownBeep = () => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1800;
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      speak("Workout paused");
    } else {
      speak("Workout resumed");
    }
  };

  const handleStop = () => {
    speak("Workout stopped");
    setIsActive(false);
    setIsResting(false);
    setIsPaused(false);
    setTimeLeft(0);
    setRestTime(0);
    setIsTransitioning(false);
    resetWorkout();
  };

  const saveSession = async () => {
    try {
      const calories = Math.round(totalDuration * 0.15);
      const res = await fetch(`${API}/workouts/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          planId:        workoutPlan.id,
          planName:      workoutPlan.name,
          category:      workoutPlan.category,
          duration:      totalDuration,
          calories,
          exerciseCount: workouts.length,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedLog(data);
      }
    } catch { /* silent */ }
  };

  const submitReview = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      // update the saved log with review via a new complete call that carries review
      await fetch(`${API}/workouts/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          planId:        workoutPlan.id,
          planName:      workoutPlan.name,
          category:      workoutPlan.category,
          duration:      totalDuration,
          calories:      Math.round(totalDuration * 0.15),
          exerciseCount: workouts.length,
          rating,
          review:        reviewText,
        }),
      });
    } catch { /* silent */ }
    setSubmitting(false);
    setShowFeedback(false);
  };

  const resetWorkout = () => {
    setSessionStarted(false);
    setCurrentWorkout(0);
    setTimeLeft(0);
    setIsActive(false);
    setIsComplete(false);
    setIsResting(false);
    setRestTime(0);
    setIsPaused(false);
    setIsTransitioning(false);
    spokenNumbers.current = new Set();
  };

  if (!sessionStarted) {
    return (
      <div className="workout-page">
        <CustomNavbar />
        <div className="workout-container">
          <div className="workout-header">
            <h1 className="workout-title">Ready to <span className="neon-text">WORKOUT?</span></h1>
            <p className="workout-subtitle">{workoutPlan?.name} - Complete {workouts.length} exercises in {formatTime(totalDuration)}</p>
          </div>

          <div className="workout-preview">
            <div className="preview-grid">
              {workouts.map((workout) => (
                <div key={workout.id} className="preview-card">
                  <div className="preview-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4"/></svg>
                  </div>
                  <h3>{workout.name}</h3>
                  <p>{workout.duration}s</p>
                </div>
              ))}
            </div>
          </div>

          <button className="start-btn" onClick={startSession}>START WORKOUT</button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="workout-page">
        <CustomNavbar />
        <div className="workout-container">
          <div className="complete-screen">
            <div className="complete-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="complete-title">Workout <span className="neon-text">Complete!</span></h1>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{formatTime(totalDuration)}</div>
                <div className="stat-label">Total Time</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{workouts.length}</div>
                <div className="stat-label">Exercises</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">~{Math.round(totalDuration * 0.15)}</div>
                <div className="stat-label">Calories</div>
              </div>
            </div>

            {/* Feedback Modal */}
            {showFeedback ? (
              <div className="feedback-box">
                <p className="feedback-title">How was your workout?</p>
                <div className="star-row">
                  {[1,2,3,4,5].map(s => (
                    <span
                      key={s}
                      className={`star ${s <= (hoverRating || rating) ? 'active' : ''}`}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                    >★</span>
                  ))}
                </div>
                <textarea
                  className="review-input"
                  placeholder="Share your experience (optional)..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={3}
                />
                <div className="feedback-btns">
                  <button className="skip-feedback-btn" onClick={() => setShowFeedback(false)}>Skip</button>
                  <button className="submit-feedback-btn" onClick={submitReview} disabled={!rating || submitting}>
                    {submitting ? 'Saving...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="complete-actions">
                <button className="feedback-trigger-btn" onClick={() => setShowFeedback(true)}>
                  ★ Leave a Review
                </button>
                <button className="restart-btn" onClick={resetWorkout}>NEW WORKOUT</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-page">
      <CustomNavbar />
      <div className="workout-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span>←</span>
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="workout-info">
          <h2 className="current-workout">
            {isResting ? "REST TIME" : workouts[currentWorkout].name}
          </h2>
          <p className="workout-description">
            {isResting ? "Take a break and prepare for next exercise" : workouts[currentWorkout].description}
          </p>
        </div>

        <div className="timer-section">
          <div className="timer-ring">
            <span className="timer-number">{isResting ? restTime : timeLeft}</span>
          </div>
          <div className="timer-label">{isResting ? 'REST' : 'SECONDS'}</div>
        </div>

        <div className="workout-controls">
          <button className="control-btn pause-btn" onClick={handlePause}>
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>
          <button className="control-btn stop-btn" onClick={handleStop}>
            <span>STOP</span>
          </button>
          <button className="control-btn skip-btn" onClick={handleSkip}>
            <span>SKIP</span>
          </button>
        </div>

        <div className="workout-progress">
          <span>{currentWorkout + 1} of {workouts.length} exercises</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPage;
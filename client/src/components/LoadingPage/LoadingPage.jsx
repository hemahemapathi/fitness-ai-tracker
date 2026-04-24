import { useEffect, useState } from 'react';
import './LoadingPage.css';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-content">
        <div className="logo-container">
          <div className="fitness-icon">
          </div>
          <h1 className="logo-text">FitTracker</h1>
        </div>
        
        <div className="progress-container">
          <div className="progress-circle">
            <svg className="progress-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="progress-bg"/>
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                className="progress-bar"
                style={{
                  strokeDasharray: `${progress * 2.83} 283`,
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%'
                }}
              />
            </svg>
            <div className="progress-text">{progress}%</div>
          </div>
        </div>
        
        <p className="loading-message">Preparing your fitness journey...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
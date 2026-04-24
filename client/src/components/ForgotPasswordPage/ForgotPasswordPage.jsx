import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setLoading(false);
        setMessage(`OTP sent to ${email}`);
        setStep(2);
      } else {
        setMessage(data.message || 'Error sending OTP');
        setLoading(false);
      }
    } catch (err) {
      setMessage('Error sending OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('OTP verified! Enter new password.');
        setStep(3);
      } else {
        setMessage(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setMessage('Error verifying OTP. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setLoading(false);
        setMessage('Password reset successful!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Error resetting password');
        setLoading(false);
      }
    } catch (err) {
      setMessage('Error resetting password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h2>
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'New Password'}
          </h2>
          <p>
            {step === 1 && 'Enter your email to receive OTP'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Create your new password'}
          </p>
        </div>

        {message && <Alert variant={message.includes('sent') || message.includes('verified') || message.includes('successful') ? 'success' : 'danger'} className="message-alert">{message}</Alert>}

        {step === 1 && (
          <Form onSubmit={handleEmailSubmit} className="forgot-password-form">
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="form-input"
            />
            <Button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </Form>
        )}

        {step === 2 && (
          <Form onSubmit={handleOtpSubmit} className="forgot-password-form">
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              required
              className="form-input otp-input"
            />
            <Button 
              type="submit" 
              className="submit-btn"
            >
              Verify OTP
            </Button>
          </Form>
        )}

        {step === 3 && (
          <Form onSubmit={handlePasswordSubmit} className="forgot-password-form">
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              className="form-input"
            />
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              className="form-input"
            />
            <Button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
        )}

        <div className="back-link">
          <span onClick={() => navigate('/login')} className="link">
            ← Back to Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
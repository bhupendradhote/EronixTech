import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const Login = ({ onSuccess }) => {
  // Ensure your useAuth hook exposes googleLogin
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    try {
      setIsLoading(true);
      await login({ email, password });
      
      setSuccessMsg('Login successful! Redirecting...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message ||
        'Invalid email or password. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setSuccessMsg('');
    try {
      setIsLoading(true);
      // Pass the credential (ID token) to your backend
      await googleLogin(credentialResponse.credential);
      
      setSuccessMsg('Google Login successful! Redirecting...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setSuccessMsg('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header-text">
        <h3>Welcome Back</h3>
        <p>Enter your credentials to access your account.</p>
      </div>

      {error && (
        <div className="auth-error-banner">
          {error}
        </div>
      )}
      
      {successMsg && (
        <div className="auth-success-banner">
          {successMsg}
        </div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <div className="input-icon-wrapper">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={handleEmailChange}
              required 
              disabled={isLoading || !!successMsg}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <div className="input-icon-wrapper">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={handlePasswordChange}
              required 
              disabled={isLoading || !!successMsg}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <a href="#forgot" className="forgot-link">Forgot Password?</a>
        </div>
        
        <button 
          type="submit" 
          className="btn-auth-submit"
          disabled={isLoading || !!successMsg}
        >
          {isLoading ? 'Authenticating...' : successMsg ? 'Success!' : 'Login Securely'}
        </button>
      </form>

      {/* Google Login Section */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
        <span style={{ padding: '0 10px', color: '#666', fontSize: '14px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed. Please try again.')}
          useOneTap
          shape="rectangular"
          theme="outline"
          text="continue_with"
        />
      </div>

    </div>
  );
};

export default Login;
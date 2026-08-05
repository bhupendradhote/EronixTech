import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const Register = ({ onSuccess }) => {
  // Pull googleLogin here as well so users can sign up with Google
  const { register, googleLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    // Frontend validation
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.full_name.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }
    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      
      await register({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password
      });

      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 800);
      
    } catch (err) {
      let errorMsg = "Registration failed. Please try again.";
      if (err.response) {
        errorMsg = err.response.data?.message || 
                   err.response.data?.error || 
                   err.response.statusText ||
                   "Registration failed. Please check your details.";
      } else if (err.request) {
        errorMsg = "Network error. Please check your internet connection.";
      } else {
        errorMsg = err.message || errorMsg;
      }
      setError(errorMsg);
    } finally {
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
      
      setSuccessMsg('Google Sign-up successful! Redirecting...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header-text">
        <h3>Create an Account</h3>
        <p>Join EronixTech to source smarter and scale faster.</p>
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

      {/* Google Sign-up Section */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign up failed. Please try again.')}
          useOneTap
          shape="rectangular"
          theme="outline"
          text="signup_with"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
        <span style={{ padding: '0 10px', color: '#666', fontSize: '14px' }}>OR CONTINUE WITH EMAIL</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <div className="input-icon-wrapper">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input 
              type="text" 
              name="full_name"
              placeholder="Enter your full name" 
              value={formData.full_name}
              onChange={handleChange}
              required 
              disabled={isLoading || !!successMsg}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <div className="input-icon-wrapper">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <input 
              type="tel" 
              name="phone_number"
              placeholder="Enter your phone number" 
              value={formData.phone_number}
              onChange={handleChange}
              required 
              disabled={isLoading || !!successMsg}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <div className="input-icon-wrapper">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <input 
              type="email" 
              name="email"
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
              required 
              disabled={isLoading || !!successMsg}
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                type="password" 
                name="password"
                placeholder="Create password" 
                value={formData.password}
                onChange={handleChange}
                required 
                disabled={isLoading || !!successMsg}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <input 
                type="password" 
                name="confirm_password"
                placeholder="Confirm password" 
                value={formData.confirm_password}
                onChange={handleChange}
                required 
                disabled={isLoading || !!successMsg}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-auth-submit"
          disabled={isLoading || !!successMsg}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default Register;
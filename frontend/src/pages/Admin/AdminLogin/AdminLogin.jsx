import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import adminAuthService from '../../../services/adminAuthService';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await adminAuthService.login(formData);
      
      // Login successful – redirect to admin dashboard
      if (response.token) {
        window.location.href = '/admin';
      }
    } catch (err) {
      // Error handling: get message from response or fallback
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-bg">
        <div className="login-overlay"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">Admin Portal</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to manage your store</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-alert">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <FiLogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Secure Admin Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gameAuthService from "../../../services/gameAuthService";
import '../../GameZone/GamingZone.css'; 

const GameRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { username, email, full_name, password, confirmPassword } = formData;
    if (!username || !email || !full_name || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) return;

    try {
      setLoading(true);
      const { confirmPassword, ...registerData } = formData;
      // Register and auto-login (token stored by service)
      await gameAuthService.register(registerData);
      setSuccess(true);
      // Redirect to gaming zone (logged in)
      navigate("/gaming-zone");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Join Game Zone</h1>
        <p className="auth-subtitle">Create your account and start playing</p>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div className="auth-success">
            Registration successful! Redirecting to Game Zone...
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="phone_number">Phone Number (optional)</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || success}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="auth-link-row">
          Already have an account? <Link to="/game/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default GameRegister;
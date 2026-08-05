import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import gameAuthService from "../../../services/gameAuthService";
import '../../GameZone/GamingZone.css'; 

const GameLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Google login handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");
        await gameAuthService.googleLogin(tokenResponse.access_token);
        navigate("/gaming-zone");
      } catch (err) {
        setError(err.response?.data?.message || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google login failed. Please try again.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await gameAuthService.login({ identifier, password });
      navigate("/gaming-zone");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Game Zone</h1>
        <p className="auth-subtitle">Login to continue your adventure</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="identifier">Email or Username</label>
            <input
              id="identifier"
              type="text"
              placeholder="Enter email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              className={error ? "auth-input-error" : ""}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={error ? "auth-input-error" : ""}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <button
          className="auth-google-btn"
          onClick={() => googleLogin()}
          disabled={loading}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Sign in with Google
        </button>

        <div className="auth-link-row">
          Don't have an account? <Link to="/game/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default GameLogin;
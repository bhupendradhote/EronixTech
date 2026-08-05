import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  FiMenu, FiX, FiShoppingCart, FiUser, FiMail, FiLock,
  FiUserPlus, FiLogIn, FiLogOut, FiAlertCircle
} from 'react-icons/fi';
import gameAuthService from '../../services/gameAuthService';
import './GameZoneHeader.css';

const GameZoneHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '', email: '', full_name: '', phone_number: '', password: '', confirmPassword: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('gameToken');
    if (token) fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await gameAuthService.getProfile();
      setUser(data);
    } catch {
      handleLogout();
    }
  };

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
    if (!isPopupOpen) {
      setIsLoginMode(true);
      setError('');
      setLoginData({ identifier: '', password: '' });
      setRegisterData({ username: '', email: '', full_name: '', phone_number: '', password: '', confirmPassword: '' });
    }
  };
  const switchMode = (mode) => {
    setIsLoginMode(mode);
    setError('');
    setLoginData({ identifier: '', password: '' });
    setRegisterData({ username: '', email: '', full_name: '', phone_number: '', password: '', confirmPassword: '' });
  };
  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await gameAuthService.login({ identifier: loginData.identifier, password: loginData.password });
      await fetchUserProfile();
      setIsPopupOpen(false);
      if (location.pathname !== '/gaming-zone') navigate('/gaming-zone');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...registerPayload } = registerData;
      await gameAuthService.register(registerPayload);
      await fetchUserProfile();
      setIsPopupOpen(false);
      navigate('/gaming-zone');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: use `id_token: true` to get an ID token (JWT)
  const googleLogin = useGoogleLogin({
    id_token: true,
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        const idToken = tokenResponse.id_token;
        if (!idToken) throw new Error('No ID token received');
        await gameAuthService.googleLogin(idToken);
        await fetchUserProfile();
        setIsPopupOpen(false);
        if (location.pathname !== '/gaming-zone') navigate('/gaming-zone');
      } catch (err) {
        setError(err.response?.data?.message || 'Google login failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed.');
      setLoading(false);
    },
  });

  const handleLogout = () => {
    gameAuthService.logout();
    setUser(null);
    navigate('/gaming-zone');
  };

  const getUserInitial = () => {
    if (!user) return '?';
    return user.full_name ? user.full_name.charAt(0).toUpperCase() : '?';
  };

  return (
    <>
      <header className="game-zone-header">
        <div className="header-container">
          <div className="header-logo">
            <Link to="/">
              <h2>ERONIX <span>GAMING</span></h2>
            </Link>
          </div>
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li><Link to="/gaming-zone" className={isActive('/gaming-zone')}>Gaming Zone</Link></li>
              <li><Link to="/tournament" className={isActive('/tournament')}>Tournaments</Link></li>
              <li><Link to="/game-store" className={isActive('/game-store')}>Game Store</Link></li>
              <li><Link to="/game-contact" className={isActive('/game-contact')}>Contact</Link></li>
            </ul>
          </nav>
          <div className="header-actions">
            <button className="icon-btn cart-btn" aria-label="Cart">
              <FiShoppingCart />
              <span className="cart-badge">0</span>
            </button>
            {user ? (
              <div className="user-profile">
                <button className="icon-btn user-btn" onClick={togglePopup}>
                  <span className="user-avatar">{getUserInitial()}</span>
                </button>
                <span className="user-name">{user.full_name || user.username}</span>
                <button className="logout-btn" onClick={handleLogout}><FiLogOut /></button>
              </div>
            ) : (
              <button className="icon-btn user-btn" onClick={togglePopup}><FiUser /></button>
            )}
            <button className="mobile-menu-toggle" onClick={toggleMenu}>
              {isMobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="mobile-nav">
            <ul className="mobile-nav-links">
              <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
              <li><Link to="/gaming-zone" onClick={toggleMenu}>Gaming Zone</Link></li>
              <li><Link to="/tournament" onClick={toggleMenu}>Tournaments</Link></li>
              <li><Link to="/game-store" onClick={toggleMenu}>Game Store</Link></li>
              <li><Link to="/game-contact" onClick={toggleMenu}>Contact</Link></li>
            </ul>
          </div>
        )}
      </header>

      {isPopupOpen && (
        <div className="auth-overlay" onClick={togglePopup}>
          <div className="auth-popup" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={togglePopup}><FiX /></button>
            <div className="auth-header">
              <div className="auth-logo"><h2>ERONIX <span>GAMING</span></h2></div>
              <p className="auth-subtitle">
                {isLoginMode ? 'Welcome back! Login to your account.' : 'Create your account and start gaming!'}
              </p>
            </div>
            <div className="auth-tabs">
              <button className={`auth-tab ${isLoginMode ? 'active' : ''}`} onClick={() => switchMode(true)} disabled={loading}>
                <FiLogIn /> Login
              </button>
              <button className={`auth-tab ${!isLoginMode ? 'active' : ''}`} onClick={() => switchMode(false)} disabled={loading}>
                <FiUserPlus /> Register
              </button>
            </div>
            {error && (
              <div className="auth-error-msg"><FiAlertCircle /> {error}</div>
            )}
            {isLoginMode ? (
              <form className="auth-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="login-identifier"><FiMail /> Email or Username</label>
                  <input type="text" id="login-identifier" name="identifier" placeholder="Enter email or username" value={loginData.identifier} onChange={handleLoginChange} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="login-password"><FiLock /> Password</label>
                  <input type="password" id="login-password" name="password" placeholder="Enter your password" value={loginData.password} onChange={handleLoginChange} required disabled={loading} />
                </div>
                <div className="form-options">
                  <label className="remember-me"><input type="checkbox" /> Remember me</label>
                  <a href="#" className="forgot-password">Forgot Password?</a>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Logging in...' : <><FiLogIn /> Login</>}
                </button>
                <button type="button" className="auth-google-btn" onClick={() => googleLogin()} disabled={loading}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                  Sign in with Google
                </button>
                <p className="auth-switch-text">
                  Don't have an account? <span className="auth-switch-link" onClick={() => switchMode(false)}>Register here</span>
                </p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label htmlFor="register-username"><FiUser /> Username</label>
                  <input type="text" id="register-username" name="username" placeholder="Choose a username" value={registerData.username} onChange={handleRegisterChange} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="register-email"><FiMail /> Email Address</label>
                  <input type="email" id="register-email" name="email" placeholder="Enter your email" value={registerData.email} onChange={handleRegisterChange} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="register-fullname"><FiUser /> Full Name</label>
                  <input type="text" id="register-fullname" name="full_name" placeholder="Enter your full name" value={registerData.full_name} onChange={handleRegisterChange} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="register-phone"><FiUser /> Phone Number (optional)</label>
                  <input type="tel" id="register-phone" name="phone_number" placeholder="Enter phone number" value={registerData.phone_number} onChange={handleRegisterChange} disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="register-password"><FiLock /> Password</label>
                  <input type="password" id="register-password" name="password" placeholder="Create a password (min 6 chars)" value={registerData.password} onChange={handleRegisterChange} required minLength="6" disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="register-confirm"><FiLock /> Confirm Password</label>
                  <input type="password" id="register-confirm" name="confirmPassword" placeholder="Confirm your password" value={registerData.confirmPassword} onChange={handleRegisterChange} required disabled={loading} />
                </div>
                <div className="form-options">
                  <label className="terms-check">
                    <input type="checkbox" required /> I agree to the <a href="#">Terms of Service</a> &amp; <a href="#">Privacy Policy</a>
                  </label>
                </div>
                <button type="submit" className="auth-submit-btn register-btn" disabled={loading}>
                  {loading ? 'Creating account...' : <><FiUserPlus /> Create Account</>}
                </button>
                <button type="button" className="auth-google-btn" onClick={() => googleLogin()} disabled={loading}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                  Sign up with Google
                </button>
                <p className="auth-switch-text">
                  Already have an account? <span className="auth-switch-link" onClick={() => switchMode(true)}>Login here</span>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GameZoneHeader;
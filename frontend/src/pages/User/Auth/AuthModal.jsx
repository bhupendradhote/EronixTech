// AuthModal.jsx
import React from 'react';
import Login from './Login';
import Register from './Register';
import './Auth.css';

const AuthModal = ({ isOpen, onClose, authType, setAuthType, onAuthSuccess }) => {
  if (!isOpen) return null;

  // Called by Login or Register after successful authentication
  const handleAuthSuccess = () => {
    if (onAuthSuccess) onAuthSuccess(); // optional parent callback (e.g., refresh page)
    onClose(); // close the modal
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${authType === 'login' ? 'active' : ''}`} 
            onClick={() => setAuthType('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${authType === 'register' ? 'active' : ''}`} 
            onClick={() => setAuthType('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-body">
          {authType === 'login' 
            ? <Login onSuccess={handleAuthSuccess} /> 
            : <Register onSuccess={handleAuthSuccess} />
          }
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
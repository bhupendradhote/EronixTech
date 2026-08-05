import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiSave,
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import gameAuthService from '../../../services/gameAuthService';
import GameZoneLayout from '../../../components/layout/GameZoneLayout';
import '../../GameZone/GamingZone.css';

const GameProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await gameAuthService.getProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone_number: data.phone_number || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (err.response?.status === 401) {
        navigate('/game/login');
      } else {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const response = await fetch('/api/game/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('gameToken')}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');
      setProfile(data.user);
      setSuccess('Profile updated successfully!');
      setFormData({
        full_name: data.user.full_name || '',
        phone_number: data.user.phone_number || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);

    try {
      const response = await fetch('/api/game/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('gameToken')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Password change failed');
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <GameZoneLayout>
      {loading ? (
        <div className="game-profile-loading">
          <div className="loader">Loading profile...</div>
        </div>
      ) : !profile ? (
        <div className="game-profile-error">
          <p>Unable to load profile. Please try again later.</p>
          <button onClick={() => navigate('/gaming-zone')}>Go to Gaming Zone</button>
        </div>
      ) : (
        <div className="game-profile-container">
          <div className="game-profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <span>
                  {profile.full_name
                    ? profile.full_name.charAt(0).toUpperCase()
                    : '?'}
                </span>
              </div>
              <div className="profile-user-info">
                <h2>{profile.full_name}</h2>
                <p className="profile-username">@{profile.username}</p>
                {/* <div className="profile-stats">
                  <span>🪙 {profile.coins || 0} Coins</span>
                  <span>⭐ Level {profile.level || 1}</span>
                </div> */}
              </div>
            </div>

            <div className="profile-sections">
              {/* Update Profile */}
              <div className="profile-section">
                <h3>
                  <FiUser /> Edit Profile
                </h3>
                {error && (
                  <div className="profile-error">
                    <FiAlertCircle /> {error}
                  </div>
                )}
                {success && (
                  <div className="profile-success">
                    <FiCheckCircle /> {success}
                  </div>
                )}
                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-group">
                    <label>
                      <FiUser /> Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FiPhone /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleProfileChange}
                      placeholder="Optional"
                    />
                  </div>
                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={updating}
                  >
                    {updating ? (
                      'Saving...'
                    ) : (
                      <>
                        <FiSave /> Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="profile-section">
                <h3>
                  <FiLock /> Change Password
                </h3>
                {passwordError && (
                  <div className="profile-error">
                    <FiAlertCircle /> {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="profile-success">
                    <FiCheckCircle /> {passwordSuccess}
                  </div>
                )}
                <form onSubmit={handlePasswordSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      'Changing...'
                    ) : (
                      <>
                        <FiLock /> Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </GameZoneLayout>
  );
};

export default GameProfile;
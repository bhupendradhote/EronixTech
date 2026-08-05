import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import addressService from '../../../services/addressService';
import userService from '../../../services/userService';
import AuthModal from '../Auth/AuthModal';
import './Profile.css';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();

  // --- Auth State ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');

  // --- Profile State ---
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    email: '',
    phone_number: ''
  });

  // --- Password State ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

// This forces the UI to look specifically at the flag your backend just sent
const hasPassword = !!userProfile?.has_password;
  // --- Address State ---
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    address_type: 'Home',
    is_default_shipping: false,
    is_default_billing: false,
  });

  const [toast, setToast] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const initializeProfile = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('Please login first to access your profile.', 'error');
        setIsAuthModalOpen(true);
        setProfileLoading(false);
        setAddressLoading(false);
        return;
      }

      await fetchUserProfile();
      await fetchAddresses();
    };

    if (!isAuthModalOpen) {
      initializeProfile();
    }
  }, [isAuthModalOpen]);

  // ==========================================
  // PROFILE HANDLERS
  // ==========================================
  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await userService.getProfile();
      
      if (response && response.user) {
        setUserProfile(response.user);
      } else if (response && response.data) {
        setUserProfile(response.data);
      } else {
        setUserProfile(response); 
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setIsAuthModalOpen(true);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEditProfileClick = () => {
    setProfileFormData({
      full_name: userProfile?.full_name || '',
      email: userProfile?.email || '',
      phone_number: userProfile?.phone_number || ''
    });
    setFormErrors({});
    setIsProfileModalOpen(true);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!profileFormData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!profileFormData.email.trim()) errors.email = 'Email is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await userService.updateProfile(profileFormData);
      showToast(response.message || 'Profile updated successfully');
      setIsProfileModalOpen(false);
      fetchUserProfile(); 
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  // ==========================================
  // PASSWORD HANDLERS
  // ==========================================
  const handlePasswordClick = () => {
    setPasswordFormData({ current_password: '', new_password: '', confirm_password: '' });
    setFormErrors({});
    setIsPasswordModalOpen(true);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    
    // Only validate current_password if they have a password
    if (hasPassword && !passwordFormData.current_password) {
        errors.current_password = 'Current password is required';
    }

    if (!passwordFormData.new_password) {
        errors.new_password = 'New password is required';
    }

    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) return setFormErrors(errors);

    try {
        await userService.changePassword({
            // Send null or undefined if no current password exists
            current_password: hasPassword ? passwordFormData.current_password : null,
            new_password: passwordFormData.new_password
        });
        showToast('Password updated successfully');
        setIsPasswordModalOpen(false);
    } catch (err) {
        showToast(err.response?.data?.message || 'Failed to update password', 'error');
    }
};

  // ==========================================
  // ADDRESS HANDLERS
  // ==========================================
  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const response = await addressService.getUserAddresses();
      
      let dataArray = [];
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response && Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response && response.addresses && Array.isArray(response.addresses)) {
        dataArray = response.addresses;
      }
      
      setAddresses(dataArray);
      setAddressError(null);
    } catch (err) {
      console.error(err);
      setAddressError(err.response?.data?.message || 'Failed to load addresses');
      if (err.response?.status !== 401) {
        showToast('Failed to load addresses', 'error');
      }
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddAddressClick = () => {
    setEditingAddress(null);
    setAddressFormData({
      address_line_1: '', address_line_2: '', city: '', state: '',
      postal_code: '', country: 'India', address_type: 'Home',
      is_default_shipping: false, is_default_billing: false,
    });
    setFormErrors({});
    setIsAddressModalOpen(true);
  };

  const handleEditAddressClick = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      address_line_1: address.address_line_1 || '', address_line_2: address.address_line_2 || '',
      city: address.city || '', state: address.state || '', postal_code: address.postal_code || '',
      country: address.country || 'India', address_type: address.address_type || 'Home',
      is_default_shipping: address.is_default_shipping || false, is_default_billing: address.is_default_billing || false,
    });
    setFormErrors({});
    setIsAddressModalOpen(true);
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!addressFormData.address_line_1.trim()) errors.address_line_1 = 'Address line 1 is required';
    if (!addressFormData.city.trim()) errors.city = 'City is required';
    if (!addressFormData.state.trim()) errors.state = 'State is required';
    if (!addressFormData.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
    } else if (!/^\d{5,6}$/.test(addressFormData.postal_code)) {
      errors.postal_code = 'Postal code must be 5 or 6 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setAddressFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setAddressFormData(prev => ({ ...prev, [name]: value }));
      if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, addressFormData);
        showToast('Address updated successfully');
      } else {
        await addressService.createAddress(addressFormData);
        showToast('Address added successfully');
      }
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      showToast('Address deleted successfully');
      fetchAddresses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete address', 'error');
    }
  };

  const handleSetDefaultShipping = async (address) => {
    if (address.is_default_shipping) return;
    try {
      await addressService.updateAddress(address.id, { is_default_shipping: true });
      showToast('Default shipping address updated');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to update default shipping', 'error');
    }
  };

  const handleSetDefaultBilling = async (address) => {
    if (address.is_default_billing) return;
    try {
      await addressService.updateAddress(address.id, { is_default_billing: true });
      showToast('Default billing address updated');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to update default billing', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showToast('Logged out successfully');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleModalClose = () => {
    setIsAuthModalOpen(false);
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  };

  const AddressSkeleton = () => (
    <div className="address-skeleton">
      <div className="skeleton-line" style={{ width: '30%', marginBottom: '20px' }}></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
    </div>
  );

  return (
    <Layout>
      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={handleModalClose} 
          authType={authType}
          setAuthType={setAuthType}
        />
      )}

      <div className="dashboard-wrapper">
        <aside className="sidebar-col">
          <div className="profile-card">
            <div className="profile-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="profile-info">
              <span className="greeting">Name</span>
              <span className="name">
                {profileLoading ? 'Loading...' : (userProfile?.full_name || 'Guest User')}
              </span>
            </div>
          </div>

          <div className="coins-card">
            <div className="coins-left">
              <div className="coin-icon">₹</div>
              <div className="coins-info">
                <span className="label">Balance</span>
                <span className="balance">20 EronixTech Coins</span>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          <nav className="sidebar-nav">
            <Link to="/address" className="nav-item active">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              My Address
            </Link>
            <Link to="/orders" className="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              My Orders
            </Link>
            <Link to="/rfq" className="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              My RFQ's
            </Link>
            <Link to="/business-details" className="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              My Business Details
            </Link>
            <Link to="/wishlist" className="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              My Wishlist
            </Link>
          </nav>
        </aside>

        <main className="dashboard-content">
          <div className="breadcrumb">
            <Link to="/">Home</Link> &gt; <span>My Profile</span>
          </div>
          <h1 className="dashboard-header">My Profile</h1>

          <div className="profile-details-card">
            <div className="profile-field-row">
              <div className="profile-field-info">
                <span className="profile-field-label">Full Name*</span>
                <span className="profile-field-value">
                  {profileLoading ? 'Loading...' : (userProfile?.full_name || 'Not provided')}
                </span>
              </div>
              <button className="btn-edit-action" onClick={handleEditProfileClick}>EDIT NAME</button>
            </div>
            <div className="profile-field-row">
              <div className="profile-field-info">
                <span className="profile-field-label">Email ID*</span>
                <span className="profile-field-value">
                  {profileLoading ? 'Loading...' : (userProfile?.email || 'Not provided')}
                </span>
              </div>
              <button className="btn-edit-action" onClick={handleEditProfileClick}>EDIT EMAIL ID</button>
            </div>
            <div className="profile-field-row">
              <div className="profile-field-info">
                <span className="profile-field-label">Mobile Number</span>
                <span className="profile-field-value" style={!userProfile?.phone_number ? { color: '#9ca3af', fontStyle: 'italic' } : {}}>
                  {profileLoading ? 'Loading...' : (userProfile?.phone_number || 'Not provided')}
                </span>
              </div>
              <button className="btn-edit-action" onClick={handleEditProfileClick}>EDIT PHONE</button>
            </div>
          </div>

          <div className="address-section">
            <div className="address-header">
              <h2 className="section-title">My Addresses</h2>
              <button className="btn-add-address" onClick={handleAddAddressClick}>
                + Add New Address
              </button>
            </div>

            {addressLoading ? (
              <div className="skeleton-container">
                <AddressSkeleton />
                <AddressSkeleton />
              </div>
            ) : addressError ? (
              <div className="error-state">
                <p className="error-message" style={{fontSize: '16px'}}>{addressError}</p>
                <button onClick={fetchAddresses} className="btn-retry">Retry</button>
              </div>
            ) : addresses.length === 0 ? (
              <div className="empty-address-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <p>No addresses saved yet</p>
                <button className="btn-add-address" onClick={handleAddAddressClick}>Add your first address</button>
              </div>
            ) : (
              <div className="address-grid">
                {addresses.map(addr => (
                  <div key={addr.id} className="address-card">
                    <div className="address-card-header">
                      <span className="address-type-badge">{addr.address_type || 'Home'}</span>
                      <div className="address-card-actions">
                        <button className="icon-btn edit" onClick={() => handleEditAddressClick(addr)} title="Edit">✎</button>
                        <button className="icon-btn delete" onClick={() => handleDeleteAddress(addr.id)} title="Delete">🗑</button>
                      </div>
                    </div>
                    <div className="address-card-body">
                      <p className="address-line"><strong>{addr.address_line_1}</strong></p>
                      {addr.address_line_2 && <p className="address-line">{addr.address_line_2}</p>}
                      <p className="address-line">{addr.city}, {addr.state} {addr.postal_code}</p>
                      <p className="address-line">{addr.country}</p>
                    </div>
                    <div className="address-card-footer">
                      <div className="default-badges">
                        {addr.is_default_shipping && <span className="default-badge shipping">Default Shipping</span>}
                        {addr.is_default_billing && <span className="default-badge billing">Default Billing</span>}
                      </div>
                      <div className="default-actions">
                        {!addr.is_default_shipping && (
                          <button className="btn-set-default" onClick={() => handleSetDefaultShipping(addr)}>Set as Shipping</button>
                        )}
                        {!addr.is_default_billing && (
                          <button className="btn-set-default" onClick={() => handleSetDefaultBilling(addr)}>Set as Billing</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="action-card" onClick={handlePasswordClick} style={{ cursor: 'pointer' }}>
            <div className="action-card-left">
              <span>{hasPassword ? 'Change Password' : 'Set Password'}</span>
            </div>
            <button className="btn-action-text" onClick={(e) => { e.stopPropagation(); handlePasswordClick(); }}>
              {hasPassword ? 'CHANGE PASSWORD' : 'SET PASSWORD'}
            </button>
          </div>
          
          <div className="action-card" onClick={handleLogout} style={{ marginTop: '8px', cursor: 'pointer' }}>
            <div className="action-card-left">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for User Profile Update */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <label style={{ fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Full Name *</label>
                <input
                  name="full_name"
                  placeholder="Full Name"
                  value={profileFormData.full_name}
                  onChange={handleProfileInputChange}
                  className={formErrors.full_name ? 'error' : ''}
                />
                {formErrors.full_name && <span className="error-message">{formErrors.full_name}</span>}
              </div>
              <div className="form-row">
                <label style={{ fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Email Address *</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={profileFormData.email}
                  onChange={handleProfileInputChange}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              <div className="form-row">
                <label style={{ fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Phone Number</label>
                <input
                  name="phone_number"
                  placeholder="Phone Number"
                  value={profileFormData.phone_number}
                  onChange={handleProfileInputChange}
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                <button type="submit">Update Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Change/Set Password */}
      {isPasswordModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{hasPassword ? 'Change Password' : 'Set Password'}</h2>
            
            {!hasPassword && (
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px' }}>
                You logged in using Google and don't have a password yet. Set one here.
              </p>
            )}

            <form onSubmit={handlePasswordSubmit}>
              {/* Only show Current Password if they actually have one */}
              {hasPassword && (
                <div className="form-row">
                  <label style={{ fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Current Password *</label>
                  <input 
                    type="password" 
                    name="current_password" 
                    placeholder="Enter current password" 
                    value={passwordFormData.current_password} 
                    onChange={handlePasswordInputChange} 
                    className={formErrors.current_password ? 'error' : ''} 
                  />
                  {formErrors.current_password && <span className="error-message">{formErrors.current_password}</span>}
                </div>
              )}
              
              <div className="form-row">
                <label style={{ fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>New Password *</label>
                <input 
                  type="password" 
                  name="new_password" 
                  placeholder={hasPassword ? "Enter new password" : "Create password"} 
                  value={passwordFormData.new_password} 
                  onChange={handlePasswordInputChange} 
                  className={formErrors.new_password ? 'error' : ''} 
                />
                {formErrors.new_password && <span className="error-message">{formErrors.new_password}</span>}
              </div>
              <div className="form-row">
                <label style={{ fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Confirm New Password *</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  placeholder={hasPassword ? "Confirm new password" : "Confirm created password"} 
                  value={passwordFormData.confirm_password} 
                  onChange={handlePasswordInputChange} 
                  className={formErrors.confirm_password ? 'error' : ''} 
                />
                {formErrors.confirm_password && <span className="error-message">{formErrors.confirm_password}</span>}
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                <button type="submit">{hasPassword ? 'Change Password' : 'Set Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Address Form */}
      {isAddressModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-row">
                <input name="address_line_1" placeholder="Address Line 1 *" value={addressFormData.address_line_1} onChange={handleAddressInputChange} className={formErrors.address_line_1 ? 'error' : ''} />
                {formErrors.address_line_1 && <span className="error-message">{formErrors.address_line_1}</span>}
              </div>
              <div className="form-row">
                <input name="address_line_2" placeholder="Address Line 2 (optional)" value={addressFormData.address_line_2 || ''} onChange={handleAddressInputChange} />
              </div>
              <div className="form-row">
                <input name="city" placeholder="City *" value={addressFormData.city} onChange={handleAddressInputChange} className={formErrors.city ? 'error' : ''} />
                {formErrors.city && <span className="error-message">{formErrors.city}</span>}
              </div>
              <div className="form-row">
                <input name="state" placeholder="State *" value={addressFormData.state} onChange={handleAddressInputChange} className={formErrors.state ? 'error' : ''} />
                {formErrors.state && <span className="error-message">{formErrors.state}</span>}
              </div>
              <div className="form-row">
                <input name="postal_code" placeholder="Postal Code *" value={addressFormData.postal_code} onChange={handleAddressInputChange} className={formErrors.postal_code ? 'error' : ''} />
                {formErrors.postal_code && <span className="error-message">{formErrors.postal_code}</span>}
              </div>
              <div className="form-row">
                <input name="country" placeholder="Country" value={addressFormData.country} onChange={handleAddressInputChange} />
              </div>
              <div className="form-row">
                <select name="address_type" value={addressFormData.address_type} onChange={handleAddressInputChange}>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-row checkbox-row">
                <label>
                  <input type="checkbox" name="is_default_shipping" checked={addressFormData.is_default_shipping} onChange={handleAddressInputChange} />
                  Set as default shipping address
                </label>
              </div>
              <div className="form-row checkbox-row">
                <label>
                  <input type="checkbox" name="is_default_billing" checked={addressFormData.is_default_billing} onChange={handleAddressInputChange} />
                  Set as default billing address
                </label>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setIsAddressModalOpen(false)}>Cancel</button>
                <button type="submit">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </Layout>
  );
};

export default Profile;
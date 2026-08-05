import React, { useState, useRef, useEffect } from 'react';
// Added FiPlayCircle for the gaming button
import { FiMenu, FiSearch, FiMessageSquare, FiBell, FiChevronDown, FiUser, FiLogOut, FiSettings, FiPlayCircle } from 'react-icons/fi';
import adminAuthService from '../../services/adminAuthService'; 
import './AdminHeader.css';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ toggleSidebar }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
const navigate = useNavigate();
  
  const [adminUser, setAdminUser] = useState({ full_name: 'Admin' }); 
  const menuRef = useRef(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminInfo');
    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    adminAuthService.logout(); 
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <h1>Dashboard</h1>
      </div>
      
      <div className="header-right" ref={menuRef}>
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search stock, order, etc..." />
        </div>

        {/* --- NEW GAME ZONE BUTTON --- */}
<button className="game-zone-btn" onClick={() => navigate('/admin/game-zone')}>
  <FiPlayCircle className="game-icon" />
  <span>Game Zone</span>
</button>
        {/* ---------------------------- */}
        
        <div className="dropdown-container">
          <div className="user-profile" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
            <div className="user-info">
              <span className="user-name">{adminUser.full_name || 'Admin User'}</span>
              <span className="user-role">Admin</span>
            </div>
            <FiChevronDown className="chevron" />
          </div>
          
          {profileOpen && (
            <div className="dropdown-menu profile-menu">
              <div className="dropdown-item"><FiUser className="dd-icon"/> My Profile</div>
              <div className="dropdown-item"><FiSettings className="dd-icon"/> Account Settings</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item danger" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <FiLogOut className="dd-icon"/> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiGrid,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiCpu,
  FiBox,
  FiTag,       // for rates
  FiMonitor,   // for devices
  FiShoppingCart,
  FiFileText,
} from 'react-icons/fi';
import adminAuthService from '../../services/adminAuthService';
import './AdminGameZoneSidebar.css';

const AdminGameZoneSidebar = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('admin'); // default to admin

  useEffect(() => {
    // Get user info from localStorage (or from service)
    const userInfo = adminAuthService.getUserInfo();
    if (userInfo) {
      setUserType(userInfo.userType);
    }
  }, []);

  // Define all menu items
  const allMenuItems = [
    { path: '/admin/game-zone', label: 'Dashboard', icon: <FiHome /> },
    { path: '/admin/game-zone/games', label: 'Games', icon: <FiGrid /> },
    { path: '/admin/game-zone/quick-buttons', label: 'Quick Buttons', icon: <FiBox /> },
    { path: '/admin/game-zone/salespersons', label: 'Salespersons', icon: <FiUsers /> },
    { path: '/admin/game-zone/game-rates', label: 'Game Rates', icon: <FiTag /> },
    { path: '/admin/game-zone/game-devices', label: 'Game Devices', icon: <FiMonitor /> },
    { path: '/admin/game-zone/tournaments', label: 'Tournaments', icon: <FiCalendar /> },
    { path: '/admin/game-zone/pos', label: 'POS', icon: <FiShoppingCart /> },
    { path: '/admin/game-zone/sales-history', label: 'Sales History', icon: <FiFileText /> },
    { path: '/admin/game-zone/players', label: 'Players', icon: <FiUsers /> },

  ];

  // Filter menu items based on user type
  const menuItems = allMenuItems.filter((item) => {
    // Hide Sales History for salespersons
    if (userType === 'salesperson' && item.path === '/admin/game-zone/sales-history') {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login');
  };

  return (
    <aside className="gz-sidebar">
      <div className="gz-sidebar-brand">
        <FiCpu className="gz-brand-icon" />
        <span>GameZone</span>
      </div>

      <nav className="gz-sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `gz-sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="gz-sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Optional: Logout button at bottom */}
      <div className="gz-sidebar-footer">
        <button onClick={handleLogout} className="gz-logout-btn">
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminGameZoneSidebar;
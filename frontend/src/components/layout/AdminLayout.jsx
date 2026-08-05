import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../common/AdminSidebar';
import AdminHeader from '../common/AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isSidebarCollapsed} />
      <div className="admin-main">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <div className="admin-content">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
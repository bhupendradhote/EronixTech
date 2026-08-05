// src/components/layout/AdminGameZoneLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';  // <-- import Outlet
import AdminGameZoneSidebar from '../common/AdminGameZoneSidebar';
import AdminGameZoneHeader from '../common/AdminGameZoneHeader';
import './AdminGameZoneLayout.css';

const AdminGameZoneLayout = () => {
  return (
    <div className="gz-layout">
      <AdminGameZoneSidebar />
      <div className="gz-main">
        <AdminGameZoneHeader />
        <main className="gz-content">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default AdminGameZoneLayout;
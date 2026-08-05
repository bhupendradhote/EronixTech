import React from 'react';
import { Link } from 'react-router-dom'; // or use <a href="/admin"> if not using React Router
import './AdminGameZoneHeader.css';

const AdminGameZoneHeader = () => {
  return (
    <header className="gz-header-bar">
      <div className="gz-header-left">
        <h2 className="gz-header-title">Game Zone Admin</h2>
      </div>

      <div className="gz-header-right">
        {/* Ecommerce Admin Button */}
        <Link to="/admin" className="gz-ecommerce-btn">
          Ecommerce Admin
        </Link>
      </div>
    </header>
  );
};

export default AdminGameZoneHeader;
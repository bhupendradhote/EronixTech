import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiFileText,
  FiPercent,
  FiSettings,
  FiImage,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
  FiStar,
  FiCpu,
  FiBookmark // 👈 NEW – icon for Pre-Bookings
} from 'react-icons/fi';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const [mastersOpen, setMastersOpen] = useState(true);
  const [buildPcOpen, setBuildPcOpen] = useState(true);

  const isActive = (path) =>
    location.pathname === path ? 'active' : '';

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="admin-brand">
        <div className="brand-logo">
          <FiGrid className="logo-icon" />
        </div>
        <h2 className="brand-text">EzMart</h2>
      </div>

      <nav className="admin-nav">
        <ul>
          {/* Dashboard */}
          <li title="Dashboard">
            <Link to="/admin" className={isActive('/admin')}>
              <FiGrid className="nav-icon" />
              <span className="link-text">Dashboard</span>
            </Link>
          </li>

          {/* General Masters Dropdown */}
          <li className="sidebar-dropdown">
            <button
              type="button"
              className={`sidebar-dropdown-btn ${
                mastersOpen ? 'dropdown-active' : ''
              }`}
              onClick={() => setMastersOpen(!mastersOpen)}
            >
              <div className="dropdown-left">
                <FiLayers className="nav-icon" />
                <span className="link-text">Masters</span>
              </div>

              {!isCollapsed && (
                mastersOpen ? (
                  <FiChevronDown className="dropdown-arrow" />
                ) : (
                  <FiChevronRight className="dropdown-arrow" />
                )
              )}
            </button>

            {mastersOpen && !isCollapsed && (
              <ul className="submenu">
                <li>
                  <Link
                    to="/admin/categories"
                    className={isActive('/admin/categories')}
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/sub-categories"
                    className={isActive('/admin/sub-categories')}
                  >
                    Sub-Categories
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/brands"
                    className={isActive('/admin/brands')}
                  >
                    Brands
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/coupons"
                    className={isActive('/admin/coupons')}
                  >
                    Coupons
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Build PC Dropdown */}
          <li className="sidebar-dropdown">
            <button
              type="button"
              className={`sidebar-dropdown-btn ${
                buildPcOpen ? 'dropdown-active' : ''
              }`}
              onClick={() => setBuildPcOpen(!buildPcOpen)}
            >
              <div className="dropdown-left">
                <FiCpu className="nav-icon" />
                <span className="link-text">Build PC</span>
              </div>

              {!isCollapsed && (
                buildPcOpen ? (
                  <FiChevronDown className="dropdown-arrow" />
                ) : (
                  <FiChevronRight className="dropdown-arrow" />
                )
              )}
            </button>

            {buildPcOpen && !isCollapsed && (
              <ul className="submenu">
                <li>
                  <Link
                    to="/admin/build-pc-categories"
                    className={isActive('/admin/build-pc-categories')}
                  >
                    Main Categories
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/build-pc-sub-categories"
                    className={isActive('/admin/build-pc-sub-categories')}
                  >
                    Sub-Categories
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/build-pc-sub-sub-categories"
                    className={isActive('/admin/build-pc-sub-sub-categories')}
                  >
                    Sub-Sub-Categories
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li title="Orders">
            <Link
              to="/admin/orders"
              className={isActive('/admin/orders')}
            >
              <FiShoppingCart className="nav-icon" />
              <span className="link-text">Orders</span>
            </Link>
          </li>

          <li title="Products">
            <Link
              to="/admin/products"
              className={isActive('/admin/products')}
            >
              <FiBox className="nav-icon" />
              <span className="link-text">Products</span>
            </Link>
          </li>

          <li title="Reviews">
            <Link
              to="/admin/reviews"
              className={isActive('/admin/reviews')}
            >
              <FiStar className="nav-icon" />
              <span className="link-text">Reviews</span>
            </Link>
          </li>

          <li title="Customers">
            <Link
              to="/admin/customers"
              className={isActive('/admin/customers')}
            >
              <FiUsers className="nav-icon" />
              <span className="link-text">Customers</span>
            </Link>
          </li>

          {/* 👇 NEW: Pre-Bookings */}
          <li title="Pre-Bookings">
            <Link
              to="/admin/prebookings"
              className={isActive('/admin/prebookings')}
            >
              <FiBookmark className="nav-icon" />
              <span className="link-text">Pre-Bookings</span>
            </Link>
          </li>

          <li title="Banners">
            <Link
              to="/admin/banners"
              className={isActive('/admin/banners')}
            >
              <FiImage className="nav-icon" />
              <span className="link-text">Banners</span>
            </Link>
          </li>
        </ul>

        <div className="nav-divider"></div>

        <ul>
          {/* Settings (commented out as before) */}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
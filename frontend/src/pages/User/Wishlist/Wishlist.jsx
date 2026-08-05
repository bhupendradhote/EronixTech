import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import Layout from '../../../components/layout/Layout';
import wishlistService from '../../../services/wishlistService';
import userService from '../../../services/userService';
import cartService from '../../../services/cartService';
import reviewService from '../../../services/reviewService';
import AuthModal from '../Auth/AuthModal';
import './Wishlist.css';

// Reusable Toast Component
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

const Wishlist = () => {
  const navigate = useNavigate();

  // --- Auth State ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');

  // --- Data State ---
  const [userProfile, setUserProfile] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [ratingStats, setRatingStats] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // --- Fetch Data on Mount ---
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        showToast('Please login to view your wishlist.', 'error');
        setIsAuthModalOpen(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const profileRes = await userService.getProfile();
        const profileData = profileRes?.user || profileRes?.data || profileRes;
        setUserProfile(profileData);

        const wishlistData = await wishlistService.getWishlist();
        setWishlistItems(wishlistData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.response?.data?.message || 'Failed to load your wishlist.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setIsAuthModalOpen(true);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthModalOpen) {
      fetchAllData();
    }
  }, [isAuthModalOpen]);

  // --- Fetch Ratings Data in Background ---
  useEffect(() => {
    if (wishlistItems.length > 0) {
      const fetchRatings = async () => {
        const statsMap = {};
        await Promise.all(
          wishlistItems.map(async (product) => {
            try {
              const stats = await reviewService.getReviewStats(product.id);
              statsMap[product.id] = stats;
            } catch (err) {
              console.warn(`Failed to fetch stats for product ${product.id}`);
              statsMap[product.id] = { averageRating: 0, totalReviews: 0 };
            }
          })
        );
        setRatingStats(statsMap);
      };
      fetchRatings();
    }
  }, [wishlistItems]);

  // --- Handlers ---
  const handleRemoveFromWishlist = async (productId) => {
    const previousItems = [...wishlistItems];
    setWishlistItems(wishlistItems.filter((item) => item.id !== productId));

    try {
      await wishlistService.removeFromWishlist(productId);
      showToast('Item removed from wishlist');
    } catch (err) {
      console.error(err);
      setWishlistItems(previousItems);
      showToast('Failed to remove item. Please try again.', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await cartService.addToCart(product.id, 1);
      showToast(`${product.name} added to cart! 🛒`);
      // Optionally remove from wishlist after adding to cart:
      // handleRemoveFromWishlist(product.id);
    } catch (error) {
      console.error('Cart API Error:', error);
      if (error.response?.status === 401) {
        setIsAuthModalOpen(true);
      } else {
        const errorMessage = error.response?.data?.message || 'Error adding to cart.';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleModalClose = () => {
    setIsAuthModalOpen(false);
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  };

  // Fallback for empty wishlist image
  const EmptyImageFallback = () => (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="#f3f4f6" />
      <path d="M100 40C66.863 40 40 66.863 40 100s26.863 60 60 60 60-26.863 60-60-26.863-60-60-60zm0 110c-27.614 0-50-22.386-50-50s22.386-50 50-50 50 22.386 50 50-22.386 50-50 50z" fill="#d1d5db" />
      <path d="M100 70c-16.569 0-30 13.431-30 30s13.431 30 30 30 30-13.431 30-30-13.431-30-30-30zm0 50c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z" fill="#9ca3af" />
      <path d="M100 130c-16.569 0-30-13.431-30-30s13.431-30 30-30 30 13.431 30 30-13.431 30-30 30zm0-50c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20z" fill="#6b7280" />
      <path d="M100 150c-27.614 0-50-22.386-50-50s22.386-50 50-50 50 22.386 50 50-22.386 50-50 50z" stroke="#e5e7eb" strokeWidth="4" />
    </svg>
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

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="dashboard-wrapper">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar-col">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="profile-info">
              <span className="greeting">Name</span>
              <span className="name">{userProfile?.full_name || 'Guest User'}</span>
            </div>
          </div>

          {/* Mogli Coins Card */}
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

          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            <Link to="/address" className="nav-item">
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

            <Link to="/wishlist" className="nav-item active">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              My Wishlist
            </Link>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-content">
          <div className="breadcrumb">
            <Link to="/">Home</Link> &gt; <span>My Wishlist</span>
          </div>

          <h1 className="dashboard-header">
            My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'})
          </h1>

          {/* LOADING STATE */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading your favorite items...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px' }}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-start-shopping" style={{ marginTop: '10px' }}>
                Retry
              </button>
            </div>
          )}

          {/* EMPTY STATE - FIXED IMAGE */}
          {!loading && !error && wishlistItems.length === 0 && (
            <div className="empty-wishlist-card">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2748/2748613.png"
                alt="Empty Wishlist"
                className="empty-illustration"
                onError={(e) => {
                  // Fallback to inline SVG if image fails to load
                  e.target.style.display = 'none';
                  e.target.parentElement.appendChild(
                    document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                  );
                  // Better: use a fallback component
                }}
              />
              {/* Fallback SVG if image fails */}
              <div className="empty-image-fallback" style={{ display: 'none' }}>
                <EmptyImageFallback />
              </div>
              <h3>Your Wishlist is empty!</h3>
              <p>Explore more & shortlist your favourite items.<br />Review them anytime and add to cart</p>
              <Link to="/">
                <button className="btn-start-shopping">Start Shopping</button>
              </Link>
            </div>
          )}

          {/* POPULATED WISHLIST GRID */}
          {!loading && !error && wishlistItems.length > 0 && (
            <div className="wishlist-grid">
              {wishlistItems.map((product) => {
                const discountPercent = product.mrp
                  ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
                  : 0;
                const isInStock = product.stock_status === 'in_stock' && product.stock_quantity > 0;
                const mainImage =
                  product.images && product.images.length > 0
                    ? product.images[0].image_path
                    : 'https://via.placeholder.com/200';

                const stats = ratingStats[product.id];

                return (
                  <div key={product.id} className="wishlist-card">
                    <button
                      className="btn-remove-wishlist"
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      title="Remove from Wishlist"
                    >
                      <FiTrash2 />
                    </button>

                    <Link to={`/product/${product.slug || product.id}`} className="wishlist-image" style={{ display: 'block' }}>
                      <img src={mainImage} alt={product.name} />
                      {discountPercent > 0 && <span className="wishlist-badge">-{discountPercent}%</span>}
                      {!isInStock && <span className="wishlist-badge out-of-stock">Out of Stock</span>}
                    </Link>

                    <div className="wishlist-details">
                      <Link to={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 className="wishlist-title">{product.name}</h3>
                      </Link>

                      <div style={{ padding: '4px 0', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span
                          style={{
                            background: '#16a34a',
                            color: '#fff',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          {stats ? (stats.averageRating > 0 ? stats.averageRating : 'New') : '...'} ★
                        </span>
                        <span>({stats?.totalReviews || 0} Reviews)</span>
                      </div>

                      <div className="wishlist-pricing">
                        <span className="price-selling">₹{product.selling_price?.toLocaleString()}</span>
                        {product.mrp > product.selling_price && (
                          <span className="price-mrp">₹{product.mrp?.toLocaleString()}</span>
                        )}
                      </div>

                      <button
                        className="btn-add-to-cart"
                        disabled={!isInStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        <FiShoppingCart style={{ marginRight: '8px' }} />
                        {isInStock ? 'Move to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default Wishlist;
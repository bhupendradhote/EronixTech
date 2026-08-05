import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiX } from 'react-icons/fi';
import Layout from '../../../components/layout/Layout';
import searchService from '../../../services/searchService';
import cartService from '../../../services/cartService';
import wishlistService from '../../../services/wishlistService';
import reviewService from '../../../services/reviewService'; 
import AuthModal from '../../User/Auth/AuthModal';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({}); // Added Review Stats State
  
  // Auth and Toast states for integrated functionality
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query) {
          const results = await searchService.searchProducts(query);
          setProducts(results || []);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  // Sync wishlist status
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const items = await wishlistService.getWishlist();
        setWishlist(items.map(i => i.id));
      }
    };
    fetchWishlist();
  }, []);

  // --- Fetch Ratings Data in Background ---
  useEffect(() => {
    if (products.length > 0) {
      const fetchRatings = async () => {
        const statsMap = {};
        await Promise.all(
          products.map(async (product) => {
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
  }, [products]);

  const handleAddToCart = async (productId) => {
    if (!localStorage.getItem('token')) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await cartService.addToCart(productId, 1);
      alert('Added to cart!');
    } catch (err) {
      alert('Error adding to cart');
    }
  };

  const toggleWishlist = async (productId) => {
    if (!localStorage.getItem('token')) {
      setIsAuthModalOpen(true);
      return;
    }
    const isWishlisted = wishlist.includes(productId);
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(productId);
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        await wishlistService.addToWishlist(productId);
        setWishlist(prev => [...prev, productId]);
      }
    } catch (err) {
      alert('Error updating wishlist');
    }
  };

  return (
    <Layout>
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
      
      <div className="search-page-container">
        <div className="container">
          <div className="search-header">
            <h2>Search Results for: <span>"{query}"</span></h2>
            <p>{!loading && `${products.length} product(s) found`}</p>
          </div>
          
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p>Searching our inventory...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map(p => {
                const isWishlisted = wishlist.includes(p.id);
                const stats = ratingStats[p.id]; // Get dynamically fetched stats

                return (
                  <div key={p.id} className="product-card" style={{ position: 'relative' }}>
                    
                    {/* Clickable Card Area -> Redirects to Product Details */}
                    <Link 
                      to={`/product/${p.slug || p.id}`} 
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                      <img 
                        src={p.images?.[0]?.image_path || 'https://via.placeholder.com/200'} 
                        alt={p.name} 
                        style={{ width: '100%', objectFit: 'contain', height: '200px' }}
                      />
                      <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '10px' }}>
                        {p.name}
                      </h3>

                      {/* Fetched Rating rendering for Search Results Card */}
                      <div style={{ padding: '4px 0', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span style={{ background: '#16a34a', color: '#fff', padding: '2px 4px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          {stats ? (stats.averageRating > 0 ? stats.averageRating : 'New') : '...'} ★
                        </span>
                        <span>({stats?.totalReviews || 0} Reviews)</span>
                      </div>

                      <div className="price-row" style={{ marginTop: '8px' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '16px' }}>₹{Number(p.selling_price).toLocaleString()}</p>
                        {p.mrp > p.selling_price && (
                          <del style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>
                            ₹{Number(p.mrp).toLocaleString()}
                          </del>
                        )}
                      </div>
                    </Link>
                    
                    {/* Action Buttons (Separated to prevent triggering the link) */}
                    <div className="product-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button 
                        className="btn-view" 
                        onClick={(e) => {
                          e.preventDefault(); 
                          e.stopPropagation();
                          handleAddToCart(p.id);
                        }} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <FiShoppingCart /> Add
                      </button>
                      
                      <button 
                        className={`btn-wish ${isWishlisted ? 'active' : ''}`} 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          padding: '10px',
                          color: isWishlisted ? '#e62e04' : '#555' 
                        }}
                        title="Wishlist"
                      >
                        <FiHeart fill={isWishlisted ? "#e62e04" : "none"} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results-box">
              <FiX size={48} color="#ef4444" />
              <h3>No products match "{query}"</h3>
              <p>Try searching for a simpler term (e.g., "Drill" instead of "Hammer Impact Drill").</p>
              <div style={{ marginTop: '20px' }}>
                <Link to="/" className="btn-primary" style={{ marginRight: '10px' }}>Go Home</Link>
                <Link to="/category/all" className="btn-outline">Browse All Categories</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
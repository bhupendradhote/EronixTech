import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

// Wrap Layout Component
import Layout from '../../../components/layout/Layout';

// Components & Modals
import HeroBanner from './HeroBanner';
import AuthModal from '../../User/Auth/AuthModal';
import CompareBar from '../../../components/CompareBar/CompareBar'; // 👈 ADDED

// API Services
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import brandService from '../../../services/brandService';
import bannerService from '../../../services/bannerService';
import cartService from '../../../services/cartService';
import wishlistService from '../../../services/wishlistService';
import reviewService from '../../../services/reviewService';

// Compare Hook – now from context
import { useCompare } from '../../../context/CompareContext'; // ✅ FIXED

// Fallback Images
import defaultImg from '../../../assets/images/products/pr1.png';
import goldBanner from '../../../assets/images/Gold-Banner-desktop.webp';
import cellbellGif from '../../../assets/images/CELLBELL-desktop.gif';
import mezoniteGold from '../../../assets/images/Mezonite-Gold-desktop.webp';
import bannerAndDeal from '../../../assets/images/Bannerndeal.webp';

// --- Reusable Toast Component ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px',
      backgroundColor: type === 'error' ? '#ef4444' : '#333',
      color: '#fff', padding: '12px 24px', borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>×</button>
    </div>
  );
};

// --- SVG Icons ---
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const LightningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
);

const CompareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="11 17 7 21 3 17"></polyline>
    <line x1="7" y1="21" x2="7" y2="9"></line>
    <polyline points="13 7 17 3 21 7"></polyline>
    <line x1="17" y1="3" x2="17" y2="15"></line>
  </svg>
);

const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const RefreshIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"></polyline>
    <polyline points="23 20 23 14 17 14"></polyline>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);


function Home() {
  const navigate = useNavigate();
  const { addToCompare } = useCompare();   // 👈 Compare hook from context

  // --- Dynamic State ---
  const [data, setData] = useState({
    products: [],
    categories: [],
    brands: [],
    banners: []
  });
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({});

  // --- Auth & Action State ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // --- Fetch Wishlist ---
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const items = await wishlistService.getWishlist();
        setWishlist(items.map(item => item.id));
      } catch (err) {
        console.warn('Failed to load wishlist', err);
      }
    };
    fetchUserWishlist();
  }, [isAuthModalOpen]);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      
      const safeFetch = async (promise) => {
        try { return await promise; } 
        catch (err) { console.error("API Fetch Error:", err); return []; }
      };

      const [productsRes, categoriesRes, brandsRes, bannersRes] = await Promise.all([
        safeFetch(productService.getAllProducts({ activeOnly: true })),
        safeFetch(categoryService.getAllCategories(true, true)), 
        safeFetch(brandService.getAllBrands(true)),
        safeFetch(bannerService.getAllBanners(true))
      ]);

      setData({
        products: productsRes,
        categories: categoriesRes,
        brands: brandsRes,
        banners: bannersRes
      });
      
      setLoading(false);
    };

    fetchHomeData();
  }, []);

  // --- Fetch Ratings Data ---
  useEffect(() => {
    if (data.products.length > 0) {
      const fetchRatings = async () => {
        const statsMap = {};
        await Promise.all(
          data.products.map(async (product) => {
            try {
              const stats = await reviewService.getReviewStats(product.id);
              statsMap[product.id] = stats;
            } catch (err) {
              statsMap[product.id] = { averageRating: 0, totalReviews: 0 };
            }
          })
        );
        setRatingStats(statsMap);
      };
      fetchRatings();
    }
  }, [data.products]);

 const API_URL = "http://localhost:5000";

const getProductImage = (product) => {
  try {
    let images = product.images;

    // Parse JSON string if needed
    if (typeof images === "string") {
      images = JSON.parse(images);
    }

    if (!Array.isArray(images) || images.length === 0) {
      return defaultImg;
    }

    const primary =
      images.find((img) => img.is_primary) || images[0];

    if (!primary?.image_path) {
      return defaultImg;
    }

    // Already a full URL
    if (
      primary.image_path.startsWith("http://") ||
      primary.image_path.startsWith("https://")
    ) {
      return primary.image_path;
    }

    return `${API_URL}/${primary.image_path.replace(/^\/+/, "")}`;
  } catch (err) {
    console.error("Image Error:", err);
    return defaultImg;
  }
}; 

  const calculateDiscount = (mrp, sellingPrice) => {
    if (!mrp || !sellingPrice || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };

  // --- Action Handlers ---
  const handleAddToCart = async (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (product.stock_status === 'out_of_stock') return;
    if (!localStorage.getItem('token')) return setIsAuthModalOpen(true);
    
    try {
      await cartService.addToCart(product.id, 1);
      showToast(`${product.name} added to cart! 🛒`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding to cart', 'error');
    }
  };

  const handleBuyNow = async (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (product.stock_status === 'out_of_stock') return;
    if (!localStorage.getItem('token')) return setIsAuthModalOpen(true);

    try {
      await cartService.addToCart(product.id, 1);
      navigate('/cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing Buy Now', 'error');
    }
  };

  const handleAddToWishlist = async (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!localStorage.getItem('token')) return setIsAuthModalOpen(true);

    const isWishlisted = wishlist.includes(product.id);
    
    setWishlist(prev => isWishlisted ? prev.filter(id => id !== product.id) : [...prev, product.id]);

    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product.id);
        showToast('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(product.id);
        showToast('Added to wishlist ❤️');
      }
    } catch (error) {
      setWishlist(prev => isWishlisted ? [...prev, product.id] : prev.filter(id => id !== product.id));
      showToast('Failed to update wishlist', 'error');
    }
  };

  // 👈 Add to Compare Handler (uses context)
  const handleAddToCompare = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!localStorage.getItem('token')) return setIsAuthModalOpen(true);

    try {
      await addToCompare(product.id);
      showToast(`${product.name} added to compare!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add to compare';
      showToast(msg, 'error');
    }
  };

  // --- Slider Scroll Function ---
  const scrollContainer = (id, direction) => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = 320; 
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // --- Filtering (ONLY ACTIVE PRODUCTS) ---
  const activeProducts = data.products.filter(p => p.status === 'active');
  const heroBanners = data.banners.filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'hero').sort((a, b) => a.display_order - b.display_order);
  const miniBanners = data.banners.filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'mini').slice(0, 4);
  const promoBanners = data.banners.filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'promo').slice(0, 3);
  
  const bestsellers = activeProducts.filter(p => p.is_best_seller).slice(0, 10);
  const featuredProducts = activeProducts.filter(p => p.featured || p.is_new).slice(0, 10);
  const cityDeliveryProducts = activeProducts.slice(0, 12);

  // Array of pastel colors for category cards as seen in image
  const pastelColors = ['#F0F8FF', '#F0F4FF', '#F4F0FF', '#F0FAFA', '#FFF4EA'];

  // Helper to generate a slug from a string (for brands if missing)
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // --- DYNAMIC RENDER CARD HELPER ---
  const renderEronixCard = (product) => {
    const isWishlisted = wishlist.includes(product.id);
    const stats = ratingStats[product.id];
    const discount = calculateDiscount(product.mrp, product.selling_price);
    const catName = data.categories.find(c => c.id === product.category_id)?.name || 'PRODUCT';
    
    // Dynamic Condition and Warranty Strings
    const conditionText = product.condition === 'New' ? 'Original Quality' : (product.condition || 'Standard');
    const warrantyText = product.warranty ? ` | ${product.warranty}` : '';
    const specsString = `${conditionText}${warrantyText}`;

    // Dynamic Rating
    const displayRating = stats && stats.averageRating > 0 ? Math.round(stats.averageRating) : 0;
    const reviewCount = stats?.totalReviews || 0;

    // Dynamic Stock Variables
    const isOutOfStock = product.stock_status === 'out_of_stock';
    let stockStatusText = 'In Stock';
    let stockDotColor = 'var(--eronix-accent-green)'; // Green default

    if (isOutOfStock) {
      stockStatusText = 'Out of Stock';
      stockDotColor = '#E63946'; // Red
    } else if (product.stock_status === 'pre_order') {
      stockStatusText = 'Pre-Order';
      stockDotColor = '#F59E0B'; // Orange
    }

    // Dynamic Delivery Tags
    const deliveryText = product.selling_price > 499 ? 'Free Delivery' : (product.is_cod_available ? 'COD Available' : 'Standard Delivery');

    return (
      <article className="eronix-card" key={product.id}>
        <div className="ec-header">
          <div className="ec-badges">
            {discount > 0 && <div className="ec-badge">{discount}% OFF</div>}
            {product.is_new && <div className="ec-badge" style={{ background: 'var(--eronix-primary-blue)', marginLeft: '4px' }}>NEW</div>}
          </div>
          <button className={`ec-wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={(e) => handleAddToWishlist(e, product)}>
            <HeartIcon filled={isWishlisted} />
          </button>
        </div>

        <Link to={`/product/${product.slug}`} className="ec-link">
          <div className="ec-image-container">
          <img
  src={getProductImage(product)}
  alt={product.name}
  onError={(e) => {
    console.log("Broken Image:", e.target.src);
    e.target.src = defaultImg;
  }}
/>
            <div className="ec-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
          
          <div className="ec-content">
            <span className="ec-category">{catName}</span>
            <h4 className="ec-title">{product.name}</h4>
            <p className="ec-specs">{specsString}</p>
            
            <div className="ec-rating-row">
              <div className="ec-stars">
                {[1, 2, 3, 4, 5].map((star, i) => (
                  <span key={i} style={{ color: star <= displayRating ? '#F59E0B' : '#E8EDF5' }}>★</span>
                ))}
              </div>
              <span className="ec-review-count">({reviewCount})</span>
            </div>

            <div className="ec-price-row">
              <strong className="ec-current-price">₹{product.selling_price?.toLocaleString('en-IN')}</strong>
              {product.mrp > product.selling_price && <del className="ec-mrp">₹{product.mrp?.toLocaleString('en-IN')}</del>}
            </div>

            <div className="ec-tags">
              <span className="ec-tag-stock" style={{ color: isOutOfStock ? '#E63946' : 'inherit' }}>
                <span className="dot-dynamic" style={{ backgroundColor: stockDotColor, width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' }}></span> 
                {' '}{stockStatusText}
              </span>
              <span className="ec-tag-delivery"><TruckIcon /> {deliveryText}</span>
            </div>
          </div>
        </Link>

        <div className="ec-actions">
          <div className="action-col compare-col">
            {/* 👇 Compare button active */}
            <button 
              className="ec-btn-compare" 
              title="Compare"
              onClick={(e) => handleAddToCompare(e, product)}
            >
              <CompareIcon />
            </button>
            <span className="ec-action-label">Compare</span>
          </div>
          <div className="action-col">
            <button 
              className="ec-btn-cart" 
              onClick={(e) => handleAddToCart(e, product)}
              disabled={isOutOfStock}
              style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              <CartIcon /> Add to Cart
            </button>
            <span className="ec-action-label">Add product</span>
          </div>
          <div className="action-col">
            <button 
              className="ec-btn-buy" 
              onClick={(e) => handleBuyNow(e, product)}
              disabled={isOutOfStock}
              style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer', background: isOutOfStock ? '#A0AABF' : 'var(--eronix-accent-green)' }}
            >
              <LightningIcon /> Buy Now
            </button>
            <span className="ec-action-label">Buy instantly</span>
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", background: '#F5F7FA' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #E8EDF5', borderTop: '4px solid #009DFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '15px', color: '#666666', fontWeight: '500' }}>Loading EronixTech...</p>
        </div>
      </Layout>
    );
  }

  // Define static brands to match the provided image closely
  const trustedBrandsLogos = [
    'intel.', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'GIGABYTE', 'CORSAIR', 'SAMSUNG', 'crucial', 'WD'
  ];

  return (
    <Layout>
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} authType={authType} setAuthType={setAuthType} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ========== STYLES (includes popular searches styling) ========== */}
      <style>
        {`
          /* Slider wrapper: buttons hidden by default, shown on hover */
          .slider-wrapper {
            position: relative;
          }
          .slider-wrapper .slider-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 5;
            background: rgba(255,255,255,0.9);
            border: 1px solid #ddd;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease, background 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .slider-wrapper:hover .slider-btn {
            opacity: 1;
          }
          .slider-wrapper .slider-btn.left {
            left: 10px;
          }
          .slider-wrapper .slider-btn.right {
            right: 10px;
          }
          .slider-wrapper .slider-btn:hover {
            background: #fff;
            border-color: #009DFF;
          }

          /* Brand item hover effect + clickable */
          .brand-item {
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .circle:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          }
          .brand-item .circle {
            transition: border-color 0.2s;
          }
          .brand-item:hover .circle {
            border-color: #009DFF;
          }

          /* ===== POPULAR SEARCHES STYLING ===== */
          .popular-searches {
            background: #fff;
            padding: 32px 24px;
            border-radius: 12px;
            margin: 40px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          .popular-search-container {
            margin: 0 auto;
          }
          .search-heading {
            font-size: 18px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 20px;
            padding-left: 4px;
          }
          .pwa-row {
            display: flex;
            flex-direction: row;
            gap: 16px;
                flex-wrap: wrap;
          }
          .popular-search-wraper {
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;
            gap: 8px 16px;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
            width: 49%;
          }
          .popular-search-wraper:last-child {
            border-bottom: none;
          }
          .category-heading {
            font-weight: 700;
            font-size: 13px;
            color: #1a202c;
            min-width: 120px;
          }
          .sub-categories {
            display: flex;
            flex-wrap: wrap;
            gap: 4px 16px;
          }
          .sub-categories a {
            color: #4a5568;
            font-size: 13px;
            text-decoration: none;
            transition: color 0.2s;
            position: relative;
          }
          .sub-categories a::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 1px;
            background: #009DFF;
            transition: width 0.2s;
          }
          .sub-categories a:hover {
            color: #009DFF;
          }
          .sub-categories a:hover::after {
            width: 100%;
          }
          @media (max-width: 640px) {
            .popular-search-wraper {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            .category-heading {
              min-width: auto;
            }
            .sub-categories {
              gap: 4px 12px;
            }
          }
        `}
      </style>

      <main className="eronix-main-container container" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
        
        <HeroBanner banners={heroBanners} />

        <div className="mini-banners">
          {miniBanners.length > 0 ? (
            miniBanners.map(banner => (
              <div className="mini-banner" key={banner.id}>
                {banner.link_url ? (
                  <Link to={banner.link_url}><img src={banner.image_url} alt={banner.title} /></Link>
                ) : (
                  <img src={banner.image_url} alt={banner.title} />
                )}
              </div>
            ))
          ) : (
            <>
              <div className="mini-banner"><img src={goldBanner} alt="Gold Banner" /></div>
              <div className="mini-banner"><img src={cellbellGif} alt="Cellbell" /></div>
              <div className="mini-banner"><img src={mezoniteGold} alt="Mezonite Gold" /></div>
              <div className="mini-banner"><img src={bannerAndDeal} alt="Banner and Deal" /></div>
            </>
          )}
        </div>

        {/* 24-Hour Delivery Cities Section / New Arrivals */}
        <div className="delivery-cities-section">
          <div className="delivery-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              New Arrivals
            </h2>
          </div>
          <div className="slider-wrapper">
            <button className="slider-btn left" onClick={() => scrollContainer('citiesGrid', 'left')}>‹</button>
            <div className="cities-grid" id="citiesGrid">
              {cityDeliveryProducts.map((item) => renderEronixCard(item))}
            </div>
            <button className="slider-btn right" onClick={() => scrollContainer('citiesGrid', 'right')}>›</button>
          </div>
        </div>

        {/* BESTSELLERS */}
        {bestsellers.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2>BESTSELLERS</h2>
              <Link className="view-all" to="/search?sort=bestseller">View All →</Link>
            </div>
            <div className="slider-wrapper">
              <button className="slider-btn left" onClick={() => scrollContainer('bestsellersGrid', 'left')}>‹</button>
              <div className="home-card-row" id="bestsellersGrid">
                {bestsellers.map(product => renderEronixCard(product))}
              </div>
              <button className="slider-btn right" onClick={() => scrollContainer('bestsellersGrid', 'right')}>›</button>
            </div>
          </div>
        )}

        <div className="promo-strip">
          {promoBanners.length > 0 ? (
            promoBanners.map(banner => (
              <div className="promo-card" key={banner.id}>
                 <img src={banner.image_url} alt={banner.title} />
              </div>
            ))
          ) : null}
        </div>

        {/* DYNAMIC CATEGORY SECTIONS  */}
        {data.categories.sort((a, b) => a.display_order - b.display_order).map(category => {
          const categoryProducts = activeProducts.filter(p => p.category_id === category.id);
          if (categoryProducts.length === 0) return null;

          return (
            <div className="electrical-section-wrapper" key={category.id}>
              <div className="section-head">
                <h2>{category.name.toUpperCase()}</h2>
                <Link className="view-all-btn" to={`/category/${category.slug}`}>Explore Now →</Link>
              </div>
              
              <div className="electrical-container">
                <div className="electrical-top-row">
                  {/* Left block exactly matching WhatsApp Image reference */}
                  <div className="electrical-brands">
                    <h3>TOP BRANDS & RELATED CATEGORIES</h3>
                    
                    {/* ---- BRAND SLIDER (NEW) ---- */}
                    <div className="brand-slider-wrapper slider-wrapper">
                      <button className="slider-btn left" onClick={() => scrollContainer('brandCirclesGrid', 'left')}>‹</button>
                      <div className="brand-circles-scroll" id="brandCirclesGrid">
                        {data.brands.map(brand => {
                          // Build brand URL using slug if available, else generate from name
                          const brandSlug = brand.slug || generateSlug(brand.name);
                          return (
                            // FIX 1: Redirect to category page with brand filter
                            <Link to={`/category?brand=${brandSlug}`} className="brand-item" key={brand.id}>
                              <div className="circle">
                                <img src={brand.logo_url || `https://ui-avatars.com/api/?name=${brand.name}&background=random`} alt={brand.name} />
                              </div>
                              <span>{brand.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                      <button className="slider-btn right" onClick={() => scrollContainer('brandCirclesGrid', 'right')}>›</button>
                    </div>

                    <div className="trust-badges">
                      <div className="trust-badge">
                        <ShieldIcon />
                        <span className="tb-title">100% Genuine</span>
                        <span className="tb-sub">Products</span>
                      </div>
                      <div className="trust-badge">
                        <TruckIcon />
                        <span className="tb-title">Fast Delivery</span>
                        <span className="tb-sub">Pan India</span>
                      </div>
                      <div className="trust-badge">
                        <RefreshIcon />
                        <span className="tb-title">Easy Returns</span>
                        <span className="tb-sub">7 Days Return</span>
                      </div>
                      <div className="trust-badge">
                        <LockIcon />
                        <span className="tb-title">Secure Payment</span>
                        <span className="tb-sub">100% Safe</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category cards matching the 5-column pastel design */}
                  <div className="electrical-categories">
                    {category.sub_categories?.slice(0, 5).map((sub, index) => {
                      // FIX 2: Use the subcategory's actual parent category and its numeric ID
                      const parentCategory = data.categories.find(c => c.id === sub.category_id) || category;
                      const linkTo = `/category/${parentCategory.slug}?sub=${sub.id}`;
                      return (
                        <div className="ec-card" key={sub.id} style={{ backgroundColor: pastelColors[index % 5] }}>
                          <div className="ec-img">
                            <img src={sub.icon_url || defaultImg} alt={sub.name} />
                          </div>
                          <div className="ec-text">
                            <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</h4>
                            <Link to={linkTo} className="explore-link">Explore Now →</Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="electrical-products-wrapper">
                  <div className="slider-wrapper">
                    {categoryProducts.length > 4 && (
                      <button className="slider-btn left" onClick={() => scrollContainer(`grid-${category.id}`, 'left')}>‹</button>
                    )}
                    <div className="electrical-products" id={`grid-${category.id}`}>
                      {categoryProducts.slice(0, 8).map(product => renderEronixCard(product))}
                    </div>
                    {categoryProducts.length > 4 && (
                      <button className="slider-btn right" onClick={() => scrollContainer(`grid-${category.id}`, 'right')}>›</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* FEATURED ARRIVALS */}
        {featuredProducts.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2>FEATURED ARRIVALS</h2>
              <Link className="view-all" to="/search?sort=new">VIEW ALL →</Link>
            </div>
            <div className="slider-wrapper">
              <button className="slider-btn left" onClick={() => scrollContainer('featuredGrid', 'left')}>‹</button>
              <div className="home-card-row" id="featuredGrid">
                {featuredProducts.map(product => renderEronixCard(product))}
              </div>
              <button className="slider-btn right" onClick={() => scrollContainer('featuredGrid', 'right')}>›</button>
            </div>
          </div>
        )}

        {/* TRUSTED BRANDS SECTION */}
        <div className="trusted-brands-section">
          <div className="tb-header">
            <div className="tb-line-wrapper left"><span className="tb-dot"></span><span className="tb-line"></span></div>
            <h3 className="tb-title-text">
              TRUSTED BY <span className="tb-blue-text">GAMERS.</span> CHOSEN BY <span className="tb-blue-text">PROFESSIONALS.</span>
            </h3>
            <div className="tb-line-wrapper right"><span className="tb-line"></span><span className="tb-dot"></span></div>
          </div>
          <div className="tb-logos-container">
            {trustedBrandsLogos.map((brand, index) => (
              <div className="tb-brand-item" key={index}>
                <span className={`tb-brand-text ${brand.toLowerCase()}`}>{brand}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== POPULAR SEARCHES SECTION (with new styling) ===== */}
        <div className="popular-searches white-bg">
          <div className="popular-search-container">
            <p className="search-heading">Popular searches on EronixTech</p>
            <div className="pwa-row pad-lr-0">
              {data.categories.map(category => {
                if (!category.sub_categories || category.sub_categories.length === 0) return null;
                return (
                  <div className="popular-search-wraper" key={category.id}>
                    <span className="category-heading">{category.name.toUpperCase()}:</span>
                    <div className="sub-categories">
                      {category.sub_categories.map(sub => (
                        <span key={sub.id}>
                          <Link to={`/category/${category.slug}?sub=${sub.slug}`}>{sub.name}</Link>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

   
        
      </main>

      {/* 👇 CompareBar – fixed at bottom */}
      <CompareBar />
    </Layout>
  );
}

export default Home;
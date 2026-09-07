import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

// Layout & Components
import Layout from '../../../components/layout/Layout';
import HeroBanner from './HeroBanner';
import AuthModal from '../../User/Auth/AuthModal';
import CompareBar from '../../../components/CompareBar/CompareBar';

// Services
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import brandService from '../../../services/brandService';
import bannerService from '../../../services/bannerService';
import cartService from '../../../services/cartService';
import wishlistService from '../../../services/wishlistService';
import reviewService from '../../../services/reviewService';

// Context
import { useCompare } from '../../../context/CompareContext';

// Assets
import defaultImg from '../../../assets/images/products/pr1.png';
import gamingZonePromo from '../../../assets/images/home/1.png';
import buildPcPromo from '../../../assets/images/home/2.png';
import businessSolutionsPromo from '../../../assets/images/home/3.png';

// ---------- SVG Icons ----------
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const LightningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
const CompareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="11 17 7 21 3 17" /><line x1="7" y1="21" x2="7" y2="9" />
    <polyline points="13 7 17 3 21 7" /><line x1="17" y1="3" x2="17" y2="15" />
  </svg>
);
const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
  </svg>
);
const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ---------- Toast Component ----------
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

// ---------- Product Card (memoized) ----------
const ProductCard = memo(({
  product,
  wishlist,
  ratingStats,
  categories,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  onAddToCompare,
  getProductImage,
  calculateDiscount,
  defaultImg
}) => {
  const isWishlisted = wishlist.includes(product.id);
  const stats = ratingStats[product.id];
  const discount = calculateDiscount(product.mrp, product.selling_price);
  const catName = categories.find(c => c.id === product.category_id)?.name || 'PRODUCT';

  const conditionText = product.condition === 'New' ? 'Original Quality' : (product.condition || 'Standard');
  const warrantyText = product.warranty ? ` | ${product.warranty}` : '';
  const specsString = `${conditionText}${warrantyText}`;

  const displayRating = stats && stats.averageRating > 0 ? Math.round(stats.averageRating) : 0;
  const reviewCount = stats?.totalReviews || 0;

  const isOutOfStock = product.stock_status === 'out_of_stock';
  let stockStatusText = 'In Stock';
  let stockDotColor = 'var(--eronix-accent-green)';
  if (isOutOfStock) {
    stockStatusText = 'Out of Stock';
    stockDotColor = '#E63946';
  } else if (product.stock_status === 'pre_order') {
    stockStatusText = 'Pre-Order';
    stockDotColor = '#F59E0B';
  }

  const deliveryText = product.selling_price > 499 ? 'Free Delivery' : (product.is_cod_available ? 'COD Available' : 'Standard Delivery');

  return (
    <article className="eronix-card">
      <div className="ec-header">
        <div className="ec-badges">
          {discount > 0 && <div className="ec-badge">{discount}% OFF</div>}
          {product.is_new && <div className="ec-badge" style={{ background: 'var(--eronix-primary-blue)', marginLeft: '4px' }}>NEW</div>}
        </div>
        <button
          className={`ec-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => onAddToWishlist(e, product)}
        >
          <HeartIcon filled={isWishlisted} />
        </button>
      </div>

      <Link to={`/product/${product.slug}`} className="ec-link">
        <div className="ec-image-container">
          <img
            src={getProductImage(product)}
            alt={product.name}
            loading="lazy"
            onError={(e) => { e.target.src = defaultImg; }}
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
          <button className="ec-btn-compare" title="Compare" onClick={(e) => onAddToCompare(e, product)}>
            <CompareIcon />
          </button>
          <span className="ec-action-label">Compare</span>
        </div>
        <div className="action-col">
          <button
            className="ec-btn-cart"
            onClick={(e) => onAddToCart(e, product)}
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
            onClick={(e) => onBuyNow(e, product)}
            disabled={isOutOfStock}
            style={{
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              background: isOutOfStock ? '#A0AABF' : 'var(--eronix-accent-green)'
            }}
          >
            <LightningIcon /> Buy Now
          </button>
          <span className="ec-action-label">Buy instantly</span>
        </div>
      </div>
    </article>
  );
});

// ---------- Category Section Component ----------
const CategorySection = memo(({
  category,
  products,
  brands,
  categories,
  wishlist,
  ratingStats,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  onAddToCompare,
  getProductImage,
  calculateDiscount,
  generateSlug,
  scrollContainer,
  defaultImg
}) => {
  const categoryProducts = products.filter(p => p.category_id === category.id);
  const subCats = category.sub_categories || [];
  const cardBackgrounds = ['#E6F2FE', '#EAE6FA', '#E2F4EA', '#FBEAE9', '#F9E6EF'];

  return (
    <div className="electrical-section-wrapper" key={category.id}>
      {/* Header */}
      <div className="img-style-header">
        <div className="img-header-left">
          <h2><span className="img-slash"></span> {category.name.toUpperCase()}</h2>
          <p className="img-subtitle">Enhance Your Setup. Work Better. Play Better.</p>
        </div>
        <Link className="img-explore-btn" to={`/category/${category.slug}`}>
          Explore All {category.name} &rarr;
        </Link>
      </div>

      <div className="electrical-container">
        <div className="img-style-top-row">
          {/* Left Block: Brands & Trust Badges */}
          <div className="img-brands-block">
            <div className="img-brands-header">
              <h3>TOP BRANDS & RELATED CATEGORIES</h3>
              <Link to={`/category?brand=all`} className="img-view-brands">View All Brands &rarr;</Link>
            </div>

            <div className="img-brands-grid">
              {brands.slice(0, 8).map(brand => {
                const brandSlug = brand.slug || generateSlug(brand.name);
                return (
                  <Link to={`/category?brand=${brandSlug}`} className="img-brand-item" key={brand.id}>
                    <img src={brand.logo_url || `https://ui-avatars.com/api/?name=${brand.name}&background=random`} alt={brand.name} loading="lazy" />
                    <span>{brand.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="img-trust-badges">
              <div className="img-badge">
                <div className="img-badge-icon"><ShieldIcon /></div>
                <span className="img-badge-title">100% Genuine</span>
                <span className="img-badge-sub">Products</span>
              </div>
              <div className="img-badge">
                <div className="img-badge-icon"><TruckIcon /></div>
                <span className="img-badge-title">Fast Delivery</span>
                <span className="img-badge-sub">Pan India</span>
              </div>
              <div className="img-badge">
                <div className="img-badge-icon"><RefreshIcon /></div>
                <span className="img-badge-title">Easy Returns</span>
                <span className="img-badge-sub">7 Days Return</span>
              </div>
              <div className="img-badge">
                <div className="img-badge-icon"><LockIcon /></div>
                <span className="img-badge-title">Secure Payment</span>
                <span className="img-badge-sub">100% Safe</span>
              </div>
            </div>

            <div className="img-gear-up-text">
              <span className="cursive-text">Gear Up</span><br/>
              <span className="cursive-text">Your Tech Life</span>
            </div>
          </div>

          {/* Right Block: Sub‑category Cards */}
          <div className="img-categories-block">
            {subCats.length > 0 ? (
              subCats.slice(0, 5).map((sub, index) => {
                const parentCategory = categories.find(c => c.id === sub.category_id) || category;
                return (
                  <div className="img-cat-card" key={sub.id} style={{ backgroundColor: cardBackgrounds[index % 5] }}>
                    <img
                      className="img-cat-bg"
                      src={sub.icon_url || defaultImg}
                      alt={sub.name}
                      loading="lazy"
                    />
                    <div className="img-cat-text">
                      <h4>{sub.name.toUpperCase()}</h4>
                      <Link to={`/category/${parentCategory.slug}?sub=${sub.id}`} className="img-explore-link">
                        <span className="img-arrow-circle">&rarr;</span> Explore Now
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="img-no-subcategories" style={{ padding: '20px', textAlign: 'center' }}>
                <p>Sub‑categories coming soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Strip */}
        <div className="img-footer-strip">
          <span>PREMIUM BRANDS</span>
          <span className="img-divider">|</span>
          <span>BETTER PERFORMANCE</span>
          <span className="img-divider">|</span>
          <span>COMPLETE ACCESSORIES</span>
        </div>

        {/* Product Slider */}
        <div className="electrical-products-wrapper">
          <div className="slider-wrapper">
            {categoryProducts.length > 4 && (
              <button className="slider-btn left" onClick={() => scrollContainer(`grid-${category.id}`, 'left')}>‹</button>
            )}
            <div className="electrical-products" id={`grid-${category.id}`}>
              {categoryProducts.length > 0 ? (
                categoryProducts.slice(0, 8).map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlist}
                    ratingStats={ratingStats}
                    categories={categories}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onAddToWishlist={onAddToWishlist}
                    onAddToCompare={onAddToCompare}
                    getProductImage={getProductImage}
                    calculateDiscount={calculateDiscount}
                    defaultImg={defaultImg}
                  />
                ))
              ) : (
                <div className="no-products-message" style={{ padding: '20px', textAlign: 'center', width: '100%' }}>
                  <p>No products available in this category yet.</p>
                </div>
              )}
            </div>
            {categoryProducts.length > 4 && (
              <button className="slider-btn right" onClick={() => scrollContainer(`grid-${category.id}`, 'right')}>›</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ---------- Main Home Component ----------
function Home() {
  const navigate = useNavigate();
  const { addToCompare } = useCompare();

  // State
  const [data, setData] = useState({
    products: [],
    categories: [],
    brands: [],
    banners: []
  });
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const API_URL = "http://localhost:5000";

  // ---------- Helpers ----------
  const getProductImage = useCallback((product) => {
    try {
      let images = product.images;
      if (typeof images === "string") images = JSON.parse(images);
      if (!Array.isArray(images) || images.length === 0) return defaultImg;

      const primary = images.find(img => img.is_primary) || images[0];
      if (!primary?.image_path) return defaultImg;
      if (primary.image_path.startsWith("http")) return primary.image_path;

      return `${API_URL}/${primary.image_path.replace(/^\/+/, "")}`;
    } catch {
      return defaultImg;
    }
  }, [API_URL]);

  const calculateDiscount = useCallback((mrp, sellingPrice) => {
    if (!mrp || !sellingPrice || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  }, []);

  const generateSlug = useCallback((text) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  , []);

  // ---------- Fetch Wishlist ----------
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const items = await wishlistService.getWishlist();
        setWishlist(items.map(item => item.id));
      } catch {
        // silent
      }
    };
    fetchWishlist();
  }, [isAuthModalOpen]);

  // ---------- Fetch Home Data ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const safeFetch = async (promise) => {
        try { return await promise; } catch { return []; }
      };

      const [productsRes, categoriesRes, brandsRes, bannersRes] = await Promise.all([
        safeFetch(productService.getAllProducts({ activeOnly: true, limit: 100 })),
        safeFetch(categoryService.getAllCategories(true, true)),
        safeFetch(brandService.getAllBrands(true)),
        safeFetch(bannerService.getAllBanners(true))
      ]);

      setData({
        products: Array.isArray(productsRes) ? productsRes : (productsRes?.data || []),
        categories: Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data || []),
        brands: Array.isArray(brandsRes) ? brandsRes : (brandsRes?.data || []),
        banners: Array.isArray(bannersRes) ? bannersRes : (bannersRes?.data || [])
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  // ---------- Background Rating Fetch ----------
  useEffect(() => {
    if (data.products.length === 0) return;
    let isMounted = true;

    const fetchRatings = async () => {
      for (const product of data.products) {
        if (!isMounted) break;
        try {
          const stats = await reviewService.getReviewStats(product.id);
          if (isMounted) {
            setRatingStats(prev => ({ ...prev, [product.id]: stats }));
          }
        } catch {
          // ignore
        }
      }
    };
    fetchRatings();
    return () => { isMounted = false; };
  }, [data.products]);

  // ---------- Action Handlers ----------
  const handleAddToCart = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_status === 'out_of_stock') return;
    if (!localStorage.getItem('token')) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await cartService.addToCart(product.id, 1);
      showToast(`${product.name} added to cart! 🛒`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding to cart', 'error');
    }
  }, [showToast]);

  const handleBuyNow = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_status === 'out_of_stock') return;
    if (!localStorage.getItem('token')) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await cartService.addToCart(product.id, 1);
      navigate('/cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing Buy Now', 'error');
    }
  }, [navigate, showToast]);

  const handleAddToWishlist = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem('token')) {
      setIsAuthModalOpen(true);
      return;
    }

    const isWishlisted = wishlist.includes(product.id);
    setWishlist(prev =>
      isWishlisted ? prev.filter(id => id !== product.id) : [...prev, product.id]
    );

    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product.id);
        showToast('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(product.id);
        showToast('Added to wishlist ❤️');
      }
    } catch {
      setWishlist(prev =>
        isWishlisted ? [...prev, product.id] : prev.filter(id => id !== product.id)
      );
      showToast('Failed to update wishlist', 'error');
    }
  }, [wishlist, showToast]);

  const handleAddToCompare = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem('token')) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await addToCompare(product.id);
      showToast(`${product.name} added to compare!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to compare', 'error');
    }
  }, [addToCompare, showToast]);

  // ---------- Scroll Helper ----------
  const scrollContainer = useCallback((id, direction) => {
    const container = document.getElementById(id);
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  }, []);

  // ---------- Memoized Data ----------
  const activeProducts = useMemo(() => data.products.filter(p => p.status === 'active'), [data.products]);

  const banners = useMemo(() => ({
    hero: data.banners
      .filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'hero')
      .sort((a, b) => a.display_order - b.display_order),
    mini: data.banners
      .filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'mini')
      .slice(0, 4),
    promo: data.banners
      .filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'promo')
      .slice(0, 3)
  }), [data.banners]);

  const bestsellers = useMemo(() => activeProducts.filter(p => p.is_best_seller).slice(0, 10), [activeProducts]);
  const featuredProducts = useMemo(() => activeProducts.filter(p => p.featured || p.is_new).slice(0, 10), [activeProducts]);
  const cityDeliveryProducts = useMemo(() => activeProducts.slice(0, 12), [activeProducts]);

  // All active categories, regardless of product count
  const activeCategories = useMemo(() =>
    data.categories
      .filter(cat => cat.is_active !== false) // if is_active field exists, else include all
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [data.categories]
  );

  const trustedBrandsLogos = ['intel.', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'GIGABYTE', 'CORSAIR', 'SAMSUNG', 'crucial', 'WD'];

  // ---------- Loading State ----------
  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", background: '#F5F7FA' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #E8EDF5', borderTop: '4px solid #009DFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '15px', color: '#666666', fontWeight: '500' }}>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} authType={authType} setAuthType={setAuthType} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        .slider-wrapper { position: relative; }
        .slider-wrapper .slider-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 5; background: rgba(255,255,255,0.9);
          border: 1px solid #ddd; border-radius: 50%;
          width: 36px; height: 36px; display: flex;
          align-items: center; justify-content: center;
          font-size: 22px; cursor: pointer;
          opacity: 0; transition: opacity 0.3s ease, background 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .slider-wrapper:hover .slider-btn { opacity: 1; }
        .slider-wrapper .slider-btn.left { left: 10px; }
        .slider-wrapper .slider-btn.right { right: 10px; }
        .slider-wrapper .slider-btn:hover { background: #fff; border-color: #009DFF; }
        .popular-searches { background: #fff; padding: 32px 24px; border-radius: 12px; margin: 40px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .popular-search-container { margin: 0 auto; }
        .search-heading { font-size: 18px; font-weight: 700; color: #1a202c; margin-bottom: 20px; padding-left: 4px; }
        .pwa-row { display: flex; flex-direction: row; gap: 16px; flex-wrap: wrap; }
        .popular-search-wraper {
          display: flex; align-items: baseline; flex-wrap: wrap;
          gap: 8px 16px; padding: 10px 0;
          border-bottom: 1px solid #f0f0f0; width: 49%;
        }
        .popular-search-wraper:last-child { border-bottom: none; }
        .category-heading { font-weight: 700; font-size: 13px; color: #1a202c; min-width: 120px; }
        .sub-categories { display: flex; flex-wrap: wrap; gap: 4px 16px; }
        .sub-categories a { color: #4a5568; font-size: 13px; text-decoration: none; transition: color 0.2s; position: relative; }
        .sub-categories a::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px; background: #009DFF; transition: width 0.2s; }
        .sub-categories a:hover { color: #009DFF; }
        .sub-categories a:hover::after { width: 100%; }
        @media (max-width: 640px) {
          .popular-search-wraper { flex-direction: column; align-items: flex-start; gap: 4px; }
          .category-heading { min-width: auto; }
          .sub-categories { gap: 4px 12px; }
        }
      `}</style>

      <main className="eronix-main-container container" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
        <HeroBanner banners={banners.hero} />

        {/* Quick Categories */}
        <section className="home-quick-categories" aria-label="Shop by category">
          {data.categories
            .slice()
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .slice(0, 8)
            .map((category) => (
              <Link className="home-quick-category-card" to={`/category/${category.slug}`} key={category.id}>
                <div className="home-quick-category-image">
                  <img src={category.icon_url || category.image_url || defaultImg} alt={category.name} loading="lazy" onError={(e) => { e.currentTarget.src = defaultImg; }} />
                </div>
                <span className="home-quick-category-title">{category.name}</span>
                <span className="home-quick-category-link">Explore Now</span>
              </Link>
            ))}
          <Link className="home-quick-category-card home-view-all-card" to="/search">
            <div className="home-view-all-icon" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
            <span className="home-quick-category-title">View All</span>
          </Link>
        </section>

        {/* Feature Promos */}
        <section className="home-feature-promos" aria-label="Featured offers">
          <Link to="/gaming-zone" className="home-feature-promo-card"><img src={gamingZonePromo} alt="Gaming Zone" loading="lazy" /></Link>
          <Link to="/pc-build" className="home-feature-promo-card"><img src={buildPcPromo} alt="Build Your PC" loading="lazy" /></Link>
          <Link to="/contact" className="home-feature-promo-card"><img src={businessSolutionsPromo} alt="Business Solutions" loading="lazy" /></Link>
        </section>

        {/* New Arrivals */}
        <div className="delivery-cities-section">
          <div className="delivery-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg> New Arrivals
            </h2>
          </div>
          <div className="slider-wrapper">
            <button className="slider-btn left" onClick={() => scrollContainer('citiesGrid', 'left')}>‹</button>
            <div className="cities-grid" id="citiesGrid">
              {cityDeliveryProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlist={wishlist}
                  ratingStats={ratingStats}
                  categories={data.categories}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onAddToWishlist={handleAddToWishlist}
                  onAddToCompare={handleAddToCompare}
                  getProductImage={getProductImage}
                  calculateDiscount={calculateDiscount}
                  defaultImg={defaultImg}
                />
              ))}
            </div>
            <button className="slider-btn right" onClick={() => scrollContainer('citiesGrid', 'right')}>›</button>
          </div>
        </div>

        {/* Bestsellers */}
        {bestsellers.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2>BESTSELLERS</h2>
              <Link className="view-all" to="/search?sort=bestseller">View All →</Link>
            </div>
            <div className="slider-wrapper">
              <button className="slider-btn left" onClick={() => scrollContainer('bestsellersGrid', 'left')}>‹</button>
              <div className="home-card-row" id="bestsellersGrid">
                {bestsellers.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlist}
                    ratingStats={ratingStats}
                    categories={data.categories}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onAddToWishlist={handleAddToWishlist}
                    onAddToCompare={handleAddToCompare}
                    getProductImage={getProductImage}
                    calculateDiscount={calculateDiscount}
                    defaultImg={defaultImg}
                  />
                ))}
              </div>
              <button className="slider-btn right" onClick={() => scrollContainer('bestsellersGrid', 'right')}>›</button>
            </div>
          </div>
        )}

        {/* ---------- DYNAMIC CATEGORY SECTIONS ---------- */}
        {activeCategories.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            products={activeProducts}
            brands={data.brands}
            categories={data.categories}
            wishlist={wishlist}
            ratingStats={ratingStats}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onAddToWishlist={handleAddToWishlist}
            onAddToCompare={handleAddToCompare}
            getProductImage={getProductImage}
            calculateDiscount={calculateDiscount}
            generateSlug={generateSlug}
            scrollContainer={scrollContainer}
            defaultImg={defaultImg}
          />
        ))}

        {/* Featured Arrivals */}
        {featuredProducts.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2>FEATURED ARRIVALS</h2>
              <Link className="view-all" to="/search?sort=new">VIEW ALL →</Link>
            </div>
            <div className="slider-wrapper">
              <button className="slider-btn left" onClick={() => scrollContainer('featuredGrid', 'left')}>‹</button>
              <div className="home-card-row" id="featuredGrid">
                {featuredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlist}
                    ratingStats={ratingStats}
                    categories={data.categories}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onAddToWishlist={handleAddToWishlist}
                    onAddToCompare={handleAddToCompare}
                    getProductImage={getProductImage}
                    calculateDiscount={calculateDiscount}
                    defaultImg={defaultImg}
                  />
                ))}
              </div>
              <button className="slider-btn right" onClick={() => scrollContainer('featuredGrid', 'right')}>›</button>
            </div>
          </div>
        )}

        {/* Trusted Brands */}
        <div className="trusted-brands-section">
          <div className="tb-header">
            <div className="tb-line-wrapper left"><span className="tb-dot"></span><span className="tb-line"></span></div>
            <h3 className="tb-title-text">TRUSTED BY <span className="tb-blue-text">GAMERS.</span> CHOSEN BY <span className="tb-blue-text">PROFESSIONALS.</span></h3>
            <div className="tb-line-wrapper right"><span className="tb-line"></span><span className="tb-dot"></span></div>
          </div>
          <div className="tb-logos-container">
            {trustedBrandsLogos.map((brand, index) => (
              <div className="tb-brand-item" key={index}><span className={`tb-brand-text ${brand.toLowerCase()}`}>{brand}</span></div>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
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
                        <span key={sub.id}><Link to={`/category/${category.slug}?sub=${sub.slug}`}>{sub.name}</Link></span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <CompareBar />
    </Layout>
  );
}

export default Home;
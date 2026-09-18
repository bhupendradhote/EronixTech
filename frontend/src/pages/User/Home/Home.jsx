import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
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
import gearUpBg from '../../../assets/images/banner/erbann.jpeg';

// =============================================================
// Helpers
// =============================================================

const extractArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.products)) return res.products;
  if (Array.isArray(res.items)) return res.items;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.products)) return res.data.products;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (res.result && Array.isArray(res.result)) return res.result;
  return [];
};

const extractTotal = (res) => {
  if (!res) return null;
  const t =
    res.total ??
    res.data?.total ??
    res.pagination?.total ??
    res.data?.pagination?.total ??
    null;
  return typeof t === 'number' ? t : null;
};

const safeSlug = (text, fallbackId) => {
  if (text && typeof text === 'string' && text.trim()) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  return fallbackId != null ? String(fallbackId) : '';
};

// =============================================================
// Persistent cache — survives refresh + back/forward navigation
// =============================================================

const CACHE_KEY = 'eronix_home_cache_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.timestamp) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data,
    }));
  } catch {
    // sessionStorage full or disabled — ignore
  }
};

// =============================================================
// SVG Icons
// =============================================================

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

// =============================================================
// Toast
// =============================================================

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

// =============================================================
// Skeleton Loader
// =============================================================

const HomeSkeleton = () => (
  <Layout>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px' }}>
      <div style={{ width: '100%', height: '320px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '12px', marginBottom: '24px' }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: '120px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '10px' }}></div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: '360px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '12px' }}></div>
        ))}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  </Layout>
);

// =============================================================
// Product Card
// =============================================================

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
            decoding="async"
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

// =============================================================
// Category Section
// =============================================================

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
  defaultImg,
  gearUpBgImage
}) => {
  const subCategoryIds = useMemo(
    () => (category.sub_categories || []).map(sub => Number(sub.id)),
    [category.sub_categories]
  );

  const categoryProducts = useMemo(() => {
    const catId = Number(category.id);
    return products.filter(p => {
      const pCatId = Number(p.category_id);
      if (pCatId) return pCatId === catId;
      const pSubId = Number(p.sub_category_id);
      return pSubId && subCategoryIds.includes(pSubId);
    }).slice(0, 8);
  }, [products, category.id, subCategoryIds]);

  const subCats = category.sub_categories || [];
  const cardBackgrounds = ['#E6F2FE', '#EAE6FA', '#E2F4EA', '#FBEAE9', '#F9E6EF'];

  const categorySlug = category.slug || generateSlug(category.name);

  return (
    <div className="electrical-section-wrapper" key={category.id}>
      <div className="img-style-header">
        <div className="img-header-left">
          <h2><span className="img-slash"></span> {category.name.toUpperCase()}</h2>
          <p className="img-subtitle">Enhance Your Setup. Work Better. Play Better.</p>
        </div>
        <Link className="img-explore-btn" to={`/category/${categorySlug}`}>
          Explore All {category.name} &rarr;
        </Link>
      </div>

      <div className="electrical-container">
        <div className="img-style-top-row">
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

            <div
              className="img-gear-up-text"
              style={{
                backgroundImage: `url(${gearUpBgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '140px',
                borderRadius: '12px',
                marginTop: '8px',
              }}
            />
          </div>

          <div className="img-categories-block">
            {subCats.length > 0 ? (
              subCats.slice(0, 5).map((sub, index) => {
                const parentCategory = categories.find(c => c.id === sub.category_id) || category;
                const parentSlug = parentCategory.slug || generateSlug(parentCategory.name);
                return (
                  <div className="img-cat-card" key={sub.id} style={{ backgroundColor: cardBackgrounds[index % 5] }}>
                    <img className="img-cat-bg" src={sub.icon_url || defaultImg} alt={sub.name} loading="lazy" />
                    <div className="img-cat-text">
                      <h4>{sub.name.toUpperCase()}</h4>
                      <Link to={`/category/${parentSlug}?sub=${sub.id}`} className="img-explore-link">
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

        <div className="img-footer-strip">
          <span>PREMIUM BRANDS</span>
          <span className="img-divider">|</span>
          <span>BETTER PERFORMANCE</span>
          <span className="img-divider">|</span>
          <span>COMPLETE ACCESSORIES</span>
        </div>

        <div className="electrical-products-wrapper">
          <div className="slider-wrapper">
            {categoryProducts.length > 4 && (
              <button className="slider-btn left" onClick={() => scrollContainer(`grid-${category.id}`, 'left')}>‹</button>
            )}
            <div className="electrical-products" id={`grid-${category.id}`}>
              {categoryProducts.length > 0 ? (
                categoryProducts.map(product => (
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

// =============================================================
// Main Home
// =============================================================

function Home() {
  const navigate = useNavigate();
  const { addToCompare } = useCompare();
  const abortRef = useRef(null);

  const [data, setData] = useState(() => {
    const cached = readCache();
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return { products: [], categories: [], brands: [], banners: [] };
  });

  const [loading, setLoading] = useState(() => {
    const cached = readCache();
    return !(cached && Date.now() - cached.timestamp < CACHE_TTL);
  });

  const [ratingStats, setRatingStats] = useState({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const getFullUrl = useCallback((url) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (window.location.protocol === 'https:' && url.startsWith('http://')) {
        return url.replace('http://', 'https://');
      }
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : '/' + url;
    return window.location.origin + cleanPath;
  }, []);

  const getProductImage = useCallback((product) => {
    try {
      let images = product.images;
      if (typeof images === "string") images = JSON.parse(images);
      if (!Array.isArray(images) || images.length === 0) return defaultImg;
      const primary = images.find(img => img.is_primary) || images[0];
      if (!primary?.image_path) return defaultImg;
      return getFullUrl(primary.image_path);
    } catch {
      return defaultImg;
    }
  }, [getFullUrl]);

  const calculateDiscount = useCallback((mrp, sellingPrice) => {
    if (!mrp || !sellingPrice || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  }, []);

  const generateSlug = useCallback((text) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  , []);

  // ---------- Wishlist ----------
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const items = await wishlistService.getWishlist();
        setWishlist(items.map(item => item.id));
      } catch {}
    };
    fetchWishlist();
  }, [isAuthModalOpen]);

  // ---------- Main data fetch (SWR pattern) ----------
  useEffect(() => {
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const PRODUCT_LIMIT = 100;
    const MAX_PAGES = 2;

    const fetchProducts = async () => {
      const results = await Promise.all(
        Array.from({ length: MAX_PAGES }, (_, i) =>
          productService
            .getAllProducts({ activeOnly: true, limit: PRODUCT_LIMIT, page: i + 1 })
            .catch((err) => {
              if (err?.name !== 'CanceledError') {
                console.error(`[Home] products page ${i + 1} failed:`, err?.message || err);
              }
              return [];
            })
        )
      );

      if (signal.aborted) return [];

      let all = [];
      for (const res of results) {
        all = all.concat(extractArray(res));
      }

      const seen = new Set();
      all = all.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      console.log(`[Home] Loaded ${all.length} products`);
      return all;
    };

    const fetchData = async () => {
      try {
        const [productsList, categoriesRes, brandsRes, bannersRes] = await Promise.all([
          fetchProducts(),
          categoryService.getAllCategories(true, true).catch(() => []),
          brandService.getAllBrands(true).catch(() => []),
          bannerService.getAllBanners(true).catch(() => []),
        ]);

        if (signal.aborted) return;

        const nextData = {
          products: productsList,
          categories: extractArray(categoriesRes),
          brands: extractArray(brandsRes),
          banners: extractArray(bannersRes),
        };

        console.log('[Home] Data ready:', {
          products: nextData.products.length,
          categories: nextData.categories.length,
          brands: nextData.brands.length,
          banners: nextData.banners.length,
        });

        writeCache(nextData);
        setData(nextData);
        setLoading(false);
      } catch (err) {
        if (err?.name !== 'CanceledError') {
          console.error('[Home] fetchData failed:', err);
        }
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ---------- Ratings (lazy, batched, cached) ----------
  useEffect(() => {
    if (data.products.length === 0) return;
    if (Object.keys(ratingStats).length > 0) return;
    let isMounted = true;

    const fetchRatings = async () => {
      const visibleIds = new Set();
      data.products.forEach((p) => {
        if (visibleIds.size < 200) visibleIds.add(p.id);
      });
      const ids = Array.from(visibleIds);

      const batchSize = 30;
      for (let i = 0; i < ids.length; i += batchSize) {
        if (!isMounted) break;
        const slice = ids.slice(i, i + batchSize);

        const results = await Promise.all(
          slice.map(async (id) => {
            try {
              const stats = await reviewService.getReviewStats(id);
              return [id, stats];
            } catch {
              return [id, null];
            }
          })
        );

        if (!isMounted) break;

        setRatingStats((prev) => {
          const next = { ...prev };
          results.forEach(([id, stats]) => {
            if (stats) next[id] = stats;
          });
          return next;
        });
      }
    };

    fetchRatings();
    return () => { isMounted = false; };
  }, [data.products, ratingStats]);

  // ---------- Actions ----------
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

  const scrollContainer = useCallback((id, direction) => {
    const container = document.getElementById(id);
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  }, []);

  // ---------- Derived data ----------
  const activeProducts = useMemo(
    () => data.products.filter(p => p.status === 'active'),
    [data.products]
  );

  const processedBanners = useMemo(() => {
    const process = (b) => ({
      ...b,
      image_url: getFullUrl(b.image_url),
      mobile_image_url: b.mobile_image_url ? getFullUrl(b.mobile_image_url) : null,
    });

    return {
      hero: data.banners
        .filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'hero')
        .sort((a, b) => a.display_order - b.display_order)
        .map(process),
      mini: data.banners
        .filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'mini')
        .slice(0, 4)
        .map(process),
      promo: data.banners
        .filter(b => b.banner_type && String(b.banner_type).toLowerCase() === 'promo')
        .slice(0, 3)
        .map(process),
    };
  }, [data.banners, getFullUrl]);

  const bestsellers = useMemo(() => activeProducts.filter(p => p.is_best_seller).slice(0, 10), [activeProducts]);
  const featuredProducts = useMemo(() => activeProducts.filter(p => p.featured || p.is_new).slice(0, 10), [activeProducts]);
  const cityDeliveryProducts = useMemo(() => activeProducts.slice(0, 12), [activeProducts]);

  const activeCategories = useMemo(() =>
    data.categories
      .filter(cat => cat.is_active !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [data.categories]
  );

  const trustedBrandsLogos = ['intel.', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'GIGABYTE', 'CORSAIR', 'SAMSUNG', 'crucial', 'WD'];

  const showSkeleton = loading && data.products.length === 0 && data.categories.length === 0;
  if (showSkeleton) return <HomeSkeleton />;

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

      <main className="eronix-main-container container" style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
        <HeroBanner banners={processedBanners.hero} />

        <section className="home-quick-categories" aria-label="Shop by category">
          {data.categories
            .slice()
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .slice(0, 8)
            .map((category) => {
              const catSlug = safeSlug(category.slug, category.id);
              return (
                <Link className="home-quick-category-card" to={`/category/${catSlug}`} key={category.id}>
                  <div className="home-quick-category-image">
                    <img src={category.icon_url || category.image_url || defaultImg} alt={category.name} loading="lazy" onError={(e) => { e.currentTarget.src = defaultImg; }} />
                  </div>
                  <span className="home-quick-category-title">{category.name}</span>
                  <span className="home-quick-category-link">Explore Now</span>
                </Link>
              );
            })}
          <Link className="home-quick-category-card home-view-all-card" to="/search">
            <div className="home-view-all-icon" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
            <span className="home-quick-category-title">View All</span>
          </Link>
        </section>

        <section className="home-feature-promos" aria-label="Featured offers">
          <Link to="/gaming-zone" className="home-feature-promo-card"><img src={gamingZonePromo} alt="Gaming Zone" loading="lazy" /></Link>
          <Link to="/pc-build" className="home-feature-promo-card"><img src={buildPcPromo} alt="Build Your PC" loading="lazy" /></Link>
          <Link to="/contact" className="home-feature-promo-card"><img src={businessSolutionsPromo} alt="Business Solutions" loading="lazy" /></Link>
        </section>

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
            gearUpBgImage={gearUpBg}
          />
        ))}

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

        {/* ============ POPULAR SEARCHES (FIXED) ============ */}
        <div className="popular-searches white-bg">
          <div className="popular-search-container">
            <p className="search-heading">Popular searches on EronixTech</p>
            <div className="pwa-row pad-lr-0">
              {data.categories.map(category => {
                if (!category.sub_categories || category.sub_categories.length === 0) return null;

                const catSlug = safeSlug(category.slug, category.id);
                if (!catSlug) return null;

                return (
                  <div className="popular-search-wraper" key={category.id}>
                    <span className="category-heading">{category.name.toUpperCase()}:</span>
                    <div className="sub-categories">
                      {category.sub_categories.map(sub => {
                        // Build link with stable fallbacks:
                        // 1. Prefer `sub.id` as query param (matches CategorySection + backend filter)
                        // 2. Prefer `category.slug` as path
                        const subId = sub.id ?? sub.sub_category_id;
                        if (subId == null) return null;

                        const to = `/category/${catSlug}?sub=${subId}`;

                        return (
                          <span key={sub.id ?? sub.name}>
                            <Link to={to}>{sub.name}</Link>
                          </span>
                        );
                      })}
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
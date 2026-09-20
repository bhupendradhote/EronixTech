import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

// Layout & Components
import Layout from '../../../components/layout/Layout';
import HeroBanner from './HeroBanner';
import FeaturePromos from './FeaturePromos';
import PopupBanner from './PopupBanner';
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

const dedupeById = (list) => {
  const seen = new Set();
  return list.filter((item) => {
    if (!item || item.id == null || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// =============================================================
// Pagination config
// =============================================================

const PAGE_SIZE = 24;
const INITIAL_PAGE_COUNT = 2;
const CATEGORY_PAGE_STEP = 8;
const SECTION_PAGE_STEP = 8;
const SECTION_INITIAL_VISIBLE = 8;

// =============================================================
// Persistent cache
// =============================================================

const CACHE_KEY = 'eronix_home_cache_v5';
const CACHE_TTL = 5 * 60 * 1000;

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

const writeCache = (data, meta) => {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data, meta: meta || null })
    );
  } catch {}
};

const EMPTY_DATA = { products: [], categories: [], brands: [], banners: [] };

const getBootState = () => {
  const cached = readCache();
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL && cached.data;

  if (isFresh) {
    return {
      data: {
        products: cached.data.products || [],
        categories: cached.data.categories || [],
        brands: cached.data.brands || [],
        banners: cached.data.banners || [],
      },
      page: cached.meta?.page ?? INITIAL_PAGE_COUNT,
      hasMore: cached.meta?.hasMore ?? true,
      total: cached.meta?.total ?? null,
      fromCache: true,
    };
  }

  return { data: EMPTY_DATA, page: 0, hasMore: true, total: null, fromCache: false };
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
const ArrowRightIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
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
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  </Layout>
);

// =============================================================
// Load More — bottom variant
// =============================================================

const LoadMoreButton = memo(({ onClick, loading, label = 'Load More Products', disabled }) => (
  <div className="load-more-wrapper">
    <button
      type="button"
      className="load-more-btn"
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <span className="load-more-spinner" aria-hidden="true" />
          Loading…
        </>
      ) : (
        <>
          {label}
          <span className="load-more-arrow" aria-hidden="true">↓</span>
        </>
      )}
    </button>
  </div>
));

// =============================================================
// Load More — IN-SLIDER card tile
// =============================================================

const SliderLoadMoreCard = memo(({ onClick, loading, label = 'Load More', disabled, hint }) => (
  <button
    type="button"
    className={`slider-load-more-card ${loading ? 'is-loading' : ''}`}
    onClick={onClick}
    disabled={loading || disabled}
    aria-label={label}
  >
    <span className="slm-icon-wrap" aria-hidden="true">
      {loading ? <span className="slm-spinner" /> : <ArrowRightIcon />}
    </span>
    <span className="slm-title">{loading ? 'Loading…' : label}</span>
    {hint && <span className="slm-hint">{hint}</span>}
  </button>
));

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
// Product Slider — Load More card rendered INSIDE the slider
// =============================================================

const ProductSlider = memo(({
  id,
  containerClass = 'home-card-row',
  products,
  wishlist,
  ratingStats,
  categories,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  onAddToCompare,
  getProductImage,
  calculateDiscount,
  defaultImg,
  scrollContainer,
  initialVisible = SECTION_INITIAL_VISIBLE,
  step = SECTION_PAGE_STEP,
  onLoadMore,
  hasMoreFromApi,
  loadingMore,
  loadMoreLabel = 'Load More',
  loadMoreHint,
  emptyMessage = 'No products available.',
}) => {
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  const visible = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );

  const canRevealMore = products.length > visibleCount;
  const canFetchMore = !canRevealMore && !!hasMoreFromApi && products.length > 0;
  const showLoadMore = products.length > 0 && (canRevealMore || canFetchMore);
  const showArrows = visible.length > 4 || showLoadMore;

  const handleLoadMoreClick = useCallback(() => {
    if (canRevealMore) {
      setVisibleCount(v => v + step);
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
      });
      return;
    }
    if (canFetchMore && !loadingMore) {
      setVisibleCount(v => v + step);
      onLoadMore?.();
    }
  }, [canRevealMore, canFetchMore, loadingMore, onLoadMore, id, step]);

  if (products.length === 0) {
    return (
      <div className="no-products-message" style={{ padding: '20px', textAlign: 'center', width: '100%' }}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="slider-wrapper">
      {showArrows && (
        <button
          type="button"
          className="slider-btn left"
          onClick={() => scrollContainer(id, 'left')}
          aria-label="Scroll left"
        >‹</button>
      )}

      <div className={containerClass} id={id}>
        {visible.map(product => (
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
        ))}

        {showLoadMore && (
          <SliderLoadMoreCard
            onClick={handleLoadMoreClick}
            loading={loadingMore && !canRevealMore}
            label={loadMoreLabel}
            hint={loadMoreHint}
          />
        )}
      </div>

      {showArrows && (
        <button
          type="button"
          className="slider-btn right"
          onClick={() => scrollContainer(id, 'right')}
          aria-label="Scroll right"
        >›</button>
      )}
    </div>
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
  gearUpBgImage,
  onLoadMore,
  hasMoreProducts,
  loadingMore
}) => {
  const subCategoryIds = useMemo(
    () => (category.sub_categories || []).map(sub => Number(sub.id)),
    [category.sub_categories]
  );

  const allCategoryProducts = useMemo(() => {
    const catId = Number(category.id);
    return products.filter(p => {
      const pCatId = Number(p.category_id);
      if (pCatId) return pCatId === catId;
      const pSubId = Number(p.sub_category_id);
      return pSubId && subCategoryIds.includes(pSubId);
    });
  }, [products, category.id, subCategoryIds]);

  const subCats = category.sub_categories || [];
  const cardBackgrounds = ['#E6F2FE', '#EAE6FA', '#E2F4EA', '#FBEAE9', '#F9E6EF'];

  const categorySlug = category.slug || generateSlug(category.name);
  const categoryBrands = useMemo(() => (brands || []).slice(0, 8), [brands]);

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
              {categoryBrands.length > 0 ? (
                categoryBrands.map(brand => {
                  const brandSlug = brand.slug || generateSlug(brand.name || '');
                  return (
                    <Link
                      to={`/category?brand=${brandSlug}`}
                      className="img-brand-item"
                      key={brand.id ?? brand.name}
                    >
                      <img
                        src={brand.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name || 'B')}&background=random`}
                        alt={brand.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name || 'B')}&background=random`;
                        }}
                      />
                      <span>{brand.name}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="img-no-brands" style={{ gridColumn: '1 / -1', padding: '10px 0', fontSize: '13px', color: '#6B7280' }}>
                  No brands listed for this category yet.
                </div>
              )}
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
          <ProductSlider
            id={`grid-${category.id}`}
            containerClass="electrical-products"
            products={allCategoryProducts}
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
            scrollContainer={scrollContainer}
            initialVisible={CATEGORY_PAGE_STEP}
            step={CATEGORY_PAGE_STEP}
            onLoadMore={onLoadMore}
            hasMoreFromApi={hasMoreProducts}
            loadingMore={loadingMore}
            loadMoreLabel="Load More"
            emptyMessage="No products available in this category yet."
          />
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

  const bootRef = useRef(undefined);
  if (bootRef.current === undefined) {
    bootRef.current = getBootState();
  }
  const boot = bootRef.current;

  const [data, setData] = useState(boot.data);
  const [loading, setLoading] = useState(!boot.fromCache);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(boot.hasMore);
  const [totalProducts, setTotalProducts] = useState(boot.total);
  const [ratingStats, setRatingStats] = useState({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const abortRef = useRef(null);
  const pageRef = useRef(boot.page);
  const hasMoreRef = useRef(boot.hasMore);
  const totalRef = useRef(boot.total);
  const loadingMoreRef = useRef(false);

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
    String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
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

  // ---------- Initial data fetch ----------
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    abortRef.current = controller;

    const fetchPage = async (pageNum) => {
      try {
        return await productService.getAllProducts({
          activeOnly: true,
          limit: PAGE_SIZE,
          page: pageNum,
        });
      } catch (err) {
        if (err?.name !== 'CanceledError') {
          console.error(`[Home] products page ${pageNum} failed:`, err?.message || err);
        }
        return null;
      }
    };

    const run = async () => {
      const pageNumbers = Array.from({ length: INITIAL_PAGE_COUNT }, (_, i) => i + 1);

      const [productResults, categoriesRes, brandsRes, bannersRes] = await Promise.all([
        Promise.all(pageNumbers.map(fetchPage)),
        categoryService.getAllCategories(true, true).catch(() => []),
        brandService.getAllBrands(true).catch(() => []),
        bannerService.getAllBanners(true).catch(() => []),
      ]);

      if (signal.aborted) return;

      let products = [];
      let total = null;
      let lastPageFull = false;

      productResults.forEach((res, idx) => {
        const arr = extractArray(res);
        products = products.concat(arr);
        const t = extractTotal(res);
        if (t != null) total = t;
        if (idx === productResults.length - 1) lastPageFull = arr.length >= PAGE_SIZE;
      });

      products = dedupeById(products);

      const nextData = {
        products,
        categories: extractArray(categoriesRes),
        brands: extractArray(brandsRes),
        banners: extractArray(bannersRes),
      };

      const more = total != null ? products.length < total : lastPageFull;

      pageRef.current = INITIAL_PAGE_COUNT;
      hasMoreRef.current = more;
      totalRef.current = total;

      setData(nextData);
      setHasMore(more);
      setTotalProducts(total);
      setLoading(false);

      writeCache(nextData, { page: INITIAL_PAGE_COUNT, hasMore: more, total });

      console.log('[Home] Data ready:', {
        products: nextData.products.length,
        categories: nextData.categories.length,
        brands: nextData.brands.length,
        banners: nextData.banners.length,
        total,
        hasMore: more,
      });
    };

    run().catch((err) => {
      if (err?.name !== 'CanceledError') console.error('[Home] fetchData failed:', err);
      if (!signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, []);

  // ---------- Load more ----------
  const handleLoadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    const nextPage = pageRef.current + 1;

    try {
      const res = await productService.getAllProducts({
        activeOnly: true,
        limit: PAGE_SIZE,
        page: nextPage,
      });

      const list = extractArray(res);
      const total = extractTotal(res) ?? totalRef.current;

      pageRef.current = nextPage;
      totalRef.current = total;

      const more = total != null
        ? nextPage * PAGE_SIZE < total
        : list.length >= PAGE_SIZE;

      hasMoreRef.current = more;
      setHasMore(more);
      if (total != null) setTotalProducts(total);

      setData((prev) => {
        const seen = new Set(prev.products.map((p) => p.id));
        const merged = prev.products.concat(list.filter((p) => p && !seen.has(p.id)));
        const nextData = { ...prev, products: merged };
        writeCache(nextData, { page: nextPage, hasMore: more, total });
        return nextData;
      });

      if (list.length === 0 && more) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch (err) {
      if (err?.name !== 'CanceledError') {
        showToast(err.response?.data?.message || 'Failed to load more products', 'error');
      }
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [showToast]);

  // ---------- Ratings ----------
  useEffect(() => {
    if (data.products.length === 0) return;

    let isMounted = true;

    const fetchRatings = async () => {
      const ids = data.products
        .filter((p) => ratingStats[p.id] === undefined)
        .slice(0, 200)
        .map((p) => p.id);

      if (ids.length === 0) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.products]);

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
    () => data.products.filter(p => p.status === 'active' || p.status === undefined),
    [data.products]
  );

  const processedBanners = useMemo(() => {
    const process = (b) => ({
      ...b,
      image_url: getFullUrl(b.image_url),
      mobile_image_url: b.mobile_image_url ? getFullUrl(b.mobile_image_url) : null,
    });

    const byType = (type) =>
      data.banners
        .filter(b =>
          b.banner_type &&
          String(b.banner_type).toLowerCase() === type &&
          b.is_active !== false
        )
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(process);

    return {
      hero: byType('hero'),
      promo: byType('promotional'),
      popup: byType('popup'),
      mini: byType('mini').slice(0, 4),
    };
  }, [data.banners, getFullUrl]);

  const bestsellers = useMemo(
    () => activeProducts.filter(p => p.is_best_seller),
    [activeProducts]
  );
  const featuredProducts = useMemo(
    () => activeProducts.filter(p => p.featured || p.is_new),
    [activeProducts]
  );
  const newArrivals = useMemo(() => activeProducts, [activeProducts]);

  const activeCategories = useMemo(() =>
    data.categories
      .filter(cat => cat.is_active !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [data.categories]
  );

  const brandsByCategory = useMemo(() => {
    const result = {};
    const brandIndex = new Map((data.brands || []).map(b => [String(b.id), b]));

    const resolveBrandFromProduct = (product) => {
      const id = product.brand_id ?? product.brand?.id;
      if (id == null) return null;
      const key = String(id);
      const known = brandIndex.get(key);
      if (known) return { key, brand: known };

      const name = product.brand_name || product.brand?.name || 'Brand';
      return {
        key,
        brand: {
          id,
          name,
          slug: product.brand_slug || product.brand?.slug || generateSlug(name),
          logo_url: product.brand_logo || product.brand?.logo_url || null,
        },
      };
    };

    activeCategories.forEach((category) => {
      const catId = String(category.id);
      const subIds = (category.sub_categories || []).map(s => String(s.id));
      const seen = new Map();

      data.products.forEach((product) => {
        if (!product) return;

        const pCatId = product.category_id != null ? String(product.category_id) : null;
        const pSubId = product.sub_category_id != null ? String(product.sub_category_id) : null;

        let belongs = false;
        if (pCatId) belongs = pCatId === catId;
        else if (pSubId) belongs = subIds.includes(pSubId);
        if (!belongs) return;

        const resolved = resolveBrandFromProduct(product);
        if (!resolved) return;
        if (!seen.has(resolved.key)) seen.set(resolved.key, resolved.brand);
      });

      result[catId] = Array.from(seen.values());
    });

    return result;
  }, [data.products, data.brands, activeCategories, generateSlug]);

  const trustedBrandsLogos = ['intel.', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'GIGABYTE', 'CORSAIR', 'SAMSUNG', 'crucial', 'WD'];

  const showSkeleton = loading && data.products.length === 0 && data.categories.length === 0;
  if (showSkeleton) return <HomeSkeleton />;

  const loadedCount = activeProducts.length;
  const showingAll = totalProducts != null && loadedCount >= totalProducts;

  return (
    <Layout>
      {/* ============ POPUP BANNER — top-right, no overlay ============ */}
      <PopupBanner banners={processedBanners.popup} maxItems={1} />

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

        /* ============================================================
           POPUP BANNER — top-right corner, no overlay, smooth slide-in
           ============================================================ */
        .popup-banner-root {
          position: fixed;
          top: 84px;              /* clears a typical sticky header */
          right: 20px;
          z-index: 9000;
          pointer-events: none;   /* let clicks pass through the wrapper */
          will-change: transform, opacity;
        }
        .popup-banner-root.is-entering {
          animation: popupSlideIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .popup-banner-root.is-leaving {
          animation: popupSlideOut 0.32s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes popupSlideIn {
          0%   { opacity: 0; transform: translate3d(60px, -8px, 0) scale(0.96); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes popupSlideOut {
          0%   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          100% { opacity: 0; transform: translate3d(60px, -6px, 0) scale(0.97); }
        }

        .popup-banner-card {
          pointer-events: auto;   /* re-enable for the card itself */
          position: relative;
          width: 320px;
          max-width: calc(100vw - 40px);
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 10px 30px rgba(11, 18, 32, 0.14),
            0 3px 10px rgba(11, 18, 32, 0.08);
          border: 1px solid rgba(11, 18, 32, 0.06);
        }

        .popup-banner-media {
          display: block;
          width: 100%;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          background: #f5f7fa;
        }
        .popup-banner-media img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 420px;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .popup-banner-media:hover img {
          transform: scale(1.02);
        }

        .popup-banner-close {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 3;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          transition: transform 0.25s ease, background 0.2s ease, color 0.2s ease;
        }
        .popup-banner-close:hover {
          background: #009DFF;
          color: #fff;
          transform: rotate(90deg);
        }
        .popup-banner-close:active {
          transform: rotate(90deg) scale(0.92);
        }

        .popup-banner-dots {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          padding: 5px 9px;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 999px;
          z-index: 2;
        }
        .popup-banner-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.55);
          cursor: pointer;
          padding: 0;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .popup-banner-dot.active {
          background: #fff;
          transform: scale(1.2);
        }

        /* ============================================================
           IN-SLIDER Load More card
           ============================================================ */
        .slider-load-more-card {
          flex: 0 0 auto;
          width: 230px;
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(160deg, #F3F9FF 0%, #E6F2FE 100%);
          border: 2px dashed var(--eronix-primary-blue, #009DFF);
          border-radius: 12px;
          color: var(--eronix-primary-blue, #009DFF);
          cursor: pointer;
          padding: 22px 18px;
          text-align: center;
          font-family: inherit;
          transition: transform .2s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease;
          position: relative;
          overflow: hidden;
        }
        .slider-load-more-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 40%, rgba(0,157,255,0.10), transparent 65%);
          opacity: 0;
          transition: opacity .25s ease;
          pointer-events: none;
        }
        .slider-load-more-card:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(0,157,255,.22);
          background: linear-gradient(160deg, #E6F2FE 0%, #DCEBFF 100%);
        }
        .slider-load-more-card:hover:not(:disabled)::before { opacity: 1; }
        .slider-load-more-card:active:not(:disabled) { transform: translateY(0); }
        .slider-load-more-card:disabled { cursor: not-allowed; opacity: .75; }
        .slider-load-more-card.is-loading { border-style: solid; }

        .slm-icon-wrap {
          width: 54px; height: 54px; border-radius: 50%;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 16px rgba(0,157,255,.18);
          color: var(--eronix-primary-blue, #009DFF);
          transition: transform .25s ease, background .25s ease, color .25s ease;
          position: relative;
          z-index: 1;
        }
        .slider-load-more-card:hover:not(:disabled) .slm-icon-wrap {
          background: var(--eronix-primary-blue, #009DFF);
          color: #fff;
          transform: scale(1.06);
        }
        .slm-title {
          font-size: 14.5px;
          font-weight: 800;
          letter-spacing: .4px;
          line-height: 1.25;
          position: relative;
          z-index: 1;
        }
        .slm-hint {
          font-size: 11.5px;
          font-weight: 500;
          color: #4B5563;
          letter-spacing: .3px;
          position: relative;
          z-index: 1;
        }
        .slm-spinner {
          width: 22px; height: 22px; border-radius: 50%;
          border: 3px solid currentColor;
          border-top-color: transparent;
          animation: lmSpin .7s linear infinite;
        }
        .electrical-products .slider-load-more-card {
          width: 210px;
          min-height: 340px;
        }

        /* ---------- Bottom (global) Load More ---------- */
        .load-more-wrapper {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; margin: 22px 0 8px; width: 100%;
        }
        .load-more-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          min-width: 220px; padding: 12px 34px; border-radius: 999px;
          border: 1.5px solid var(--eronix-primary-blue, #009DFF);
          background: #fff; color: var(--eronix-primary-blue, #009DFF);
          font-size: 14px; font-weight: 700; letter-spacing: .3px;
          cursor: pointer; transition: background .25s ease, color .25s ease, box-shadow .25s ease, transform .15s ease;
        }
        .load-more-btn:hover:not(:disabled) {
          background: var(--eronix-primary-blue, #009DFF); color: #fff;
          box-shadow: 0 8px 20px rgba(0,157,255,.28);
        }
        .load-more-btn:active:not(:disabled) { transform: translateY(1px); }
        .load-more-btn:disabled { opacity: .65; cursor: not-allowed; }
        .load-more-arrow { font-size: 15px; line-height: 1; }
        .load-more-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid currentColor; border-top-color: transparent;
          animation: lmSpin .7s linear infinite;
        }
        .load-more-meta { font-size: 12.5px; color: #6B7280; letter-spacing: .2px; }
        @keyframes lmSpin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .popular-search-wraper { flex-direction: column; align-items: flex-start; gap: 4px; }
          .category-heading { min-width: auto; }
          .sub-categories { gap: 4px 12px; }
          .load-more-btn { width: 100%; min-width: 0; }
          .slider-load-more-card { width: 190px; min-height: 320px; }

          /* Popup responsive — still top-right, tighter */
          .popup-banner-root {
            top: 70px;
            right: 12px;
            left: 12px;
          }
          .popup-banner-card {
            width: 100%;
            max-width: 100%;
            border-radius: 12px;
          }
          .popup-banner-media img { max-height: 320px; }
          .popup-banner-close { width: 28px; height: 28px; top: 6px; right: 6px; }
        }
        @media (max-width: 380px) {
          .popup-banner-media img { max-height: 260px; }
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

        <FeaturePromos banners={processedBanners.promo} maxItems={3} />

        {newArrivals.length > 0 && (
          <div className="delivery-cities-section">
            <div className="delivery-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg> New Arrivals
              </h2>
            </div>
            <ProductSlider
              id="citiesGrid"
              containerClass="cities-grid"
              products={newArrivals}
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
              scrollContainer={scrollContainer}
              initialVisible={SECTION_INITIAL_VISIBLE}
              step={SECTION_PAGE_STEP}
              onLoadMore={handleLoadMore}
              hasMoreFromApi={hasMore}
              loadingMore={loadingMore}
              loadMoreLabel="Load More"
              loadMoreHint="New Arrivals"
            />
          </div>
        )}

        {bestsellers.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2>BESTSELLERS</h2>
              <Link className="view-all" to="/search?sort=bestseller">View All →</Link>
            </div>
            <ProductSlider
              id="bestsellersGrid"
              containerClass="home-card-row"
              products={bestsellers}
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
              scrollContainer={scrollContainer}
              initialVisible={SECTION_INITIAL_VISIBLE}
              step={SECTION_PAGE_STEP}
              onLoadMore={handleLoadMore}
              hasMoreFromApi={hasMore}
              loadingMore={loadingMore}
              loadMoreLabel="Load More"
              loadMoreHint="Bestsellers"
            />
          </div>
        )}

        {activeCategories.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            products={activeProducts}
            brands={brandsByCategory[String(category.id)] || []}
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
            onLoadMore={handleLoadMore}
            hasMoreProducts={hasMore}
            loadingMore={loadingMore}
          />
        ))}

        {featuredProducts.length > 0 && (
          <div className="section">
            <div className="section-head">
              <h2>FEATURED ARRIVALS</h2>
              <Link className="view-all" to="/search?sort=new">VIEW ALL →</Link>
            </div>
            <ProductSlider
              id="featuredGrid"
              containerClass="home-card-row"
              products={featuredProducts}
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
              scrollContainer={scrollContainer}
              initialVisible={SECTION_INITIAL_VISIBLE}
              step={SECTION_PAGE_STEP}
              onLoadMore={handleLoadMore}
              hasMoreFromApi={hasMore}
              loadingMore={loadingMore}
              loadMoreLabel="Load More"
              loadMoreHint="Featured"
            />
          </div>
        )}

        {activeProducts.length > 0 && (hasMore || loadingMore) && (
          <div className="load-more-wrapper">
            <LoadMoreButton
              onClick={handleLoadMore}
              loading={loadingMore}
              label="Load More Products"
              disabled={!hasMore}
            />
            <span className="load-more-meta">
              Showing {loadedCount}
              {totalProducts != null ? ` of ${totalProducts}` : ''} products
            </span>
          </div>
        )}

        {activeProducts.length > 0 && !hasMore && showingAll && (
          <div className="load-more-wrapper">
            <span className="load-more-meta">You've reached the end — {loadedCount} products loaded.</span>
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
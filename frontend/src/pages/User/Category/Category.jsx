import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  FiGrid, FiList, FiFilter, FiChevronRight, FiChevronLeft,
  FiStar, FiHeart, FiShoppingCart, FiX, FiEye, FiRefreshCw
} from 'react-icons/fi';
import Layout from '../../../components/layout/Layout';
import './Category.css';
import categoryService from '../../../services/categoryService';
import subCategoryService from '../../../services/subCategoryService';
import productService from '../../../services/productService';
import brandService from '../../../services/brandService';
import wishlistService from '../../../services/wishlistService';
import cartService from '../../../services/cartService';
import reviewService from '../../../services/reviewService';

import AuthModal from '../../User/Auth/AuthModal';

const PRODUCTS_PER_PAGE = 12;

const Category = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Data State ---
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [ratingStats, setRatingStats] = useState({});
  const [brandsList, setBrandsList] = useState([]);

  // --- Loading States ---
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // --- Pagination (Load-More style) ---
  const [currentPage, setCurrentPage] = useState(1);      // last loaded page
  const [hasMore, setHasMore] = useState(true);           // more pages exist?
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  // --- Filter & UI State ---
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // --- Auth & Toast ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [toastMessage, setToastMessage] = useState(null);

  const subcategoryRef = useRef(null);
  const abortRef = useRef(null);
  const ratingFetchedRef = useRef(new Set());

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollLeft = () => subcategoryRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  const scrollRight = () => subcategoryRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

  // 1. Fetch Categories, Brands & Wishlist on mount
  useEffect(() => {
    const fetchAppShell = async () => {
      try {
        const [cats, brands] = await Promise.all([
          categoryService.getAllCategories(true, true),
          brandService.getAllBrands(true)
        ]);

        if (cats.length === 0) return setError('No categories found');
        setCategories(cats);
        setBrandsList(brands);
        setAvailableBrands(brands.map(b => b.name));

        if (localStorage.getItem('token')) {
          wishlistService.getWishlist().then(items => {
            setWishlist(items.map(item => item.id));
          }).catch(() => {});
        }
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setIsInitialLoad(false);
      }
    };
    fetchAppShell();
  }, []);

  // 2. Set current category from URL slug
  useEffect(() => {
    if (categories.length === 0) return;
    const matchedCategory = categories.find(cat => cat.slug === categorySlug);

    if (!matchedCategory) {
      navigate(`/category/${categories[0].slug}`, { replace: true });
      return;
    }

    if (currentCategory?.id !== matchedCategory.id) {
      setCurrentCategory(matchedCategory);
      setSelectedBrands([]);
      setInStockOnly(false);
      setSortBy('popular');
      // Reset pagination for the new category
      setCurrentPage(1);
      setHasMore(true);
      setAllProducts([]);
      setRatingStats({});
      ratingFetchedRef.current = new Set();

      if (matchedCategory.sub_categories?.length) {
        setSubCategories(matchedCategory.sub_categories);
      } else {
        subCategoryService
          .getSubCategoriesByCategory(matchedCategory.id, true)
          .then(setSubCategories)
          .catch(() => {});
      }
    }
  }, [categorySlug, categories, navigate, currentCategory]);

  useEffect(() => {
    setSelectedSubCategory(searchParams.get('sub') || 'all');
  }, [searchParams]);

  // 3. Fetch products (initial page OR subsequent pages)
  //    When currentPage === 1 → replace products
  //    When currentPage  > 1 → append products
  useEffect(() => {
    if (!currentCategory) return;

    if (abortRef.current) abortRef.current.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    const isFirstPage = currentPage === 1;
    if (isFirstPage) setIsFetchingProducts(true);
    else setIsLoadingMore(true);

    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts({
          categoryId: currentCategory.id,
          activeOnly: true,
          status: 'active',
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
          subCategoryId: selectedSubCategory !== 'all' ? selectedSubCategory : undefined
        });

        if (abortController.signal.aborted) return;

        const newItems = response.data || [];

        setAllProducts(prev => {
          if (isFirstPage) return newItems;
          // Dedupe when appending
          const existingIds = new Set(prev.map(p => p.id));
          return prev.concat(newItems.filter(p => !existingIds.has(p.id)));
        });

        // Pagination meta
        if (response.pagination) {
          const total = response.pagination.total ?? 0;
          const totalPages = response.pagination.totalPages ?? Math.ceil(total / PRODUCTS_PER_PAGE);
          setTotalProductsCount(total);
          setHasMore(currentPage < totalPages);
        } else {
          // Fallback if backend doesn't return pagination
          setHasMore(newItems.length >= PRODUCTS_PER_PAGE);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          if (isFirstPage) setError('Failed to load products');
          else showToast('Failed to load more products');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsFetchingProducts(false);
          setIsLoadingMore(false);
        }
      }
    };

    fetchProducts();
    return () => abortController.abort();
  }, [currentCategory, currentPage, selectedSubCategory]);

  // 4. Fetch ratings for newly loaded products (parallel)
  useEffect(() => {
    if (allProducts.length === 0) return;

    const toFetch = allProducts.filter(p => !ratingFetchedRef.current.has(p.id));
    if (toFetch.length === 0) return;

    let isMounted = true;
    toFetch.forEach(p => ratingFetchedRef.current.add(p.id));

    const fetchRatings = async () => {
      const promises = toFetch.map(async (product) => {
        try {
          const stats = await reviewService.getReviewStats(product.id);
          if (isMounted) {
            setRatingStats(prev => ({ ...prev, [product.id]: stats }));
          }
        } catch {}
      });
      await Promise.allSettled(promises);
    };

    fetchRatings();
    return () => { isMounted = false; };
  }, [allProducts]);

  // 5. Local filters & sorting (applied to all loaded products)
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(p => p.sub_category_id === parseInt(selectedSubCategory));
    }

    filtered = filtered.filter(
      p => p.selling_price >= priceRange.min && p.selling_price <= priceRange.max
    );

    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock_status === 'in_stock' && p.stock_quantity > 0);
    }

    if (selectedBrands.length > 0) {
      const selectedBrandIds = brandsList
        .filter(b => selectedBrands.includes(b.name))
        .map(b => b.id);
      filtered = filtered.filter(p => selectedBrandIds.includes(p.brand_id));
    }

    switch (sortBy) {
      case 'price_low':
        return filtered.sort((a, b) => a.selling_price - b.selling_price);
      case 'price_high':
        return filtered.sort((a, b) => b.selling_price - a.selling_price);
      case 'discount':
        return filtered.sort((a, b) => {
          const d1 = a.mrp ? ((a.mrp - a.selling_price) / a.mrp) * 100 : 0;
          const d2 = b.mrp ? ((b.mrp - b.selling_price) / b.mrp) * 100 : 0;
          return d2 - d1;
        });
      default:
        return filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }
  }, [allProducts, selectedSubCategory, sortBy, priceRange, inStockOnly, selectedBrands, brandsList]);

  // --- Actions ---
  const handleSubCategoryChange = (subId) => {
    setCurrentPage(1);
    setHasMore(true);
    setAllProducts([]);
    setRatingStats({});
    ratingFetchedRef.current = new Set();
    setSearchParams(subId === 'all' ? {} : { sub: subId });
  };

  const getBrandName = (brandId) =>
    brandsList.find(b => b.id === brandId)?.name || 'Generic';

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem('token')) return setIsAuthModalOpen(true);

    const isWishlisted = wishlist.includes(productId);
    setWishlist(prev =>
      isWishlisted ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(productId);
        showToast('Item removed');
      } else {
        await wishlistService.addToWishlist(productId);
        showToast('Added to wishlist ❤️');
      }
    } catch (error) {
      setWishlist(prev =>
        isWishlisted ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      if (error.response?.status === 401) setIsAuthModalOpen(true);
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem('token')) return setIsAuthModalOpen(true);
    try {
      await cartService.addToCart(productId, 1);
      showToast('Added to cart! 🛒');
    } catch (error) {
      if (error.response?.status === 401) setIsAuthModalOpen(true);
    }
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setHasMore(true);
    setAllProducts([]);
    setRatingStats({});
    ratingFetchedRef.current = new Set();
    setSearchParams({});
    setPriceRange({ min: 0, max: 100000 });
    setInStockOnly(false);
    setSelectedBrands([]);
    setSortBy('popular');
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setCurrentPage(prev => prev + 1);
  };

  if (error) return (
    <Layout>
      <div className="container py-5 text-center">
        <h2>Error: {error}</h2>
        <button className="btn-primary mt-3" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </Layout>
  );

  if (isInitialLoad) return (
    <Layout>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #E8EDF5', borderTop: '4px solid #009DFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="category-page">
        {toastMessage && <div className="toast-notification">{toastMessage}</div>}
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            authType={authType}
            setAuthType={setAuthType}
          />
        )}

        {/* Hero Section */}
        <div className="category-hero">
          <img
            src={currentCategory?.banner_url || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&h=300&fit=crop'}
            alt={currentCategory?.name || 'Category'}
            loading="lazy"
          />
          <div className="hero-overlay">
            <div className="container">
              <h1>{currentCategory?.name}</h1>
              <div className="breadcrumb">
                <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
                <FiChevronRight />
                <span className="active">{currentCategory?.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container category-container">
          {/* Subcategory Slider */}
          {subCategories.length > 0 && (
            <div className="subcategory-scroll-wrapper">
              <button className="scroll-btn left" onClick={scrollLeft}><FiChevronLeft /></button>
              <div className="subcategory-top-bar" ref={subcategoryRef}>
                <div
                  className={`subcategory-card ${selectedSubCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleSubCategoryChange('all')}
                >
                  <div className="subcategory-img-container"><FiGrid size={32} color="#333" /></div>
                  <span className="subcategory-title">All {currentCategory?.name}</span>
                </div>
                {subCategories.map(sub => (
                  <div
                    key={sub.id}
                    className={`subcategory-card ${selectedSubCategory === String(sub.id) ? 'active' : ''}`}
                    onClick={() => handleSubCategoryChange(String(sub.id))}
                  >
                    <div className="subcategory-img-container">
                      <img
                        src={sub.icon_url || 'https://via.placeholder.com/100x70?text=Logo'}
                        alt={sub.name}
                        className="subcategory-img"
                        loading="lazy"
                      />
                    </div>
                    <span className="subcategory-title">{sub.name}</span>
                  </div>
                ))}
              </div>
              <button className="scroll-btn right" onClick={scrollRight}><FiChevronRight /></button>
            </div>
          )}

          <button className="mobile-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> Filters
          </button>

          <div className={`category-layout ${showFilters ? 'filters-open' : ''}`}>

            {/* Sidebar */}
            <aside className="category-sidebar">
              <div className="filter-header">
                <h3>Filters</h3>
                <div className="header-actions">
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    <FiRefreshCw size={12} /> Clear All
                  </button>
                  <button className="close-filters" onClick={() => setShowFilters(false)}><FiX /></button>
                </div>
              </div>

              <div className="filter-section">
                <h4>Categories</h4>
                <ul className="category-list">
                  {categories.map(cat => (
                    <li
                      key={cat.id}
                      className={currentCategory?.id === cat.id ? 'active' : ''}
                      onClick={() => navigate(`/category/${cat.slug}`)}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="filter-section">
                <h4>Brands</h4>
                <div className="checkbox-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {availableBrands.map(brandName => (
                    <label key={brandName} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brandName)}
                        onChange={() =>
                          setSelectedBrands(p =>
                            p.includes(brandName)
                              ? p.filter(b => b !== brandName)
                              : [...p, brandName]
                          )
                        }
                      />
                      <span>{brandName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Price Range</h4>
                <div className="price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))
                      }
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100000 }))
                      }
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))
                    }
                    className="price-slider"
                  />
                </div>
              </div>

              <div className="filter-section">
                <h4>Availability</h4>
                <div className="checkbox-list">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={() => setInStockOnly(!inStockOnly)}
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Main Products Area */}
            <main className="category-main">
              <div className="category-toolbar">
                <div className="results-count">
                  Showing <strong>{filteredProducts.length}</strong> products
                  {totalProductsCount > 0 && <span> (out of {totalProductsCount})</span>}
                </div>
                <div className="toolbar-actions">
                  <div className="sort-options">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="popular">Most Popular</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="discount">Biggest Discount</option>
                    </select>
                  </div>
                  <div className="view-toggle">
                    <button
                      className={viewMode === 'grid' ? 'active' : ''}
                      onClick={() => setViewMode('grid')}
                    ><FiGrid /></button>
                    <button
                      className={viewMode === 'list' ? 'active' : ''}
                      onClick={() => setViewMode('list')}
                    ><FiList /></button>
                  </div>
                </div>
              </div>

              {/* Initial loading skeleton */}
              {isFetchingProducts && allProducts.length === 0 && (
                <div className={`products-${viewMode} loading-skeleton`}>
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: '350px',
                        backgroundColor: '#f0f2f5',
                        borderRadius: '8px',
                        animation: 'pulse 1.5s infinite'
                      }}
                    ></div>
                  ))}
                  <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
                </div>
              )}

              {/* Products */}
              {!isFetchingProducts && (
                <div className={`products-${viewMode}`}>
                  {filteredProducts.map(product => {
                    const discountPercent = product.mrp
                      ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
                      : 0;
                    const isInStock = product.stock_status === 'in_stock' && product.stock_quantity > 0;
                    const stats = ratingStats[product.id];
                    const productRating = stats?.averageRating > 0 ? stats.averageRating : 0;
                    const reviewCount = stats?.totalReviews || 0;

                    return (
                      <div key={product.id} className={`product-card ${viewMode}-card`}>
                        <div className="product-badge">
                          {discountPercent >= 50 && <span className="badge-discount">{discountPercent}% OFF</span>}
                          {product.is_new && <span className="badge-new">NEW</span>}
                        </div>

                        <div className="product-image">
                          <Link to={`/product/${product.slug || product.id}`} className="product-img-link">
                            <img
                              src={product.images && product.images.length > 0 ? product.images[0].image_path : 'https://via.placeholder.com/500'}
                              alt={product.name}
                              loading="lazy"
                            />
                          </Link>
                          <button
                            className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                            onClick={(e) => toggleWishlist(e, product.id)}
                          >
                            <FiHeart />
                          </button>
                          <div className="quick-view-overlay">
                            <Link
                              to={`/product/${product.slug || product.id}`}
                              className="quick-view-btn-link quick-view-btn"
                            >
                              <FiEye /> Quick View
                            </Link>
                          </div>
                        </div>

                        <div className="product-details">
                          <div className="product-brand">{getBrandName(product.brand_id)}</div>
                          <Link to={`/product/${product.slug || product.id}`} className="product-title-link">
                            <h4 className="product-title">{product.name}</h4>
                          </Link>
                          <div className="product-rating">
                            <div className="stars">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={i < Math.floor(productRating) ? 'filled' : ''} />
                              ))}
                            </div>
                            <span className="review-count">({reviewCount})</span>
                          </div>
                          <div className="product-price">
                            <span className="current-price">₹{product.selling_price?.toLocaleString()}</span>
                            {product.mrp > product.selling_price && (
                              <>
                                <span className="original-price">₹{product.mrp?.toLocaleString()}</span>
                                <span className="discount">{discountPercent}% off</span>
                              </>
                            )}
                          </div>
                          <div className="product-actions">
                            <button
                              className="add-to-cart"
                              disabled={!isInStock}
                              onClick={(e) => handleAddToCart(e, product.id)}
                            >
                              <FiShoppingCart size={16} /> {isInStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {!isFetchingProducts && filteredProducts.length === 0 && (
                <div className="no-products">
                  <FiX size={48} />
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or clearing them to see more results.</p>
                  <button className="btn-outline-primary mt-3" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* ============ LOAD MORE ============ */}
              {!isFetchingProducts && filteredProducts.length > 0 && (
                <div className="load-more-section">
                  {hasMore ? (
                    <button
                      type="button"
                      className="load-more-btn"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <span className="load-more-spinner" aria-hidden="true" />
                          Loading…
                        </>
                      ) : (
                        <>
                          Load More Products
                          <span className="load-more-arrow" aria-hidden="true">↓</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="load-more-end">
                      You've reached the end · {filteredProducts.length} product
                      {filteredProducts.length !== 1 ? 's' : ''} shown
                    </p>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Load More styles — safe to keep inline; move to Category.css if preferred */}
      <style>{`
        .load-more-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 32px 0 8px;
          width: 100%;
        }
        .load-more-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 220px;
          padding: 12px 34px;
          border-radius: 999px;
          border: 1.5px solid #009DFF;
          background: #fff;
          color: #009DFF;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: background .25s ease, color .25s ease, box-shadow .25s ease, transform .15s ease;
        }
        .load-more-btn:hover:not(:disabled) {
          background: #009DFF;
          color: #fff;
          box-shadow: 0 8px 20px rgba(0, 157, 255, 0.28);
        }
        .load-more-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .load-more-btn:disabled {
          opacity: .7;
          cursor: not-allowed;
        }
        .load-more-arrow {
          font-size: 15px;
          line-height: 1;
        }
        .load-more-spinner {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid currentColor;
          border-top-color: transparent;
          animation: lmSpin .7s linear infinite;
        }
        @keyframes lmSpin {
          to { transform: rotate(360deg); }
        }
        .load-more-end {
          font-size: 13px;
          color: #6B7280;
          letter-spacing: 0.2px;
          margin: 0;
        }
        @media (max-width: 640px) {
          .load-more-btn {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Category;
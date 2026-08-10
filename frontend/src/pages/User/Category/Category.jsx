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

  // --- Loading States (Separated for speed) ---
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [error, setError] = useState(null);

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

  // --- Pagination (Server-Side 10-12 limit) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const productsPerPage = 12;

  const subcategoryRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollLeft = () => subcategoryRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  const scrollRight = () => subcategoryRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

  // 1. Fetch Categories, Brands & Wishlist INSTANTLY on Mount
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

        // Background Wishlist Fetch (Doesn't block UI)
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

  // 2. Set Current Category from URL Slug
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
      setCurrentPage(1);

      if (matchedCategory.sub_categories?.length) {
        setSubCategories(matchedCategory.sub_categories);
      } else {
        subCategoryService.getSubCategoriesByCategory(matchedCategory.id, true).then(setSubCategories).catch(() => {});
      }
    }
  }, [categorySlug, categories, navigate, currentCategory]);

  useEffect(() => {
    setSelectedSubCategory(searchParams.get('sub') || 'all');
  }, [searchParams]);

  // 3. Fetch SERVER-SIDE Paginated Products (With AbortController for speed)
  useEffect(() => {
    if (!currentCategory) return;
    
    const abortController = new AbortController();
    setIsFetchingProducts(true);

    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts({
          categoryId: currentCategory.id,
          activeOnly: true,
          status: 'active',
          page: currentPage,
          limit: productsPerPage,
          // Note: If you eventually add these params to your backend, they will automatically work!
          subCategoryId: selectedSubCategory !== 'all' ? selectedSubCategory : undefined
        });

        if (abortController.signal.aborted) return;

        setAllProducts(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalProductsCount(response.pagination.total);
        }
      } catch (err) {
        if (!abortController.signal.aborted) setError('Failed to load products');
      } finally {
        if (!abortController.signal.aborted) setIsFetchingProducts(false);
      }
    };

    fetchProducts();
    return () => abortController.abort(); // Cancel request if user clicks next page fast
  }, [currentCategory, currentPage, selectedSubCategory]);

  // 4. Background Parallel Ratings Fetch (Prevents waterfall delays)
  useEffect(() => {
    if (allProducts.length === 0) return;
    let isMounted = true;

    const fetchRatings = async () => {
      // Fire all 12 requests concurrently! Huge speed boost.
      const ratingPromises = allProducts.map(async (product) => {
        try {
          const stats = await reviewService.getReviewStats(product.id);
          if (isMounted) {
            setRatingStats(prev => ({ ...prev, [product.id]: stats }));
          }
        } catch (err) {}
      });
      await Promise.allSettled(ratingPromises);
    };

    fetchRatings();
    return () => { isMounted = false; };
  }, [allProducts]);

  // 5. Memoized Local Filters (Calculates strictly when dependencies change)
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];
    
    // Subcategory is now primarily handled by URL/API, but kept here as fallback
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(p => p.sub_category_id === parseInt(selectedSubCategory));
    }
    
    filtered = filtered.filter(p => p.selling_price >= priceRange.min && p.selling_price <= priceRange.max);
    
    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock_status === 'in_stock' && p.stock_quantity > 0);
    }
    
    if (selectedBrands.length > 0) {
      const selectedBrandIds = brandsList.filter(b => selectedBrands.includes(b.name)).map(b => b.id);
      filtered = filtered.filter(p => selectedBrandIds.includes(p.brand_id));
    }

    switch (sortBy) {
      case 'price_low': return filtered.sort((a, b) => a.selling_price - b.selling_price);
      case 'price_high': return filtered.sort((a, b) => b.selling_price - a.selling_price);
      case 'discount': return filtered.sort((a, b) => {
          const d1 = a.mrp ? ((a.mrp - a.selling_price) / a.mrp) * 100 : 0;
          const d2 = b.mrp ? ((b.mrp - b.selling_price) / b.mrp) * 100 : 0;
          return d2 - d1;
        });
      default: return filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }
  }, [allProducts, selectedSubCategory, sortBy, priceRange, inStockOnly, selectedBrands, brandsList]);

  // Actions
  const handleSubCategoryChange = (subId) => {
    setCurrentPage(1); 
    setSearchParams(subId === 'all' ? {} : { sub: subId });
  };

  const getBrandName = (brandId) => brandsList.find(b => b.id === brandId)?.name || 'Generic';

  const toggleWishlist = async (e, productId) => {
    e.preventDefault(); e.stopPropagation();
    if (!localStorage.getItem('token')) return setIsAuthModalOpen(true);

    const isWishlisted = wishlist.includes(productId);
    setWishlist(prev => isWishlisted ? prev.filter(id => id !== productId) : [...prev, productId]);

    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(productId);
        showToast('Item removed');
      } else {
        await wishlistService.addToWishlist(productId);
        showToast('Added to wishlist ❤️');
      }
    } catch (error) {
      setWishlist(prev => isWishlisted ? [...prev, productId] : prev.filter(id => id !== productId));
      if (error.response?.status === 401) setIsAuthModalOpen(true);
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault(); e.stopPropagation();
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
    setSearchParams({}); 
    setPriceRange({ min: 0, max: 100000 });
    setInStockOnly(false);
    setSelectedBrands([]);
    setSortBy('popular');
  };

  const paginate = (pageNumber) => {
    if (pageNumber === currentPage) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  if (error) return (
    <Layout>
      <div className="container py-5 text-center">
        <h2>Error: {error}</h2>
        <button className="btn-primary mt-3" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </Layout>
  );

  // Full page loader ONLY for the initial app shell load
  if (isInitialLoad) return (
    <Layout>
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #E8EDF5', borderTop: '4px solid #009DFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="category-page">
        {toastMessage && <div className="toast-notification">{toastMessage}</div>}
        {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} authType={authType} setAuthType={setAuthType} />}

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
                <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span> <FiChevronRight /> <span className="active">{currentCategory?.name}</span>
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
                <div className={`subcategory-card ${selectedSubCategory === 'all' ? 'active' : ''}`} onClick={() => handleSubCategoryChange('all')}>
                  <div className="subcategory-img-container"><FiGrid size={32} color="#333" /></div>
                  <span className="subcategory-title">All {currentCategory?.name}</span>
                </div>
                {subCategories.map(sub => (
                    <div key={sub.id} className={`subcategory-card ${selectedSubCategory === String(sub.id) ? 'active' : ''}`} onClick={() => handleSubCategoryChange(String(sub.id))}>
                      <div className="subcategory-img-container"><img src={sub.icon_url || 'https://via.placeholder.com/100x70?text=Logo'} alt={sub.name} className="subcategory-img" loading="lazy" /></div>
                      <span className="subcategory-title">{sub.name}</span>
                    </div>
                ))}
              </div>
              <button className="scroll-btn right" onClick={scrollRight}><FiChevronRight /></button>
            </div>
          )}

          <button className="mobile-filter-toggle" onClick={() => setShowFilters(!showFilters)}><FiFilter /> Filters</button>

          <div className={`category-layout ${showFilters ? 'filters-open' : ''}`}>
            
            {/* Sidebar */}
            <aside className="category-sidebar">
              <div className="filter-header">
                <h3>Filters</h3>
                <div className="header-actions">
                  <button className="clear-filters-btn" onClick={clearFilters}><FiRefreshCw size={12} /> Clear All</button>
                  <button className="close-filters" onClick={() => setShowFilters(false)}><FiX /></button>
                </div>
              </div>

              <div className="filter-section">
                <h4>Categories</h4>
                <ul className="category-list">
                  {categories.map(cat => (
                    <li key={cat.id} className={currentCategory?.id === cat.id ? 'active' : ''} onClick={() => navigate(`/category/${cat.slug}`)}>{cat.name}</li>
                  ))}
                </ul>
              </div>

              <div className="filter-section">
                <h4>Brands</h4>
                <div className="checkbox-list" style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {availableBrands.map(brandName => (
                    <label key={brandName} className="checkbox-option">
                      <input type="checkbox" checked={selectedBrands.includes(brandName)} onChange={() => { setCurrentPage(1); setSelectedBrands(p => p.includes(brandName) ? p.filter(b => b !== brandName) : [...p, brandName]); }} />
                      <span>{brandName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Price Range</h4>
                <div className="price-range">
                  <div className="price-inputs">
                    <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => { setCurrentPage(1); setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 })); }} />
                    <span>-</span>
                    <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => { setCurrentPage(1); setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100000 })); }} />
                  </div>
                  <input type="range" min={0} max={100000} value={priceRange.max} onChange={(e) => { setCurrentPage(1); setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) })); }} className="price-slider" />
                </div>
              </div>

              <div className="filter-section">
                <h4>Availability</h4>
                <div className="checkbox-list">
                  <label className="checkbox-option">
                    <input type="checkbox" checked={inStockOnly} onChange={() => { setCurrentPage(1); setInStockOnly(!inStockOnly); }} />
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
                    <select value={sortBy} onChange={(e) => { setCurrentPage(1); setSortBy(e.target.value); }}>
                      <option value="popular">Most Popular</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="discount">Biggest Discount</option>
                    </select>
                  </div>
                  <div className="view-toggle">
                    <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><FiGrid /></button>
                    <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><FiList /></button>
                  </div>
                </div>
              </div>

              {/* Grid Loading State */}
              {isFetchingProducts && (
                <div className={`products-${viewMode} loading-skeleton`}>
                   {[...Array(12)].map((_, i) => (
                      <div key={i} style={{ height: '350px', backgroundColor: '#f0f2f5', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                   ))}
                   <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
                </div>
              )}

              {/* Products Render */}
              {!isFetchingProducts && (
                <div className={`products-${viewMode}`}>
                  {filteredProducts.map(product => {
                    const discountPercent = product.mrp ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100) : 0;
                    const isInStock = product.stock_status === 'in_stock' && product.stock_quantity > 0;
                    const stats = ratingStats[product.id];
                    const productRating = stats?.averageRating > 0 ? stats.averageRating : 0;
                    const reviewCount = stats?.totalReviews || 0;

                    return (
                      <div key={product.id} className={`product-card ${viewMode}-card`}>
                        <div className="product-badge">
                          {discountPercent >= 50 && <span className="badge-discount">{discountPercent}% OFF</span>}
                          {product.is_new && <span className="badge-new">NEW</span>}
                          {!isInStock && <span className="badge-out">OUT OF STOCK</span>}
                        </div>

                        <div className="product-image">
                          <Link to={`/product/${product.slug || product.id}`} className="product-img-link">
                            <img src={product.images && product.images.length > 0 ? product.images[0].image_path : 'https://via.placeholder.com/500'} alt={product.name} loading="lazy" />
                          </Link>
                          <button className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`} onClick={(e) => toggleWishlist(e, product.id)}>
                            <FiHeart />
                          </button>
                          <div className="quick-view-overlay">
                            <Link to={`/product/${product.slug || product.id}`} className="quick-view-btn-link quick-view-btn"><FiEye /> Quick View</Link>
                          </div>
                        </div>

                        <div className="product-details">
                          <div className="product-brand">{getBrandName(product.brand_id)}</div>
                          <Link to={`/product/${product.slug || product.id}`} className="product-title-link"><h4 className="product-title">{product.name}</h4></Link>
                          <div className="product-rating">
                            <div className="stars">{[...Array(5)].map((_, i) => <FiStar key={i} className={i < Math.floor(productRating) ? 'filled' : ''} />)}</div>
                            <span className="review-count">({reviewCount})</span>
                          </div>
                          <div className="product-price">
                            <span className="current-price">₹{product.selling_price?.toLocaleString()}</span>
                            {product.mrp > product.selling_price && (
                              <><span className="original-price">₹{product.mrp?.toLocaleString()}</span><span className="discount">{discountPercent}% off</span></>
                            )}
                          </div>
                          <div className="product-actions">
                            <button className="add-to-cart" disabled={!isInStock} onClick={(e) => handleAddToCart(e, product.id)}>
                              <FiShoppingCart size={16} /> {isInStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!isFetchingProducts && filteredProducts.length === 0 && (
                <div className="no-products">
                  <FiX size={48} />
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or clearing them to see more results.</p>
                  <button className="btn-outline-primary mt-3" onClick={clearFilters}>Clear All Filters</button>
                </div>
              )}

              {/* Pagination UI */}
              {!isFetchingProducts && totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><FiChevronLeft /> Prev</button>
                  
                  {/* Smart pagination numbers to prevent massive horizontal scrolling if you have 100 pages */}
                  {[...Array(totalPages).keys()].slice(
                    Math.max(0, currentPage - 3), 
                    Math.min(totalPages, currentPage + 2)
                  ).map(number => (
                    <button key={number + 1} className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`} onClick={() => paginate(number + 1)}>{number + 1}</button>
                  ))}

                  <button className="page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next <FiChevronRight /></button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Category;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiFilter, FiX, FiHeart, FiEye, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import Layout from '../../../components/layout/Layout';
import productService from '../../../services/productService';
import cartService from '../../../services/cartService';
import AuthModal from '../Auth/AuthModal';
import './PcPreBuild.css';

// Toast component
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

// Star Rating Component
const StarRating = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="product-rating">
      <div className="stars">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="filled" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="filled" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} />
        ))}
      </div>
      {reviewCount > 0 && <span className="review-count">({reviewCount})</span>}
    </div>
  );
};

const PcPreBuild = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [addingToCart, setAddingToCart] = useState({});
  const [wishlist, setWishlist] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [selectedPriceMin, setSelectedPriceMin] = useState('');
  const [selectedPriceMax, setSelectedPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch pre-built products
// Fetch pre-built products
  useEffect(() => {
    const fetchPreBuiltProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getAllProducts({
          activeOnly: true,
          productType: 'pc_pre_build'
        });
        
        // Extract the array from the paginated response wrapper
        const productList = response.data || [];
        
        const filtered = productList.filter(p => p.product_type === 'pc_pre_build');
        setProducts(filtered);
        setFilteredProducts(filtered);
        setError(null);

        // Set initial price range
        if (filtered.length > 0) {
          const prices = filtered.map(p => parseFloat(p.selling_price) || 0);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceRange({ min, max });
          setSelectedPriceMin(min);
          setSelectedPriceMax(max);
        }
      } catch (err) {
        console.error('Failed to fetch pre-built PCs:', err);
        setError(err.response?.data?.message || 'Failed to load pre-built PCs.');
      } finally {
        setLoading(false);
      }
    };
    fetchPreBuiltProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter(p => 
        p.category && selectedCategories.includes(p.category)
      );
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      result = result.filter(p => 
        p.brand && selectedBrands.includes(p.brand)
      );
    }

    // Filter by price
    const minPrice = parseFloat(selectedPriceMin) || priceRange.min;
    const maxPrice = parseFloat(selectedPriceMax) || priceRange.max;
    result = result.filter(p => {
      const price = parseFloat(p.selling_price) || 0;
      return price >= minPrice && price <= maxPrice;
    });

    // Filter by stock
    if (inStockOnly) {
      result = result.filter(p => p.stock_quantity > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => (parseFloat(a.selling_price) || 0) - (parseFloat(b.selling_price) || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (parseFloat(b.selling_price) || 0) - (parseFloat(a.selling_price) || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured - keep original order
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedBrands, selectedPriceMin, selectedPriceMax, priceRange, inStockOnly, sortBy, selectedCategories]);

  // Handle Add to Cart
  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await cartService.addToCart(productId, 1);
      showToast('Product added to cart! 🛒', 'success');
    } catch (err) {
      console.error('Add to cart error:', err);
      if (err.response?.status === 401) {
        setIsAuthModalOpen(true);
        showToast('Please log in to add items to cart.', 'error');
      } else {
        const msg = err.response?.data?.message || 'Failed to add to cart.';
        showToast(msg, 'error');
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Toggle wishlist
  const toggleWishlist = (e, productId) => {
    e.stopPropagation();
    setWishlist(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
    showToast(
      wishlist[productId] ? 'Removed from wishlist' : 'Added to wishlist ❤️',
      'success'
    );
  };

  // Get unique brands and categories
  const getBrands = () => {
    const brands = new Set();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  };

  const getCategories = () => {
    const categories = new Set();
    products.forEach(p => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedPriceMin(priceRange.min);
    setSelectedPriceMax(priceRange.max);
    setInStockOnly(false);
    setSortBy('featured');
  };

  // Get first image
  const getFirstImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image_path;
    }
    return null;
  };

  // Get discount percentage
  const getDiscount = (product) => {
    if (product.offer_price && product.offer_price < product.selling_price) {
      const discount = ((product.selling_price - product.offer_price) / product.selling_price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          authType={authType}
          setAuthType={setAuthType}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="pc-pre-build-page">
        {/* Hero Section */}
        <div className="category-hero">
          <div className="hero-overlay">
            <div className="container">
              <div className="breadcrumb">
                <span>Home</span>
                <FiChevronRight size={14} />
                <span className="active">Pre‑Built PCs</span>
              </div>
              <h1>Pre‑Built Gaming & Workstation PCs</h1>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          className="mobile-filter-toggle"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FiFilter size={18} />
          Filters
          <span className="filter-count">
            {selectedBrands.length + selectedCategories.length + (inStockOnly ? 1 : 0)}
          </span>
        </button>

        {/* Main Layout */}
        <div className={`category-layout ${isSidebarOpen ? 'filters-open' : ''}`}>
          {/* Sidebar */}
          <aside className="category-sidebar">
            <div className="filter-header">
              <h3>Filters</h3>
              <div className="header-actions">
                <button className="clear-filters-btn" onClick={clearAllFilters}>
                  Clear All
                </button>
                <button className="close-filters" onClick={() => setIsSidebarOpen(false)}>
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            {getCategories().length > 0 && (
              <div className="filter-section">
                <h4>Category</h4>
                <ul className="category-list">
                  {getCategories().map(category => (
                    <li
                      key={category}
                      className={selectedCategories.includes(category) ? 'active' : ''}
                      onClick={() => handleCategoryToggle(category)}
                    >
                      <span>{category}</span>
                      <span className="item-count">
                        {products.filter(p => p.category === category).length}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Brand Filter */}
            {getBrands().length > 0 && (
              <div className="filter-section">
                <h4>Brand</h4>
                <div className="checkbox-list">
                  {getBrands().map(brand => (
                    <label key={brand} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  value={selectedPriceMin}
                  onChange={(e) => setSelectedPriceMin(e.target.value)}
                  placeholder="Min"
                  min={priceRange.min}
                  max={priceRange.max}
                />
                <span>—</span>
                <input
                  type="number"
                  value={selectedPriceMax}
                  onChange={(e) => setSelectedPriceMax(e.target.value)}
                  placeholder="Max"
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={selectedPriceMax || priceRange.max}
                onChange={(e) => setSelectedPriceMax(parseFloat(e.target.value))}
                className="price-slider"
              />
            </div>

            {/* Availability */}
            <div className="filter-section">
              <h4>Availability</h4>
              <div className="checkbox-list">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(prev => !prev)}
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="category-main">
            {/* Toolbar */}
            <div className="category-toolbar">
              <div className="results-count">
                Showing <strong>{filteredProducts.length}</strong> pre‑built PCs
              </div>
              <div className="toolbar-actions">
                <div className="sort-options">
                  <label>Sort by</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="name">Name</option>
                  </select>
                </div>
                <div className="view-toggle">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="4" rx="1" />
                      <rect x="3" y="14" width="18" height="4" rx="1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading / Error / Empty States */}
            {loading ? (
              <div className="loader-wrap">
                <div className="loader"></div>
                <p>Loading pre‑built PCs...</p>
              </div>
            ) : error ? (
              <div className="no-products">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn-outline-primary">
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products">
                <FiFilter size={48} />
                <h3>No PCs Found</h3>
                <p>Try adjusting your filters to find what you're looking for.</p>
                <button onClick={clearAllFilters} className="btn-outline-primary">
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="products-grid">
                {currentProducts.map(product => {
                  const imageUrl = getFirstImage(product);
                  const isAdding = addingToCart[product.id] || false;
                  const isOutOfStock = product.stock_quantity <= 0;
                  const discount = getDiscount(product);
                  const isNew = false; // Could be based on created_at date

                  return (
                    <div key={product.id} className="product-card">
                      {/* Badges */}
                      <div className="product-badge">
                        {discount > 0 && (
                          <span className="badge-discount">-{discount}%</span>
                        )}
                        {isNew && <span className="badge-new">NEW</span>}
                        {isOutOfStock && <span className="badge-out">OUT OF STOCK</span>}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        className={`wishlist-btn ${wishlist[product.id] ? 'active' : ''}`}
                        onClick={(e) => toggleWishlist(e, product.id)}
                        aria-label="Add to wishlist"
                      >
                        <FiHeart size={14} />
                      </button>

                      {/* Image */}
                      <Link to={`/product/${product.slug}`} className="product-card-link">
                        <div className="product-image">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.name} />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                          {/* Quick View Overlay */}
                          <div className="quick-view-overlay">
                            <button className="quick-view-btn">
                              <FiEye size={14} />
                              Quick View
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="product-details">
                          {product.brand && (
                            <div className="product-brand">{product.brand}</div>
                          )}
                          <div className="product-title">{product.name}</div>

                          {/* Rating */}
                          {product.rating && (
                            <StarRating rating={product.rating} reviewCount={product.review_count || 0} />
                          )}

                          {/* Price */}
                          <div className="product-price">
                            {product.offer_price && product.offer_price < product.selling_price ? (
                              <>
                                <span className="current-price">
                                  ₹{parseFloat(product.offer_price).toLocaleString()}
                                </span>
                                <span className="original-price">
                                  ₹{parseFloat(product.selling_price).toLocaleString()}
                                </span>
                                <span className="discount">-{discount}%</span>
                              </>
                            ) : (
                              <span className="current-price">
                                ₹{parseFloat(product.selling_price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Add to Cart */}
                      <div className="product-actions">
                        <button
                          className={`add-to-cart ${isOutOfStock ? 'disabled' : ''}`}
                          onClick={(e) => handleAddToCart(e, product.id)}
                          disabled={isAdding || isOutOfStock}
                        >
                          {isOutOfStock ? (
                            'Out of Stock'
                          ) : isAdding ? (
                            'Adding...'
                          ) : (
                            <>
                              <FiShoppingCart size={16} />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="products-list">
                {currentProducts.map(product => {
                  const imageUrl = getFirstImage(product);
                  const isAdding = addingToCart[product.id] || false;
                  const isOutOfStock = product.stock_quantity <= 0;
                  const discount = getDiscount(product);

                  return (
                    <div key={product.id} className="product-card list-card">
                      <Link to={`/product/${product.slug}`} className="product-card-link">
                        <div className="product-image">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.name} />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </div>
                        <div className="product-details">
                          {product.brand && (
                            <div className="product-brand">{product.brand}</div>
                          )}
                          <div className="product-title">{product.name}</div>
                          <p className="product-description">
                            {product.short_description || 'High‑performance pre‑built PC.'}
                          </p>
                          {product.rating && (
                            <StarRating rating={product.rating} reviewCount={product.review_count || 0} />
                          )}
                          <div className="product-price">
                            {product.offer_price && product.offer_price < product.selling_price ? (
                              <>
                                <span className="current-price">
                                  ₹{parseFloat(product.offer_price).toLocaleString()}
                                </span>
                                <span className="original-price">
                                  ₹{parseFloat(product.selling_price).toLocaleString()}
                                </span>
                                <span className="discount">-{discount}%</span>
                              </>
                            ) : (
                              <span className="current-price">
                                ₹{parseFloat(product.selling_price).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <button
                            className={`add-to-cart ${isOutOfStock ? 'disabled' : ''}`}
                            onClick={(e) => handleAddToCart(e, product.id)}
                            disabled={isAdding || isOutOfStock}
                          >
                            {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft size={16} />
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => goToPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default PcPreBuild;
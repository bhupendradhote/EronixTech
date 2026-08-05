import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  FiGrid,
  FiList,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiStar,
  FiHeart,
  FiShoppingCart,
  FiX,
  FiEye,
  FiRefreshCw
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

// Import the AuthModal
import AuthModal from '../../User/Auth/AuthModal';

const Category = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for dynamic data
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingStats, setRatingStats] = useState({});
  const [brandsList, setBrandsList] = useState([]);

  // Filter & UI state
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Auth & Toast state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Ref for the subcategory scroll container
  const subcategoryRef = useRef(null);

  // Helper function to show temporary success/error messages
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Scroll functions for subcategory bar
  const scrollLeft = () => {
    if (subcategoryRef.current) {
      subcategoryRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (subcategoryRef.current) {
      subcategoryRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // 1. Fetch initial Wishlist Data
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const wishlistItems = await wishlistService.getWishlist();
        const productIds = wishlistItems.map(item => item.id);
        setWishlist(productIds);
      } catch (err) {
        console.warn('Failed to load wishlist:', err.response?.data?.message || err.message);
      }
    };
    fetchUserWishlist();
  }, [isAuthModalOpen]);

  // 2. Fetch all categories and brands ONCE on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cats, brands] = await Promise.all([
          categoryService.getAllCategories(true, true),
          brandService.getAllBrands(true)
        ]);

        if (cats.length === 0) {
          setError('No categories found');
          return;
        }

        setCategories(cats);
        setBrandsList(brands);
      } catch (err) {
        console.error(err);
        setError('Failed to load initial data');
      }
    };
    fetchInitialData();
  }, []);

  // 3. Handle Category selection based purely on URL Slug
  useEffect(() => {
    if (categories.length === 0) return;

    let matchedCategory = categories.find(cat => cat.slug === categorySlug);

    if (!matchedCategory) {
      navigate(`/category/${categories[0].slug}`, { replace: true });
      return;
    }

    if (currentCategory?.id !== matchedCategory.id) {
      setCurrentCategory(matchedCategory);

      // Reset other local filters
      setSelectedBrands([]);
      setInStockOnly(false);
      setSortBy('popular');

      if (matchedCategory.sub_categories?.length) {
        setSubCategories(matchedCategory.sub_categories);
      } else {
        subCategoryService.getSubCategoriesByCategory(matchedCategory.id, true)
          .then(subs => setSubCategories(subs))
          .catch(err => console.error('Failed to fetch subcategories:', err));
      }
    }
  }, [categorySlug, categories, navigate, currentCategory]);

  // Sync Selected Subcategory with URL params
  useEffect(() => {
    const subQuery = searchParams.get('sub');
    if (subQuery) {
      setSelectedSubCategory(subQuery);
    } else {
      setSelectedSubCategory('all');
    }
  }, [searchParams]);

  const handleSubCategoryChange = (subId) => {
    if (subId === 'all') {
      setSearchParams({}); // Clears the query params, reverting to 'all'
    } else {
      setSearchParams({ sub: subId }); // Sets ?sub=id
    }
  };

  // 4. Fetch Products whenever currentCategory changes
  useEffect(() => {
    if (!currentCategory) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await productService.getAllProducts({
          categoryId: currentCategory.id,
          activeOnly: true,
          status: 'active'
        });
        setAllProducts(fetchedProducts);

        if (brandsList.length > 0) {
          const brandMap = new Map(brandsList.map(b => [b.id, b.name]));
          const brandNames = [...new Set(fetchedProducts.map(p => brandMap.get(p.brand_id)).filter(Boolean))];
          setAvailableBrands(brandNames);
        }

        const prices = fetchedProducts.map(p => p.selling_price);
        if (prices.length) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange({ min: minPrice, max: maxPrice });
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, brandsList]);

  // 5. Fetch Ratings Data in Background
  useEffect(() => {
    if (allProducts.length > 0) {
      const fetchRatings = async () => {
        const statsMap = {};
        await Promise.all(
          allProducts.map(async (product) => {
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
  }, [allProducts]);

  // 6. Apply Filters locally
  useEffect(() => {
    if (!allProducts.length) {
      setProducts([]);
      return;
    }

    let filtered = [...allProducts];

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
      case 'price_low':
        filtered.sort((a, b) => a.selling_price - b.selling_price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.selling_price - a.selling_price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const discountA = a.mrp ? ((a.mrp - a.selling_price) / a.mrp) * 100 : 0;
          const discountB = b.mrp ? ((b.mrp - b.selling_price) / b.mrp) * 100 : 0;
          return discountB - discountA;
        });
        break;
      default:
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }

    setProducts(filtered);
    setCurrentPage(1);
  }, [allProducts, selectedSubCategory, sortBy, priceRange, inStockOnly, selectedBrands, brandsList]);

  const handleCategoryChange = (catSlug) => {
    navigate(`/category/${catSlug}`); // Navigating clears the query params automatically
  };

  const getBrandName = (brandId) => {
    const brand = brandsList.find(b => b.id === brandId);
    return brand ? brand.name : 'Generic';
  };

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    const isWishlisted = wishlist.includes(productId);

    setWishlist(prev =>
      isWishlisted
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(productId);
        showToast('Item removed from wishlist');
      } else {
        await wishlistService.addToWishlist(productId);
        showToast('Successfully added to wishlist! ❤️');
      }
    } catch (error) {
      setWishlist(prev =>
        isWishlisted
          ? [...prev, productId]
          : prev.filter(id => id !== productId)
      );
      if (error.response?.status === 401) {
        setIsAuthModalOpen(true);
      } else {
        showToast(error.response?.data?.message || 'Error updating wishlist.');
      }
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await cartService.addToCart(productId, 1);
      showToast('Successfully added to cart! 🛒');
    } catch (error) {
      if (error.response?.status === 401) {
        setIsAuthModalOpen(true);
      } else {
        showToast(error.response?.data?.message || 'Error adding to cart.');
      }
    }
  };

  const handleBrandToggle = (brandName) => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  };

  const clearFilters = () => {
    setSearchParams({}); // Clears subcategory URL param
    if (allProducts.length) {
      const prices = allProducts.map(p => p.selling_price);
      setPriceRange({ min: Math.min(...prices), max: Math.max(...prices) });
    } else {
      setPriceRange({ min: 0, max: 100000 });
    }
    setInStockOnly(false);
    setSelectedBrands([]);
    setSortBy('popular');
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (error) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h2>Error: {error}</h2>
          <button className="btn-primary mt-3" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Layout>
    );
  }

  if (!currentCategory && !loading) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h2>Category not found</h2>
          <button className="btn-primary mt-3" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="category-page">

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="toast-notification">
            {toastMessage}
          </div>
        )}

        {/* AUTHENTICATION MODAL */}
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            authType={authType}
            setAuthType={setAuthType}
          />
        )}

        {/* Hero Banner */}
        <div className="category-hero">
          <img
            src={currentCategory?.banner_url || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&h=300&fit=crop'}
            alt={currentCategory?.name || 'Category'}
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

          {/* Subcategory Top Bar with Scroll Buttons */}
          {subCategories.length > 0 && (
            <div className="subcategory-scroll-wrapper">
              <button className="scroll-btn left" onClick={scrollLeft} aria-label="Scroll left">
                <FiChevronLeft />
              </button>
              <div className="subcategory-top-bar" ref={subcategoryRef}>
                {/* 'All Products' Option */}
                <div
                  className={`subcategory-card ${selectedSubCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleSubCategoryChange('all')}
                >
                  <div className="subcategory-img-container">
                    <FiGrid size={32} color="#333" />
                  </div>
                  <span className="subcategory-title">All {currentCategory?.name}</span>
                  <span className="subcategory-count">
                    {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'}
                  </span>
                </div>

                {/* Dynamic Subcategories from DB */}
                {subCategories.map(sub => {
                  const productCount = allProducts.filter(p => p.sub_category_id === sub.id).length;
                  return (
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
                        />
                      </div>
                      <span className="subcategory-title">{sub.name}</span>
                      <span className="subcategory-count">
                        {productCount} {productCount === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button className="scroll-btn right" onClick={scrollRight} aria-label="Scroll right">
                <FiChevronRight />
              </button>
            </div>
          )}

          {/* Mobile Filter Toggle */}
          <button className="mobile-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> Filters
          </button>

          <div className={`category-layout ${showFilters ? 'filters-open' : ''}`}>

            {/* Sidebar Filters */}
            <aside className="category-sidebar">
              <div className="filter-header">
                <h3>Filters</h3>
                <div className="header-actions">
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    <FiRefreshCw size={12} /> Clear All
                  </button>
                  <button className="close-filters" onClick={() => setShowFilters(false)}>
                    <FiX />
                  </button>
                </div>
              </div>

              {/* Main Categories */}
              <div className="filter-section">
                <h4>Categories</h4>
                <ul className="category-list">
                  {categories.map(cat => (
                    <li
                      key={cat.id}
                      className={currentCategory?.id === cat.id ? 'active' : ''}
                      onClick={() => handleCategoryChange(cat.slug)}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subcategories (sidebar) */}
              {subCategories.length > 0 && (
                <div className="filter-section">
                  <h4>Subcategories</h4>
                  <ul className="category-list">
                    <li
                      className={selectedSubCategory === 'all' ? 'active' : ''}
                      onClick={() => handleSubCategoryChange('all')}
                    >
                      All
                    </li>
                    {subCategories.map(sub => (
                      <li
                        key={sub.id}
                        className={selectedSubCategory === String(sub.id) ? 'active' : ''}
                        onClick={() => handleSubCategoryChange(String(sub.id))}
                      >
                        {sub.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Brands Filter (Dynamic) */}
              <div className="filter-section">
                <h4>Brands</h4>
                <div className="checkbox-list">
                  {availableBrands.map(brandName => (
                    <label key={brandName} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brandName)}
                        onChange={() => handleBrandToggle(brandName)}
                      />
                      <span>{brandName}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h4>Price Range</h4>
                <div className="price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100000 }))}
                    />
                  </div>
                  <input
                    type="range"
                    min={allProducts.length ? Math.min(...allProducts.map(p => p.selling_price)) : 0}
                    max={allProducts.length ? Math.max(...allProducts.map(p => p.selling_price)) : 100000}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="price-slider"
                  />
                </div>
              </div>

              {/* Availability Filter */}
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

            {/* Main Content */}
            <main className="category-main">
              {/* Toolbar */}
              <div className="category-toolbar">
                <div className="results-count">
                  Showing <strong>{products.length}</strong> products
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
                    >
                      <FiGrid />
                    </button>
                    <button
                      className={viewMode === 'list' ? 'active' : ''}
                      onClick={() => setViewMode('list')}
                    >
                      <FiList />
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* Products Grid/List */}
              {!loading && (
                <div className={`products-${viewMode}`}>
                  {currentProducts.map(product => {
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
                            <img
                              src={product.images && product.images.length > 0 ? product.images[0].image_path : 'https://via.placeholder.com/500'}
                              alt={product.name}
                            />
                          </Link>

                          <button
                            className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                            onClick={(e) => toggleWishlist(e, product.id)}
                          >
                            <FiHeart />
                          </button>
                          <div className="quick-view-overlay">
                            <Link to={`/product/${product.slug || product.id}`} className="quick-view-btn-link quick-view-btn">
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
                            <span className="current-price">₹{product.selling_price.toLocaleString()}</span>
                            {product.mrp > product.selling_price && (
                              <>
                                <span className="original-price">₹{product.mrp.toLocaleString()}</span>
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

              {/* No Products Message */}
              {!loading && products.length === 0 && (
                <div className="no-products">
                  <FiX size={48} />
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or clearing them to see more results.</p>
                  <button className="btn-outline-primary mt-3" onClick={clearFilters}>Clear All Filters</button>
                </div>
              )}

              {/* Pagination */}
              {!loading && products.length > 0 && totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft /> Prev
                  </button>
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
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
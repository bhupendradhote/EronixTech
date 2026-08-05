import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import categoryService from '../../services/categoryService';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import searchService from '../../services/searchService';
import './Header.css';
import AuthModal from '../../pages/User/Auth/AuthModal';
import logo from '../../assets/images/logo/eronix.png';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authType, setAuthType] = useState('login');
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef(null);

    // --- User Location State ---
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('loading');

    // --- Category bar sticky state ---
    const [isCategorySticky, setIsCategorySticky] = useState(false);
    const categoryBarRef = useRef(null);
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    // --- Infinite Carousel State ---
    const [currentSlide, setCurrentSlide] = useState(0);
    const [itemWidth, setItemWidth] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const carouselInnerRef = useRef(null);
    const carouselWrapperRef = useRef(null);
    const touchStartX = useRef(0);
    const touchCurrentX = useRef(0);
    const isDragging = useRef(false);

    // --- Sidebar close on outside click ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setIsSidebarOpen(false);
            }
        };
        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    // --- Fetch categories ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllCategories(true, false);
                setCategories(data || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // --- Cart & Wishlist counts ---
    useEffect(() => {
        const fetchUserCounts = async () => {
            if (isAuthenticated) {
                try {
                    const [cartData, wishlistData] = await Promise.all([
                        cartService.getCart(),
                        wishlistService.getWishlist()
                    ]);
                    setCartCount(cartData?.items?.length || 0);
                    setWishlistCount(wishlistData?.length || 0);
                } catch (error) {
                    console.error("Failed to fetch user counts:", error);
                    setCartCount(0);
                    setWishlistCount(0);
                }
            } else {
                setCartCount(0);
                setWishlistCount(0);
            }
        };
        fetchUserCounts();
        const handleUpdate = () => fetchUserCounts();
        window.addEventListener('cartUpdated', handleUpdate);
        window.addEventListener('wishlistUpdated', handleUpdate);
        return () => {
            window.removeEventListener('cartUpdated', handleUpdate);
            window.removeEventListener('wishlistUpdated', handleUpdate);
        };
    }, [isAuthenticated]);

    // --- User Location Detection ---
    useEffect(() => {
        const fetchLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`
                            );
                            const data = await response.json();
                            if (data && data.address) {
                                const city = data.address.city ||
                                    data.address.town ||
                                    data.address.village ||
                                    data.address.county ||
                                    'Unknown';
                                const region = data.address.state ||
                                    data.address.region ||
                                    data.address.country ||
                                    '';
                                setUserLocation({ city, region });
                                setLocationStatus('success');
                            } else {
                                setUserLocation({ city: 'Current Location', region: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
                                setLocationStatus('success');
                            }
                        } catch (error) {
                            console.error('Reverse geocoding error:', error);
                            fallbackToIPLocation();
                        }
                    },
                    (error) => {
                        console.warn('Geolocation error:', error);
                        fallbackToIPLocation();
                    }
                );
            } else {
                fallbackToIPLocation();
            }
        };

        const fallbackToIPLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data && data.city) {
                    setUserLocation({ city: data.city, region: data.region });
                    setLocationStatus('success');
                } else {
                    setLocationStatus('error');
                }
            } catch (error) {
                console.error('IP location fallback error:', error);
                setLocationStatus('error');
            }
        };

        fetchLocation();
    }, []);

    // --- Dropdown outside click & Escape ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setShowDropdown(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- Live search debounce ---
    useEffect(() => {
        const timer = setTimeout(() => {
            const query = searchQuery.trim();
            if (query.length >= 2) {
                fetchSearchResults(query);
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchSearchResults = async (query) => {
        setSearchLoading(true);
        setShowDropdown(true);
        try {
            const results = await searchService.searchProducts(query);
            const products = Array.isArray(results) ? results : [];

            const mappedResults = products.map((product) => {
                let imageUrl = 'https://via.placeholder.com/50';
                if (product.images) {
                    try {
                        const imagesArray = typeof product.images === 'string'
                            ? JSON.parse(product.images)
                            : product.images;
                        if (Array.isArray(imagesArray) && imagesArray.length > 0) {
                            const firstImage = imagesArray[0];
                            imageUrl = firstImage.image_path || firstImage.url || firstImage.path || firstImage;
                            if (typeof imageUrl === 'object') {
                                imageUrl = firstImage.url || firstImage.src || firstImage.image_path || 'https://via.placeholder.com/50';
                            }
                        }
                    } catch (e) {
                        console.warn('Image parse error for product', product.id);
                    }
                }

                const price = product.offer_price && product.offer_price > 0
                    ? product.offer_price
                    : product.selling_price || product.mrp || 0;
                const salePrice = product.selling_price && product.selling_price < (product.mrp || 0)
                    ? product.selling_price
                    : null;

                let specValues = [];

                if (product.specifications) {
                    try {
                        let specData = typeof product.specifications === 'string'
                            ? JSON.parse(product.specifications)
                            : product.specifications;
                        if (Array.isArray(specData)) {
                            specData.forEach(spec => {
                                const value = spec.spec_value || '';
                                if (value.trim()) specValues.push(value.trim());
                            });
                        } else if (typeof specData === 'object' && specData !== null) {
                            const val = specData.spec_value || '';
                            if (val.trim()) specValues.push(val.trim());
                        }
                    } catch (e) {
                        console.warn('Spec parse error for product', product.id, e);
                    }
                }

                if (specValues.length === 0 && product.key_features) {
                    try {
                        let features = typeof product.key_features === 'string'
                            ? JSON.parse(product.key_features)
                            : product.key_features;
                        if (Array.isArray(features)) {
                            specValues = features.slice(0, 3);
                        }
                    } catch (e) {
                        console.warn('Key features parse error', product.id, e);
                    }
                }

                if (specValues.length === 0 && product.short_description) {
                    specValues = [product.short_description];
                }

                if (specValues.length === 0 && product.model_number) {
                    specValues = [product.model_number];
                }

                specValues = specValues.slice(0, 5);
                let specsString = specValues.join(' | ');

                if (product.brand) {
                    let brand = typeof product.brand === 'string'
                        ? product.brand
                        : product.brand.name || '';
                    if (brand) {
                        specsString = specsString ? `${brand} - ${specsString}` : brand;
                    }
                }

                return {
                    id: product.id,
                    slug: product.slug || product.id,
                    name: product.name || 'Unnamed Product',
                    image: imageUrl,
                    price: price,
                    sale_price: salePrice,
                    specs: specsString || '',
                };
            });

            setSearchResults(mappedResults);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // --- Infinite Carousel logic ---
    const totalItems = categories.length;
    // We need at least 3 copies for infinite loop (middle copy is the visible one)
    const duplicatedCategories = totalItems > 0 ? [...categories, ...categories, ...categories] : [];
    const slideCount = duplicatedCategories.length;

    // Compute item width (including gap) on mount and resize
    useEffect(() => {
        const computeItemWidth = () => {
            if (carouselInnerRef.current && totalItems > 0) {
                const firstItem = carouselInnerRef.current.children[0];
                if (firstItem) {
                    const style = window.getComputedStyle(firstItem);
                    const marginLeft = parseFloat(style.marginLeft) || 0;
                    const marginRight = parseFloat(style.marginRight) || 0;
                    // Get gap from parent (flex gap)
                    const parentStyle = window.getComputedStyle(carouselInnerRef.current);
                    const gap = parseFloat(parentStyle.gap) || 0;
                    const width = firstItem.offsetWidth + marginLeft + marginRight + gap;
                    setItemWidth(width);
                }
            }
        };
        computeItemWidth();
        window.addEventListener('resize', computeItemWidth);
        return () => window.removeEventListener('resize', computeItemWidth);
    }, [categories, totalItems]);

    // Set initial slide to the start of the middle copy
    useEffect(() => {
        if (totalItems > 0) {
            setCurrentSlide(totalItems);
        }
    }, [totalItems]);

    // Transition end: reset position if at the end or beginning to create infinite loop
    const handleTransitionEnd = useCallback(() => {
        if (!isTransitioning) return;
        setIsTransitioning(false);
        // If we are at the end of the last copy, jump to the start of the middle copy
        if (currentSlide >= totalItems * 2) {
            setCurrentSlide(totalItems);
            // Disable transition for the jump
            if (carouselInnerRef.current) {
                carouselInnerRef.current.style.transition = 'none';
            }
            requestAnimationFrame(() => {
                if (carouselInnerRef.current) {
                    carouselInnerRef.current.style.transition = '';
                }
            });
        } else if (currentSlide < totalItems) {
            // If we are at the start of the first copy, jump to the start of the middle copy
            setCurrentSlide(totalItems);
            if (carouselInnerRef.current) {
                carouselInnerRef.current.style.transition = 'none';
            }
            requestAnimationFrame(() => {
                if (carouselInnerRef.current) {
                    carouselInnerRef.current.style.transition = '';
                }
            });
        }
    }, [currentSlide, totalItems, isTransitioning]);

    // Navigate to next/prev
    const goToSlide = useCallback((index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
    }, [isTransitioning]);

    const nextSlide = useCallback(() => {
        if (totalItems === 0 || isTransitioning) return;
        goToSlide(currentSlide + 1);
    }, [currentSlide, totalItems, isTransitioning, goToSlide]);

    const prevSlide = useCallback(() => {
        if (totalItems === 0 || isTransitioning) return;
        goToSlide(currentSlide - 1);
    }, [currentSlide, totalItems, isTransitioning, goToSlide]);

    // Touch events for swipe
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchCurrentX.current = touchStartX.current;
        isDragging.current = true;
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging.current) return;
        touchCurrentX.current = e.touches[0].clientX;
        // Optionally add a drag effect (translate the inner container) but we skip for simplicity
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const diff = touchStartX.current - touchCurrentX.current;
        const threshold = 50; // minimum swipe distance
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, [nextSlide, prevSlide]);

    // Clean up transition end listener
    useEffect(() => {
        const inner = carouselInnerRef.current;
        if (inner) {
            inner.addEventListener('transitionend', handleTransitionEnd);
            return () => inner.removeEventListener('transitionend', handleTransitionEnd);
        }
    }, [handleTransitionEnd]);

    // --- Measure header height ---
    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };
        updateHeaderHeight();
        window.addEventListener('resize', updateHeaderHeight);
        let observer;
        if (headerRef.current) {
            observer = new ResizeObserver(updateHeaderHeight);
            observer.observe(headerRef.current);
        }
        return () => {
            window.removeEventListener('resize', updateHeaderHeight);
            if (observer) observer.disconnect();
        };
    }, []);

    // --- Stable sticky category bar scroll listener ---
    useEffect(() => {
        let frameId = null;

        const handleScroll = () => {
            if (frameId !== null) return;

            frameId = window.requestAnimationFrame(() => {
                const shouldBeCompact = window.scrollY > 10;

                setIsCategorySticky((previous) =>
                    previous === shouldBeCompact ? previous : shouldBeCompact
                );

                frameId = null;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, []);

    const userFullName = user?.full_name || user?.email || 'User';
    const firstName = userFullName.split(' ')[0];

    const openModal = (type) => {
        setAuthType(type);
        setIsModalOpen(true);
        setIsSidebarOpen(false);
    };
    const closeModal = () => setIsModalOpen(false);
    const handleLogout = async () => {
        await logout();
        setIsSidebarOpen(false);
    };
    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowDropdown(false);
            setIsSidebarOpen(false);
        }
    };
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const badgeStyle = {
        backgroundColor: '#003EAB',
        color: '#ffffff',
        borderRadius: '10px',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: 'bold',
        marginLeft: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        lineHeight: 1,
        minWidth: '18px',
        height: '18px',
        right: '-8px',
        top: '-4px',
        position: 'absolute',
    };
    const badgeStyleSmall = {
        ...badgeStyle,
        fontSize: '10px',
        minWidth: '16px',
        height: '16px',
        padding: '1px 4px'
    };

    // Render only if categories exist
    const renderCategories = () => {
        if (totalItems === 0) {
            return <div style={{ padding: '0.5rem 0', color: '#fff' }}>Loading categories...</div>;
        }
        return duplicatedCategories.map((cat, index) => (
            <Link
                key={`${cat.id}-${index}`}
                to={`/category/${cat.slug}`}
                className="cat-wrap"
                onClick={() => setIsSidebarOpen(false)}
            >
                <img
                    src={cat.icon_url || `https://picsum.photos/seed/${cat.id}/80/80`}
                    alt={cat.name}
                    onError={(e) => { e.target.src = 'https://picsum.photos/80/80'; }}
                />
                <span className="cat-pill">{cat.name}</span>
            </Link>
        ));
    };

    return (
        <>
            {/* Top strip */}
            <div className="top-strip">
                <div className="container">
                    <div className="top-strip-text">
                        <span>AI-Powered Procurement for Your Business. Move Faster. Source Smarter. Scale Seamlessly.</span>
                    </div>
                    <div className='topp-btns'>
                        <div className="explore-cognilix-btn">
                            <Link to="/business" className="btn-explore">EronixTech Business</Link>
                        </div>
                        <div className="explore-cognilix-btn">
                            <Link to="/gaming-zone" className="btn-explore">Game Zone</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <header className="header" ref={headerRef}>
                <div className="container">
                    {/* Mobile header row */}
                    <div className="header-mobile-row">
                        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle menu">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <Link to="/" className="logo">
                            <img src={logo} alt="EronixTech" className="logo-image" />
                        </Link>
                        <div className="mobile-actions">
                            <Link to="/wishlist" className="mobile-action">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                {wishlistCount > 0 && <span style={badgeStyleSmall}>{wishlistCount}</span>}
                            </Link>
                            <Link to="/cart" className="mobile-action">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {cartCount > 0 && <span style={badgeStyleSmall}>{cartCount}</span>}
                            </Link>
                        </div>
                    </div>

                    {/* Desktop header row */}
                    <div className="header-desktop-row">
                        <div className="header-left">
                            <Link to="/" className="logo">
                                <img src={logo} alt="EronixTech" className="logo-image" />
                            </Link>
                            <div className="header-location">
                                <svg className="loc-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <div className="loc-text">
                                    <span className="loc-label">
                                        {locationStatus === 'loading' ? 'Detecting...' :
                                         locationStatus === 'error' ? 'Location unavailable' :
                                         userLocation ? userLocation.city : 'Location not set'}
                                    </span>
                                    <span className="loc-value">
                                        {locationStatus === 'loading' ? 'Please wait' :
                                         locationStatus === 'error' ? 'Enable location' :
                                         userLocation?.region || 'Current location'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search Container */}
                        <div className="search-container" ref={searchContainerRef}>
                            <div className="searchbar">
                                <select>
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search for products, brands and more"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    onFocus={() => {
                                        if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
                                            setShowDropdown(true);
                                        }
                                    }}
                                />
                                <button className="searchbtn" onClick={handleSearch}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </button>
                            </div>

                            {showDropdown && (
                                <div className="search-dropdown">
                                    {searchLoading ? (
                                        <div className="search-loading">Loading...</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((product) => (
                                            <Link
                                                to={`/product/${product.slug}`}
                                                key={product.id}
                                                className="search-result-item"
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    setSearchQuery('');
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="search-result-img"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                                                    }}
                                                />
                                                <div className="search-result-info">
                                                    <div className="search-result-name">{product.name}</div>
                                                    {product.specs && (
                                                        <div className="search-result-specs">{product.specs}</div>
                                                    )}
                                                    <div className="search-result-price">
                                                        ₹{product.price}
                                                        {product.sale_price && (
                                                            <span className="search-result-sale-price">
                                                                ₹{product.sale_price}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="search-no-results">No products found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="actions">
                            <Link to="/pc-build" className="action">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                <span>PC Build</span>
                            </Link>
                            <Link to="/pc-pre-build" className="action">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                <span>Pre-Built PC</span>
                            </Link>
                            <Link to="/cart" className="action">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                <span>Cart</span>
                                {cartCount > 0 && <span style={badgeStyle}>{cartCount}</span>}
                            </Link>
                            <Link to="/wishlist" className="action">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span>Wishlist</span>
                                {wishlistCount > 0 && <span style={badgeStyle}>{wishlistCount}</span>}
                            </Link>
                            {isAuthenticated ? (
                                <div className="user-dropdown-wrapper">
                                    <div className="action">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <span>{firstName}</span>
                                    </div>
                                    <div className="user-dropdown-menu">
                                        <Link to="/profile">My Profile</Link>
                                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="action" onClick={() => openModal('login')} style={{ cursor: 'pointer' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    <span>Login</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Category bar - Infinite Carousel */}
            <div
                className={`category-bar desktop-category-bar ${isCategorySticky ? 'is-sticky' : ''}`}
                ref={categoryBarRef}
                style={{ top: `${headerHeight}px` }}
            >
                <div className="container" style={{ position: 'relative' }}>
                    {totalItems > 0 && (
                        <>
                            <button
                                className="scroll-btn left"
                                onClick={prevSlide}
                                aria-label="Scroll left"
                                disabled={isTransitioning}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <div
                                className="category-carousel-wrapper"
                                ref={carouselWrapperRef}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div
                                    className="category-carousel-inner"
                                    ref={carouselInnerRef}
                                    style={{
                                        transform: `translateX(-${currentSlide * itemWidth}px)`,
                                        transition: isTransitioning ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                                    }}
                                >
                                    {renderCategories()}
                                </div>
                            </div>
                            <button
                                className="scroll-btn right"
                                onClick={nextSlide}
                                aria-label="Scroll right"
                                disabled={isTransitioning}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar} />
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    {isAuthenticated ? (
                        <div className="sidebar-user">
                            <div className="sidebar-avatar">
                                {firstName.charAt(0).toUpperCase()}
                            </div>
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">{userFullName}</span>
                                <span className="sidebar-user-email">{user?.email}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sidebar-guest">
                            <div className="sidebar-avatar guest-avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <button className="sidebar-login-btn" onClick={() => openModal('login')}>
                                Login / Register
                            </button>
                        </div>
                    )}
                    <button className="sidebar-close" onClick={toggleSidebar}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Search (optional) */}
                <div className="sidebar-search">
                    <input type="text" placeholder="Search products..." value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
                    <button onClick={handleSearch}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="sidebar-nav">
                    <Link to="/pc-build" className="sidebar-nav-item" onClick={() => setIsSidebarOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        PC Build
                    </Link>
                    <Link to="/pc-pre-build" className="sidebar-nav-item" onClick={() => setIsSidebarOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        Pre-Built PC
                    </Link>
                    <Link to="/cart" className="sidebar-nav-item" onClick={() => setIsSidebarOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        Cart
                        {cartCount > 0 && <span className="sidebar-badge">{cartCount}</span>}
                    </Link>
                    <Link to="/wishlist" className="sidebar-nav-item" onClick={() => setIsSidebarOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        Wishlist
                        {wishlistCount > 0 && <span className="sidebar-badge">{wishlistCount}</span>}
                    </Link>

                    <div className="sidebar-divider"></div>
                    <span className="sidebar-nav-label">Categories</span>
                    <div className="sidebar-categories-list">
                        {categories.slice(0, 8).map((cat) => (
                            <Link key={cat.id} to={`/category/${cat.slug}`} className="sidebar-cat-item" onClick={() => setIsSidebarOpen(false)}>
                                <img src={cat.icon_url || `https://picsum.photos/seed/${cat.id}/30/30`} alt={cat.name} />
                                <span>{cat.name}</span>
                            </Link>
                        ))}
                        {categories.length > 8 && (
                            <Link to="/categories" className="sidebar-cat-item sidebar-view-all" onClick={() => setIsSidebarOpen(false)}>
                                View All Categories
                            </Link>
                        )}
                    </div>

                    {isAuthenticated && (
                        <>
                            <div className="sidebar-divider"></div>
                            <Link to="/profile" className="sidebar-nav-item" onClick={() => setIsSidebarOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                My Profile
                            </Link>
                            <button className="sidebar-nav-item sidebar-logout-btn" onClick={handleLogout}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Logout
                            </button>
                        </>
                    )}
                </nav>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <Link to="/business" className="sidebar-footer-link" onClick={() => setIsSidebarOpen(false)}>
                        EronixTech Business
                    </Link>
                </div>
            </div>

            <AuthModal
                isOpen={isModalOpen}
                onClose={closeModal}
                authType={authType}
                setAuthType={setAuthType}
            />

            {/* Inline styles for sticky category bar and carousel */}
            <style>{`
                /* Make header sticky */
                .header {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: #fff;
                }

                /* Category bar base */
                .category-bar {
                    position: sticky;
                    z-index: 999;
                    background: #fff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    
                    will-change: auto;
                }

                .category-bar.is-sticky {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.10);
                }

                .category-bar.is-sticky .cat-wrap img {
                    display: none;
                }

                .category-bar.is-sticky .cat-wrap {
                    padding: 8px 4px;
                }

                .category-bar.is-sticky .cat-pill {
                    font-size: 13px;
                    font-weight: 550;
                    color: #000;
                }

                .category-bar.is-sticky .category-carousel-inner {
                    padding: 4px 0;
                }

                /* Carousel styles */
                .category-carousel-wrapper {
                    overflow: hidden;
                    width: 100%;
                    position: relative;
                }

                .category-carousel-inner {
                    display: flex;
                    gap: 1.5rem;
                    padding: 0.5rem 0;
                    will-change: transform;
                    touch-action: pan-y;
                }

                .cat-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    flex: 0 0 auto;
                    cursor: pointer;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.2s;
                }

                .cat-wrap img {
                    width: 55px;
                    height: 55px;
                    border-radius: 50%;
                    object-fit: cover;
                    background: rgba(0, 141, 255, 0.04);
                    padding: 2px;
                    border: 2px solid transparent;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .cat-pill {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--muted-text);
                    transition: color 0.2s;
                    white-space: nowrap;
                }

                .cat-wrap:hover img {
                    border-color: var(--primary-blue);
                    transform: scale(1.05);
                    box-shadow: 0 8px 16px rgba(0, 141, 255, 0.15);
                }

                .cat-wrap:hover .cat-pill {
                    color: var(--primary-blue);
                }

                .cat-wrap.active img {
                    border-color: var(--primary-blue);
                    background: linear-gradient(135deg, rgba(0, 141, 255, 0.08), rgba(0, 62, 171, 0.08));
                }

                .cat-wrap.active .cat-pill {
                    color: var(--primary-blue);
                }

                .scroll-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 2;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    transition: all 0.2s ease;
                    color: #333;
                }
                .scroll-btn:hover:not(:disabled) {
                    background: #f0f0f0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                }
                .scroll-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .scroll-btn.left {
                    left: 0;
                    margin-left: -6px;
                }
                .scroll-btn.right {
                    right: 0;
                    margin-right: -6px;
                }
                @media (max-width: 768px) {
                    .scroll-btn {
                        width: 28px;
                        height: 28px;
                    }
                    .scroll-btn svg {
                        width: 16px;
                        height: 16px;
                    }
                    .category-bar.is-sticky .cat-wrap {
                        padding: 6px 10px;
                    }
                }
            `}</style>
        </>
    );
};

export default Header;
import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import RatingsReviews from './RatingsReviews';
import CustomerQA from './CustomerQA';
import './ProductDetails.css';

// API Services
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import brandService from '../../../services/brandService';
import cartService from '../../../services/cartService';
import reviewService from '../../../services/reviewService';
import shippingService from '../../../services/shippingService';
import wishlistService from '../../../services/wishlistService';
import warrantyService from '../../../services/warrantyService';

// Components
import AuthModal from '../../User/Auth/AuthModal';

// Fallback images
import defaultImg from '../../../assets/images/products/pr1.png';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const buildImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return defaultImg;

  const cleanPath = imagePath.trim();
  if (!cleanPath) return defaultImg;

  if (/^(https?:)?\/\//i.test(cleanPath) || cleanPath.startsWith('data:') || cleanPath.startsWith('blob:')) {
    return cleanPath;
  }

  return `${API_URL}/${cleanPath.replace(/^\/+/, '')}`;
};

const parseProductImages = (images) => {
  if (Array.isArray(images)) return images;

  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Invalid product images JSON:', images, error);
      return [];
    }
  }

  return [];
};

// Toast Component
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

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    let id = '';
    if (parsed.hostname.includes('youtu.be')) id = parsed.pathname.slice(1);
    else if (parsed.pathname.includes('/shorts/')) id = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
    else if (parsed.pathname.includes('/embed/')) id = parsed.pathname.split('/embed/')[1]?.split('/')[0];
    else id = parsed.searchParams.get('v') || '';
    return id ? `https://www.youtube.com/embed/${id}` : '';
  } catch {
    return '';
  }
};

const RazorpayEmiWidget = ({ amountInRupees }) => {
  const widgetRef = useRef(null);
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    let cancelled = false;

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.RazorpayAffordabilitySuite) { resolve(); return; }
        const existingScript = document.querySelector('script[data-razorpay-affordability="true"]');
        if (existingScript) {
          existingScript.addEventListener('load', resolve, { once: true });
          existingScript.addEventListener('error', reject, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.razorpay.com/widgets/affordability/affordability.js';
        script.async = true;
        script.dataset.razorpayAffordability = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay script'));
        document.head.appendChild(script);
      });
    };

    const renderWidget = () => {
      if (cancelled || !keyId || !widgetRef.current || !window.RazorpayAffordabilitySuite || !amountInRupees) return;
      widgetRef.current.innerHTML = '';
      const amountInPaise = Math.round(Number(amountInRupees) * 100);
      const rzpAffordabilitySuite = new window.RazorpayAffordabilitySuite({ key: keyId, amount: amountInPaise });
      rzpAffordabilitySuite.render();
    };

    loadScript().then(renderWidget).catch((err) => console.error(err));
    return () => { cancelled = true; };
  }, [amountInRupees, keyId]);

  if (!keyId) return null;

  return (
    <div style={{ marginTop: '8px' }}>
      <div ref={widgetRef} id="razorpay-affordability-widget" />
    </div>
  );
};

const ProductDetails = () => {
  const [searchParams] = useSearchParams();
  const { slug } = useParams();
  const navigate = useNavigate();
  const productIdentifier = slug || searchParams.get('id');

  // Data States
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  // Rating States
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [similarRatingStats, setSimilarRatingStats] = useState({});

  // Selection States
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [activeMedia, setActiveMedia] = useState('image');
  const videoRef = useRef(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Wishlist, Share, Extended Warranty
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [extendedWarrantyAdded, setExtendedWarrantyAdded] = useState(false);

  // Delivery availability (Shiprocket)
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryChecking, setDeliveryChecking] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  // Parsed Data
  const [parsedDescription, setParsedDescription] = useState([]);
  const [parsedKeyFeatures, setParsedKeyFeatures] = useState([]);
  const [parsedSpecifications, setParsedSpecifications] = useState([]);
  const [parsedWhatsInBox, setParsedWhatsInBox] = useState([]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const getPackageValue = (keys, fallback) => {
    for (const key of keys) {
      const value = Number(product?.[key] ?? selectedVariant?.[key]);
      if (Number.isFinite(value) && value > 0) return value;
    }
    return fallback;
  };

  const handleCheckDelivery = async () => {
    const pincode = String(deliveryPincode || '').trim();

    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryError('Please enter a valid 6-digit PIN code.');
      setDeliveryInfo(null);
      return;
    }

    try {
      setDeliveryChecking(true);
      setDeliveryError('');
      setDeliveryInfo(null);

      const result = await shippingService.checkDelivery({
        deliveryPincode: pincode,
        weight: getPackageValue(['weight', 'package_weight'], 0.5),
        length: getPackageValue(['length', 'package_length'], 10),
        breadth: getPackageValue(['breadth', 'width', 'package_breadth'], 10),
        height: getPackageValue(['height', 'package_height'], 10),
        paymentMethod: 'prepaid',
      });

      if (!result?.serviceable) {
        setDeliveryError(result?.message || 'Delivery is unavailable for this PIN code.');
        return;
      }

      setDeliveryInfo(result.delivery);
    } catch (requestError) {
      setDeliveryError(
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Unable to check delivery availability right now.'
      );
    } finally {
      setDeliveryChecking(false);
    }
  };

  // ─── Fetch Main Product ────────────────────────────────────────────────────
  useEffect(() => {
    if (!productIdentifier) {
      setError('No product selected.');
      setLoading(false);
      return;
    }

    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        let fetchedProduct = /^\d+$/.test(productIdentifier)
          ? await productService.getProductById(productIdentifier)
          : await productService.getProductBySlug(productIdentifier);

        // Parse variants
        let parsedVariants = [];
        if (fetchedProduct.variants) {
          try {
            parsedVariants = typeof fetchedProduct.variants === 'string'
              ? JSON.parse(fetchedProduct.variants)
              : fetchedProduct.variants;
            if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
              setSelectedVariant(parsedVariants[0]);
            }
          } catch (e) {
            console.warn('Could not parse variants JSON');
          }
        }
        fetchedProduct.parsedVariants = parsedVariants;
        fetchedProduct.images = parseProductImages(fetchedProduct.images);
        setProduct(fetchedProduct);

        // Parse description
        if (fetchedProduct.description) {
          try {
            const desc = typeof fetchedProduct.description === 'string'
              ? JSON.parse(fetchedProduct.description)
              : fetchedProduct.description;
            setParsedDescription(Array.isArray(desc) ? desc : []);
          } catch (e) {
            setParsedDescription([]);
          }
        }

        // Parse key_features
        if (fetchedProduct.key_features) {
          try {
            const features = typeof fetchedProduct.key_features === 'string'
              ? JSON.parse(fetchedProduct.key_features)
              : fetchedProduct.key_features;
            setParsedKeyFeatures(Array.isArray(features) ? features : []);
          } catch (e) {
            setParsedKeyFeatures([]);
          }
        }

        // Parse specifications
        if (fetchedProduct.specifications) {
          try {
            const specs = typeof fetchedProduct.specifications === 'string'
              ? JSON.parse(fetchedProduct.specifications)
              : fetchedProduct.specifications;
            setParsedSpecifications(Array.isArray(specs) ? specs : []);
          } catch (e) {
            setParsedSpecifications([]);
          }
        }

        // Parse "what's in the box"
        let boxItems = [];
        if (fetchedProduct.whats_in_the_box) {
          try {
            boxItems = typeof fetchedProduct.whats_in_the_box === 'string'
              ? JSON.parse(fetchedProduct.whats_in_the_box)
              : fetchedProduct.whats_in_the_box;
          } catch (e) {
            boxItems = [];
          }
        }
        if (!boxItems.length && parsedDescription.length) {
          const boxEntry = parsedDescription.find(
            (item) => item.title && item.title.toLowerCase().includes('box')
          );
          if (boxEntry && boxEntry.text) {
            const lines = boxEntry.text
              .replace(/<[^>]*>/g, '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean);
            boxItems = lines.length ? lines : [boxEntry.text.replace(/<[^>]*>/g, '')];
          }
        }
        setParsedWhatsInBox(boxItems);

        // Set active image
        if (fetchedProduct.images.length > 0) {
          const primaryImg =
            fetchedProduct.images.find((img) => Number(img?.is_primary) === 1 || img?.is_primary === true) ||
            fetchedProduct.images[0];

          setActiveImage(buildImageUrl(primaryImg?.image_path));
          setActiveMedia('image');
        } else {
          setActiveImage(defaultImg);
          setActiveMedia(fetchedProduct.video_url ? 'video' : 'image');
        }

        // Fetch related data
        const apiCalls = [];

        apiCalls.push(
          reviewService.getReviewStats(fetchedProduct.id)
            .then((res) => setRatingStats(res))
            .catch(() => {})
        );

        if (fetchedProduct.category_id) {
          apiCalls.push(
            categoryService.getCategoryById(fetchedProduct.category_id)
              .then((res) => setCategory(res))
              .catch(() => {})
          );
          apiCalls.push(
            productService.getAllProducts({ categoryId: fetchedProduct.category_id, activeOnly: true })
              .then((res) => setSimilarProducts(res.filter((p) => p.id !== fetchedProduct.id).slice(0, 5)))
              .catch(() => {})
          );
        }

        if (fetchedProduct.brand_id) {
          apiCalls.push(
            brandService.getBrandById(fetchedProduct.brand_id)
              .then((res) => setBrand(res))
              .catch(() => {})
          );
        }

        await Promise.all(apiCalls);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productIdentifier]);

  // ─── Fetch Ratings for Similar Products ──────────────────────────────────
  useEffect(() => {
    if (similarProducts.length > 0) {
      const fetchSimilarRatings = async () => {
        const statsMap = {};
        await Promise.all(
          similarProducts.map(async (prod) => {
            try {
              statsMap[prod.id] = await reviewService.getReviewStats(prod.id);
            } catch {
              statsMap[prod.id] = { averageRating: 0, totalReviews: 0 };
            }
          })
        );
        setSimilarRatingStats(statsMap);
      };
      fetchSimilarRatings();
    }
  }, [similarProducts]);

  useEffect(() => {
    if (activeMedia !== "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [activeMedia]);

  // ─── FETCH WISHLIST STATUS ──────────────────────────────────────────────────
  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token || !product?.id) return;

      try {
        const wishlistItems = await wishlistService.getWishlist();
        const isInWishlist = wishlistItems.some(item => Number(item.id) === Number(product.id));
        setIsWishlisted(isInWishlist);
      } catch (err) {
        console.warn('Failed to fetch wishlist status:', err);
      }
    };

    checkWishlist();
  }, [product?.id]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    // Reset warranty when variant changes (optional)
    setExtendedWarrantyAdded(false);
    if (variant.image || variant.image_url) {
      setActiveImage(buildImageUrl(variant.image || variant.image_url));
    }
  };

  // ─── COMPUTED TOTAL PRICE (including extended warranty) ────────────────────
  // 🔥 FIX: Convert basePrice to a number to avoid string concatenation
  const basePrice = Number(selectedVariant?.selling_price || selectedVariant?.price || product?.selling_price || 0);
  const warrantyPrice = Number(product?.extended_warranty_price) || 0;
  const finalPrice = basePrice + (extendedWarrantyAdded ? warrantyPrice : 0);

  // ─── Add to Cart / Buy Now ────────────────────────────────────────────────

  // Helper to add warranty to cart (assumes your cart service supports addWarranty)
  // If not, you can modify this to add a separate cart item or combine with main product.
  const addWarrantyToCart = async (productId, variantId, warrantyPrice) => {
    // Example: if your cart service has a dedicated method
    if (cartService.addWarranty) {
      await cartService.addWarranty(productId, variantId, warrantyPrice);
    } else {
      // Fallback: add as a separate item with a special flag
      // This depends on your backend; adjust accordingly.
      await cartService.addToCart(productId, 1, variantId, { isWarranty: true, warrantyPrice });
    }
  };

// ─── Add to Cart / Buy Now ────────────────────────────────────────────────

const handleAddToCart = async () => {
  const token = localStorage.getItem('token');
  if (!token) return setIsAuthModalOpen(true);

  try {
    // 1. Add main product to cart
    await cartService.addToCart(product.id, quantity, selectedVariant?.id);

    // 2. If warranty is selected, add it as a separate cart item
    if (extendedWarrantyAdded && warrantyPrice > 0) {
      // Add warranty to cart (as a separate item)
      await cartService.addWarrantyToCart(
        product.id,
        selectedVariant?.id,
        product.extended_warranty_name,
        warrantyPrice
      );
      // (Optional) Record the warranty purchase in the dedicated table
      await warrantyService.addWarranty({
        productId: product.id,
        variantId: selectedVariant?.id,
        warrantyName: product.extended_warranty_name,
        warrantyPrice: warrantyPrice,
        totalPrice: finalPrice,
      });
      showToast(`Extended warranty (₹${warrantyPrice}) added to cart!`, 'success');
    } else {
      showToast('Successfully added to cart! 🛒');
    }
  } catch (err) {
    if (err.response?.status === 401) setIsAuthModalOpen(true);
    else showToast(err.response?.data?.message || 'Error adding to cart.', 'error');
  }
};

const handleBuyNow = async () => {
  const token = localStorage.getItem('token');
  if (!token) return setIsAuthModalOpen(true);

  try {
    // 1️⃣ FIRST: Add the main product to the cart (with variant)
    await cartService.addToCart(product.id, quantity, selectedVariant?.id);

    // 2️⃣ SECOND: If warranty is selected, add it as a separate cart item
    if (extendedWarrantyAdded && warrantyPrice > 0) {
      await cartService.addWarrantyToCart(
        product.id,
        selectedVariant?.id,
        product.extended_warranty_name,
        warrantyPrice
      );
      // (Optional) Also record the warranty purchase in the warranty table
      await warrantyService.addWarranty({
        productId: product.id,
        variantId: selectedVariant?.id,
        warrantyName: product.extended_warranty_name,
        warrantyPrice: warrantyPrice,
        totalPrice: finalPrice,
      });
      showToast(`Extended warranty (₹${warrantyPrice}) added!`, 'success');
    }

    // 3️⃣ Navigate to the cart page
    navigate('/cart');
  } catch (err) {
    if (err.response?.status === 401) {
      setIsAuthModalOpen(true);
    } else {
      showToast(err.response?.data?.message || 'Error processing Buy Now.', 'error');
    }
  }
};
  // ─── WISHLIST TOGGLE ──────────────────────────────────────────────────────
  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    const wasWishlisted = isWishlisted;
    setIsWishlisted(!wasWishlisted);

    try {
      if (wasWishlisted) {
        await wishlistService.removeFromWishlist(product.id);
        showToast('Removed from wishlist', 'success');
      } else {
        await wishlistService.addToWishlist(product.id);
        showToast('Added to wishlist ❤️', 'success');
      }
    } catch (err) {
      setIsWishlisted(wasWishlisted);
      const errorMsg = err.response?.data?.message || 'Failed to update wishlist';
      showToast(errorMsg, 'error');
    }
  };

  // ─── Share modal helpers ────────────────────────────────────────────
  const shareLink = window.location.href;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareLink).then(() => {
        showToast('Link copied to clipboard!');
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = shareLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Link copied!');
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Link copied!');
    }
  };

  const openShareWindow = (url) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  // ─── Pricing & Display ────────────────────────────────────────────────────
  const currentMrp = selectedVariant?.mrp || selectedVariant?.original_price || product?.mrp || 0;
  const currentStockStatus = selectedVariant?.stock_status ||
    (selectedVariant?.stock_quantity > 0 ? 'in_stock' : null) ||
    product?.stock_status ||
    'in_stock';
  const currentSku = selectedVariant?.sku || product?.sku;
  const discountPercent = currentMrp > basePrice
    ? Math.round(((currentMrp - basePrice) / currentMrp) * 100)
    : 0;

  const displayImages =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
          .map((img) => buildImageUrl(img?.image_path))
          .filter(Boolean)
      : [defaultImg];

  // ─── Build Tabs Dynamically ──────────────────────────────────────────────
  const tabs = [];

  tabs.push({ key: 'overview', label: 'Overview' });

  if (parsedKeyFeatures.length > 0) {
    tabs.push({ key: 'features', label: 'Features' });
  }

  if (parsedSpecifications.length > 0 && parsedSpecifications.some(s => s.spec_name || s.group_name)) {
    tabs.push({ key: 'specifications', label: 'Technical Specifications' });
  }

  if (parsedWhatsInBox.length > 0) {
    tabs.push({ key: 'whats-in-box', label: "What's in the Box" });
  }

  if (product?.warranty) {
    tabs.push({ key: 'warranty', label: 'Warranty' });
  }

  tabs.push({ key: 'downloads', label: 'Downloads' });

  tabs.push({ key: 'reviews', label: `Reviews (${ratingStats.totalReviews || 0})` });

  tabs.push({ key: 'qa', label: `Q&A (38)` });

  // ─── Render Tab Content ──────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'features':
        return renderFeaturesTab();
      case 'specifications':
        return renderSpecificationsTab();
      case 'whats-in-box':
        return renderWhatsInBoxTab();
      case 'warranty':
        return renderWarrantyTab();
      case 'downloads':
        return renderDownloadsTab();
      case 'reviews':
        return <RatingsReviews productId={product?.id} />;
      case 'qa':
        return <CustomerQA />;
      default:
        return renderOverviewTab();
    }
  };

  // ─── Tab Renderers ────────────────────────────────────────────────────────

  const renderOverviewTab = () => {
    const hasDescription = parsedDescription.length > 0;
    const hasFeatures = parsedKeyFeatures.length > 0;
    const fallbackDesc = product?.short_description || product?.description || '';
    return (
      <div className="pdp-tab-content-overview">
        <div className="overview-text">
          <h2>{product?.name}</h2>

          {hasDescription ? (
            parsedDescription.map((item, idx) => (
              <div key={idx} className="desc-block">
                {item.title && <h3>{item.title}</h3>}
                {item.text && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: typeof item.text === 'string' ? item.text : JSON.stringify(item.text)
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <p>{fallbackDesc}</p>
          )}

          {hasFeatures && (
            <>
              <h3>Key Features</h3>
              <ul className="feature-list">
                {parsedKeyFeatures.map((feature, idx) => (
                  <li key={idx}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="overview-meta-grid">
            {product?.model_number && (
              <div className="meta-item">
                <span className="label">Model</span>
                <span className="value">{product.model_number}</span>
              </div>
            )}
            {product?.manufacturer && (
              <div className="meta-item">
                <span className="label">Manufacturer</span>
                <span className="value">{product.manufacturer}</span>
              </div>
            )}
            {product?.country_of_origin && (
              <div className="meta-item">
                <span className="label">Country of Origin</span>
                <span className="value">{product.country_of_origin}</span>
              </div>
            )}
            {product?.hsn_code && (
              <div className="meta-item">
                <span className="label">HSN Code</span>
                <span className="value">{product.hsn_code}</span>
              </div>
            )}
            {product?.condition && (
              <div className="meta-item">
                <span className="label">Condition</span>
                <span className="value">{product.condition}</span>
              </div>
            )}
          </div>
        </div>

        <div className="overview-media">
          <img
            src={activeImage || defaultImg}
            alt={product?.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = defaultImg;
            }}
          />
        </div>
      </div>
    );
  };

  const renderFeaturesTab = () => {
    if (!parsedKeyFeatures.length) {
      return (
        <div className="tab-empty-state">
          <p>No feature information available for this product.</p>
        </div>
      );
    }

    return (
      <div className="pdp-tab-features">
        <div className="features-grid">
          {parsedKeyFeatures.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <p>{feature}</p>
            </div>
          ))}
        </div>

        {product?.key_features && typeof product.key_features === 'string' && (
          <div className="features-raw">
            <small>Raw data: {product.key_features}</small>
          </div>
        )}
      </div>
    );
  };

  const renderSpecificationsTab = () => {
    const validSpecs = parsedSpecifications.filter(
      (s) => s.spec_name || s.group_name || s.spec_value
    );

    if (!validSpecs.length) {
      return (
        <div className="tab-empty-state">
          <p>No technical specifications available for this product.</p>
        </div>
      );
    }

    const grouped = {};
    let hasGroups = false;
    validSpecs.forEach((spec) => {
      const group = spec.group_name || 'General';
      if (group.trim()) hasGroups = true;
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(spec);
    });

    if (!hasGroups) {
      const general = { 'General': [] };
      validSpecs.forEach((spec) => {
        general['General'].push(spec);
      });
      return renderSpecGroup(general);
    }

    return renderSpecGroup(grouped);
  };

  const renderSpecGroup = (grouped) => {
    return (
      <div className="pdp-tab-specifications">
        {Object.entries(grouped).map(([groupName, specs]) => {
          const filtered = specs.filter((s) => s.spec_name || s.spec_value);
          if (!filtered.length) return null;
          return (
            <div key={groupName} className="spec-group">
              <h3>{groupName}</h3>
              <table className="spec-table">
                <tbody>
                  {filtered.map((spec, idx) => (
                    <tr key={idx}>
                      <td className="spec-label">{spec.spec_name || '—'}</td>
                      <td className="spec-value">{spec.spec_value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWhatsInBoxTab = () => {
    if (!parsedWhatsInBox.length) {
      return (
        <div className="tab-empty-state">
          <p>No "What's in the Box" information available.</p>
        </div>
      );
    }

    return (
      <div className="pdp-tab-whats-in-box">
        <ul className="box-list">
          {parsedWhatsInBox.map((item, idx) => (
            <li key={idx}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderWarrantyTab = () => {
    const warrantyText = product?.warranty || 'No warranty information available.';

    return (
      <div className="pdp-tab-warranty">
        <div className="warranty-card">
          <div className="warranty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div className="warranty-content">
            <h3>Warranty</h3>
            <p>{warrantyText}</p>
            {product?.return_policy_id && (
              <div className="warranty-meta">
                <span>Return Policy: {product.return_policy_id}</span>
              </div>
            )}
            {product?.condition && (
              <div className="warranty-meta">
                <span>Condition: {product.condition}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDownloadsTab = () => {
    return (
      <div className="pdp-tab-downloads">
        <div className="downloads-grid">
          <div className="download-item">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            <span>User Manual</span>
            <small>PDF, 2.4 MB</small>
            <button className="download-btn">Download</button>
          </div>
          <div className="download-item">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            <span>Quick Start Guide</span>
            <small>PDF, 856 KB</small>
            <button className="download-btn">Download</button>
          </div>
          <div className="download-item">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            <span>Product Datasheet</span>
            <small>PDF, 1.2 MB</small>
            <button className="download-btn">Download</button>
          </div>
        </div>
        <p className="downloads-note">
          * All downloads are provided in PDF format. You may need a PDF reader to view these files.
        </p>
      </div>
    );
  };

  // ─── Loading / Error ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="loader-container">
          <div className="loader-spinner" />
          <p>Loading Product Details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="error-container">
          <h2>{error || 'Product not found'}</h2>
          <Link to="/">Return to Home</Link>
        </div>
      </Layout>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <Layout>
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ─── Share Modal ──────────────────────────────────────────────────── */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-product-info">
              <h3>{product.name}</h3>
              <div className="share-rating">
                <span className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(ratingStats.averageRating || 0) ? '#facc15' : '#e5e7eb'} stroke="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  ))}
                </span>
                <span className="rating-val">
                  {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : '—'}
                </span>
                <span className="review-count">({ratingStats.totalReviews || 0})</span>
              </div>
              <div className="share-price">₹{finalPrice?.toLocaleString('en-IN')}<span className="decimals">.00</span></div>
            </div>

            <div className="share-modal-header">
              <span>Share link</span>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="share-link-box">
              <input type="text" value={shareLink} readOnly />
              <button onClick={handleCopyLink}>Copy</button>
            </div>
            <div className="share-options">
              {/* WhatsApp */}
              <div className="share-option" onClick={() => openShareWindow(`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name)}%20${encodeURIComponent(shareLink)}`)}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </div>
              {/* Gmail */}
              <div className="share-option" onClick={() => openShareWindow(`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(shareLink)}`)}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>Gmail</span>
              </div>
              {/* Facebook */}
              <div className="share-option" onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`)}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </div>
              {/* Twitter */}
              <div className="share-option" onClick={() => openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(product.name)}`)}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Twitter</span>
              </div>
              {/* LinkedIn */}
              <div className="share-option" onClick={() => openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`)}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </div>
              {/* Nearby Sharing */}
              <div className="share-option">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
                <span>Nearby</span>
              </div>
              {/* Zoom */}
              <div className="share-option">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M14.5 3L7 10.5 9.5 13 17 5.5zM7 13.5L9.5 16 17 8.5 14.5 6z"/>
                  <path d="M22 8.5L17 13.5 22 18.5z"/>
                </svg>
                <span>Zoom</span>
              </div>
              {/* Outlook */}
              <div className="share-option">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M12 1L3 5v6l9 4 9-4V5zm0 6.5L6.5 8 12 9.5 17.5 8zM3 13v6l9 4 9-4v-6l-9 4z"/>
                </svg>
                <span>Outlook</span>
              </div>
              {/* Copilot */}
              <div className="share-option">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
                <span>Copilot</span>
              </div>
              {/* Microsoft 365 Copilot */}
              <div className="share-option">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/>
                </svg>
                <span>M365</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pdp-wrapper fade-in">

        {/* ─── Breadcrumbs ──────────────────────────────────────────────────── */}
        <div className="pdp-breadcrumb">
          <Link to="/">Home</Link> <span className="separator">&gt;</span>
          {category ? (
            <>
              <Link to={`/category/${category.slug}`}>{category.name}</Link>
              <span className="separator">&gt;</span>
            </>
          ) : (
            <>
              <Link to="/search?q=">Products</Link>
              <span className="separator">&gt;</span>
            </>
          )}
          {brand && (
            <>
              <Link to={`/search?brand=${brand.id}`}>{brand.name}</Link>
              <span className="separator">&gt;</span>
            </>
          )}
          <span className="current">{product.name}</span>
        </div>

        {/* ─── TOP ROW: 3 Columns ────────────────────────────────────────────── */}
        <div className="pdp-top-row">

          {/* COLUMN 1: Gallery */}
          <div className="pdp-gallery-col">
            <div className="pdp-thumbnails-vertical">
              {displayImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  className={`pdp-thumb ${activeMedia === 'image' && activeImage === img ? 'active' : ''}`}
                  onClick={() => { setActiveImage(img); setActiveMedia('image'); }}
                  onMouseEnter={() => { setActiveImage(img); setActiveMedia('image'); }}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = defaultImg;
                  }}
                />
              ))}
              {product.video_url && (
                <button
                  type="button"
                  className={`pdp-video-thumb ${activeMedia === 'video' ? 'active' : ''}`}
                  onClick={() => setActiveMedia('video')}
                  aria-label="Play product video"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="7 4 20 12 7 20 7 4" />
                  </svg>
                  <span>Video</span>
                </button>
              )}
              <div className="thumb-more-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            <div className="pdp-main-image-container">
              {activeMedia === 'video' && product.video_url ? (
                product.video_type === 'youtube' ? (
                  <iframe
                    className="pdp-main-video"
                    src={getYouTubeEmbedUrl(product.video_url)}
                    title={`${product.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="pdp-video-wrapper">
                    {videoLoading && (
                      <div className="pdp-video-loader">
                        <div className="pdp-video-spinner"></div>
                        <span>Loading video...</span>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      key={product.video_url}
                      className="pdp-main-video"
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onLoadStart={() => setVideoLoading(true)}
                      onWaiting={() => setVideoLoading(true)}
                      onCanPlay={() => setVideoLoading(false)}
                      onPlaying={() => setVideoLoading(false)}
                      onError={() => setVideoLoading(false)}
                    >
                      <source src={buildImageUrl(product.video_url)} type="video/mp4" />
                      Your browser does not support product videos.
                    </video>
                    <img src="/images/product-video-banner.jpg" alt="Product Video" className="pdp-video-banner" />
                  </div>
                )
              ) : (
                <img
                  src={activeImage || defaultImg}
                  alt={product.name}
                  className="pdp-main-image"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = defaultImg;
                  }}
                />
              )}
              {activeMedia === 'image' && <div className="hover-zoom-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                Hover to zoom
              </div>}
              <div className="pdp-media-toggles">
                <button type="button" className={activeMedia === 'image' ? 'active' : ''} onClick={() => setActiveMedia('image')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {displayImages.length} Images
                </button>
                {product.video_url && (
                  <button type="button" className={activeMedia === 'video' ? 'active' : ''} onClick={() => setActiveMedia('video')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    1 Video
                  </button>
                )}
                <button>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12c0-5.52 4.48-10 10-10s10 4.48 10 10" />
                    <path d="M12 22c-5.52 0-10-4.48-10-10" />
                    <polyline points="15 9 12 12 9 9" />
                  </svg>
                  360° View
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Product Info */}
          <div className="pdp-info-col">
            <div className="pdp-badges">
              {product.is_new == 1 ? <span className="badge-new">New</span> : null}
              {product.is_best_seller == 1 ? <span className="badge-bestseller">Best Seller</span> : null}
              {product.is_trending == 1 ? <span className="badge-trending">Trending</span> : null}
              {product.is_refurbished == 1 ? <span className="badge-refurbished">Refurbished</span> : null}
              {Number(discountPercent) > 0 ? (
                <span className="badge-discount">{discountPercent}% OFF</span>
              ) : null}
            </div>

            <h1 className="pdp-title">{product.name}</h1>

            {/* rating links with wishlist & share icons */}
            <div className="pdp-rating-links">
              <div className="stars-container">
                <span className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={i < Math.round(ratingStats.averageRating || 0) ? '#facc15' : '#e5e7eb'}
                      stroke="none"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  ))}
                </span>
                <span className="rating-val">
                  {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : '—'}
                </span>
              </div>
              <a href="#reviews" className="link-text">
                ({ratingStats.totalReviews > 0 ? ratingStats.totalReviews : 0} Reviews)
              </a>
              <span className="dot-sep">•</span>
              <a href="#qa" className="link-text">38 Questions Answered</a>

              {/* Action icons: Wishlist & Share */}
              <div className="action-icons">
                <button className="wishlist-icon-btn" onClick={handleWishlistToggle}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={isWishlisted ? '#ef4444' : 'none'}
                    stroke={isWishlisted ? '#ef4444' : 'currentColor'}
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button className="share-btn" onClick={() => setShowShareModal(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ─── PRICE DISPLAY (uses finalPrice) ─────────────────────────── */}
            <div className="pdp-pricing">
              <div className="price-main">
                ₹{finalPrice?.toLocaleString('en-IN')}<span className="decimals">.00</span>
              </div>
              <div className="price-sub">
                {currentMrp > finalPrice && (
                  <span className="mrp">MRP: <del>₹{currentMrp?.toLocaleString('en-IN')}.00</del></span>
                )}
                {discountPercent > 0 && <span className="discount">{discountPercent}% OFF</span>}
              </div>
              <div className="tax-inclusive">(Inclusive of all taxes)</div>
              {extendedWarrantyAdded && warrantyPrice > 0 && (
                <div className="warranty-included" style={{ color: '#2563eb', fontSize: '0.9rem', marginTop: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  Extended warranty added (+₹{warrantyPrice})
                </div>
              )}
            </div>

            {/* Variants */}
            {product.parsedVariants && product.parsedVariants.length > 0 && (
              <div className="pdp-variants">
                {product.parsedVariants.map((v, idx) => (
                  <button
                    key={idx}
                    className={`variant-btn ${selectedVariant === v ? 'active' : ''}`}
                    onClick={() => handleVariantChange(v)}
                  >
                    {v.name || v.variant_name || v.attribute_value || `Option ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* EMI Widget – uses finalPrice */}
            <div>
              <strong>EMI from ₹{Math.round(finalPrice / 12)}/month</strong>
              <RazorpayEmiWidget amountInRupees={finalPrice} />
            </div>

            {/* ─── NEW WARRANTY SECTION (with toggle) ─────────────────────── */}
            <div className="pdp-warranty-section">
              <div className="warranty-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span>Warranty</span>
              </div>

              {/* Dynamic extended warranty */}
              {product?.extended_warranty_name && Number(product.extended_warranty_price) > 0 && (
                <div className="extended-warranty-row">
                  <span>
                    {product.extended_warranty_name} at ₹{Number(product.extended_warranty_price).toLocaleString('en-IN')}
                  </span>
                  <button
                    className={`add-warranty-btn ${extendedWarrantyAdded ? 'added' : ''}`}
                    onClick={() => {
                      setExtendedWarrantyAdded(!extendedWarrantyAdded);
                      showToast(
                        extendedWarrantyAdded ? 'Extended warranty removed' : 'Extended warranty added!',
                        'success'
                      );
                    }}
                  >
                    {extendedWarrantyAdded ? 'Added' : 'Add'}
                  </button>
                </div>
              )}

              {product.is_refurbished == 1 && (
                <div className="condition-badges">
                  <span>Condition: </span>
                  <span className="badge best">Best Value</span>
                  <span className="badge fair">Fair</span>
                  <span className="badge good">Good</span>
                  <span className="badge superb">Superb</span>
                </div>
              )}
            </div>

            <div className="pdp-perks-list">
              <div className="perk-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
                </svg>
                <div><strong>GST Invoice Available</strong></div>
              </div>
              <div className="perk-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <div><strong>10 Days Replacement Policy</strong></div>
              </div>
            </div>

            <table className="pdp-quick-specs">
              <tbody>
                {brand && (
                  <tr>
                    <td>Brand</td>
                    <td><strong>{brand.name}</strong></td>
                  </tr>
                )}
                {product.manufacturer && !brand && (
                  <tr>
                    <td>Manufacturer</td>
                    <td><strong>{product.manufacturer}</strong></td>
                  </tr>
                )}
                <tr>
                  <td>SKU</td>
                  <td><strong>{currentSku || 'N/A'}</strong></td>
                </tr>
                <tr>
                  <td>Availability</td>
                  <td className={currentStockStatus === 'in_stock' ? 'text-green' : 'text-red'}>
                    <strong>{currentStockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}</strong>
                  </td>
                </tr>
                {product.stock_quantity !== undefined && (
                  <tr>
                    <td>Qty Available</td>
                    <td><strong>{product.stock_quantity} units</strong></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* COLUMN 3: Action Box */}
          <div className="pdp-action-col">
            <div className="action-box">
              <div className="action-price-header">
                ₹{finalPrice?.toLocaleString('en-IN')}<span className="decimals">.00</span>
                {extendedWarrantyAdded && warrantyPrice > 0 && (
                  <span style={{ fontSize: '0.7rem', marginLeft: '8px', color: '#2563eb' }}>
                    (+₹{warrantyPrice} warranty)
                  </span>
                )}
              </div>

              <div className="action-delivery">
                <label>Delivery PIN code</label>
                <div className="pincode-input-grp">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code"
                    value={deliveryPincode}
                    onChange={(event) => {
                      setDeliveryPincode(event.target.value.replace(/\D/g, ''));
                      setDeliveryError('');
                      setDeliveryInfo(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !deliveryChecking) handleCheckDelivery();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCheckDelivery}
                    disabled={deliveryChecking}
                  >
                    {deliveryChecking ? 'Checking...' : 'Check'}
                  </button>
                </div>

                {deliveryError && <p className="delivery-error-message">{deliveryError}</p>}

                {deliveryInfo && (
                  <div className="delivery-status">
                    <p className="loc">Delivery available to PIN code {deliveryInfo.pincode}</p>
                    <p className="time text-green">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      {deliveryInfo.deliveryLabel
                        ? `Estimated delivery by ${deliveryInfo.deliveryLabel}`
                        : `${deliveryInfo.estimatedDays || ''} day delivery estimate`}
                    </p>
                    {deliveryInfo.courierName && (
                      <p className="delivery-courier">Courier: {deliveryInfo.courierName}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="action-qty">
                <label>Quantity</label>
                <div className="qty-wrapper">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                  <input type="text" value={quantity} readOnly />
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={currentStockStatus !== 'in_stock'}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-cart"
                  disabled={currentStockStatus !== 'in_stock'}
                  onClick={handleAddToCart}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  ADD TO CART
                </button>
                <button
                  className="btn-buy"
                  disabled={currentStockStatus !== 'in_stock'}
                  onClick={handleBuyNow}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  BUY NOW
                </button>
              </div>

              <div className="secure-checkout">
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure Checkout
                </span>
                <div className="payment-icons">
                  <div className="pay-icon">VISA</div>
                  <div className="pay-icon mc">MC</div>
                  <div className="pay-icon rupay">RuPay</div>
                  <div className="pay-icon upi">UPI</div>
                </div>
              </div>
            </div>

            <div className="why-buy-box">
              <h4>Why buy from Eronix?</h4>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2 2 4-4" />
                  </svg>
                  100% Original Products
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Official Brand Warranty
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure Payments
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Fast & Reliable Delivery
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  </svg>
                  GST Invoice on Every Order
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  24x7 Customer Support
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── FEATURE BAR ────────────────────────────────────────────────────── */}
        <div className="pdp-feature-bar">
          <div className="fb-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            <div><strong>Premium Quality</strong><span>Built to last</span></div>
          </div>
          <div className="fb-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <div><strong>Free Shipping</strong><span>On orders above ₹499</span></div>
          </div>
          <div className="fb-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div><strong>Secure Payments</strong><span>100% protected</span></div>
          </div>
          <div className="fb-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <div><strong>10 Day Returns</strong><span>Hassle-free</span></div>
          </div>
          <div className="fb-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <div><strong>1 Year Warranty</strong><span>Manufacturer warranty</span></div>
          </div>
          <div className="fb-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <div><strong>Expert Support</strong><span>24/7 assistance</span></div>
          </div>
        </div>

        {/* ─── TABS Navigation ────────────────────────────────────────────────── */}
        <div className="pdp-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TABS Content ───────────────────────────────────────────────────── */}
        <div className="pdp-tab-content">
          {renderTabContent()}
        </div>

        {/* ─── Similar Products ───────────────────────────────────────────────── */}
        {similarProducts.length > 0 && (
          <div className="pdp-similar-section">
            <div className="section-header">
              <h2>You May Also Like</h2>
              <a href="#">View All &gt;</a>
            </div>
            <div className="similar-grid">
              {similarProducts.map((prod) => {
                const stats = similarRatingStats[prod.id];
                const pDisc = prod.mrp > prod.selling_price
                  ? Math.round(((prod.mrp - prod.selling_price) / prod.mrp) * 100)
                  : 0;
                return (
                  <div key={prod.id} className="similar-card">
                    <div className="card-top">
                      {pDisc > 0 && <span className="discount-badge">{pDisc}% OFF</span>}
                      <button className="wishlist-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                    <Link to={`/product/${prod.slug || prod.id}`}>
                      <img
                        src={buildImageUrl(parseProductImages(prod.images)?.[0]?.image_path)}
                        alt={prod.name}
                        className="card-img"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = defaultImg;
                        }}
                      />
                      <h4 className="card-title">{prod.name}</h4>
                    </Link>
                    <div className="card-rating">
                      <span className="star-val">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15" stroke="none">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        {stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
                      </span>
                      <span className="rev-count">({stats?.totalReviews || 0})</span>
                    </div>
                    <div className="card-price-row">
                      <span className="price">₹{prod.selling_price?.toLocaleString('en-IN')}</span>
                      {prod.mrp > prod.selling_price && (
                        <span className="mrp">₹{prod.mrp?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <button className="card-add-btn">ADD TO CART</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── BOTTOM: Reviews & QA ──────────────────────────────────────────── */}
        <div className="pdp-bottom-split">
          <RatingsReviews productId={product?.id} />
          <CustomerQA />
        </div>

      </div>
    </Layout>
  );
};

export default ProductDetails;
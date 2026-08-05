// frontend/src/pages/GameZone/GameStore/GameStore.jsx
import React, { useState } from 'react';
import {
  FiShoppingCart, FiSearch, FiFilter, FiX, FiPlus, FiMinus,
  FiTrash2, FiCreditCard, FiDollarSign, FiSmartphone, FiLock,
  FiCheckCircle, FiTruck, FiHeadphones, FiShield, FiStar, FiZap,
  FiArrowRight, FiExternalLink, FiHeart, FiEye, FiUser, FiMail,
  FiMapPin
} from 'react-icons/fi';
import { FaGamepad, FaSteam, FaPlaystation, FaXbox, FaDiscord, FaTwitch } from 'react-icons/fa';
import { SiPhonepe, SiGooglepay } from 'react-icons/si';
import GameZoneLayout from '../../../components/layout/GameZoneLayout';
import '../../GameZone/GamingZone.css'; 

// Fallback image handler
const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop';
};

// Mock Product Data
const initialProducts = [
  {
    id: 1,
    name: 'EA SPORTS FC 26',
    category: 'game-key',
    price: 3499,
    originalPrice: 4999,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop',
    badge: 'HOT',
    platform: 'PC',
    description: 'Official Ultimate Edition Key, instant delivery.',
    rating: 4.8,
    inStock: true
  },
  {
    id: 2,
    name: 'Call of Duty: Modern Warfare III',
    category: 'game-key',
    price: 3999,
    originalPrice: 5499,
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&h=400&fit=crop',
    badge: 'NEW',
    platform: 'PC/PS5',
    description: 'Cross-gen bundle + bonus content.',
    rating: 4.9,
    inStock: true
  },
  {
    id: 3,
    name: 'Razer DeathAdder V3',
    category: 'accessory',
    price: 4999,
    originalPrice: 7999,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop',
    badge: '-37%',
    platform: 'Accessory',
    description: 'Ultra-lightweight ergonomic gaming mouse.',
    rating: 4.7,
    inStock: true
  },
  {
    id: 4,
    name: 'HyperX Cloud II Wireless',
    category: 'accessory',
    price: 9999,
    originalPrice: 12999,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
    badge: 'BEST',
    platform: 'Accessory',
    description: '7.1 Surround Sound, 30h battery.',
    rating: 4.9,
    inStock: true
  },
  {
    id: 5,
    name: '₹500 Gaming Top-Up',
    category: 'topup',
    price: 500,
    originalPrice: 500,
    image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=400&h=400&fit=crop',
    badge: 'INSTANT',
    platform: 'Wallet',
    description: 'Add funds to your Eronix Wallet instantly.',
    rating: 5.0,
    inStock: true
  },
  {
    id: 6,
    name: 'Eronix Elite T-Shirt',
    category: 'merch',
    price: 1299,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    badge: 'LIMITED',
    platform: 'Merch',
    description: 'Premium cotton, exclusive design.',
    rating: 4.6,
    inStock: true
  },
  {
    id: 7,
    name: 'Steam Wallet Code $20',
    category: 'topup',
    price: 1799,
    originalPrice: 1999,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop',
    badge: 'SAVE 10%',
    platform: 'Steam',
    description: 'Digital code sent via email.',
    rating: 4.9,
    inStock: true
  },
  {
    id: 8,
    name: 'PlayStation Store GC ₹1000',
    category: 'topup',
    price: 1000,
    originalPrice: 1000,
    image: 'https://images.unsplash.com/photo-1606144042871-29c7458ecb05?w=400&h=400&fit=crop',
    badge: 'CASHBACK',
    platform: 'PSN',
    description: 'Add directly to your PSN wallet.',
    rating: 4.8,
    inStock: true
  },
  {
    id: 9,
    name: 'Eronix Gaming Hoodie',
    category: 'merch',
    price: 3499,
    originalPrice: 5999,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop',
    badge: 'WINTER',
    platform: 'Merch',
    description: 'Fleece lined, embroidered logo.',
    rating: 4.7,
    inStock: true
  },
  {
    id: 10,
    name: 'Grand Theft Auto V',
    category: 'game-key',
    price: 1299,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=400&h=400&fit=crop',
    badge: '-56%',
    platform: 'PC',
    description: 'Premium Edition + Criminal Enterprise Pack',
    rating: 4.9,
    inStock: true
  },
  {
    id: 11,
    name: 'Logitech G Pro X Keyboard',
    category: 'accessory',
    price: 14999,
    originalPrice: 18999,
    image: 'https://images.unsplash.com/photo-1595044426077-d36d9236d44f?w=400&h=400&fit=crop',
    badge: 'PRO',
    platform: 'Accessory',
    description: 'LIGHTSPEED wireless, mechanical switches.',
    rating: 4.8,
    inStock: false
  },
  {
    id: 12,
    name: 'Eronix Gaming Mat',
    category: 'merch',
    price: 799,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    badge: 'NEW',
    platform: 'Merch',
    description: 'Large RGB mouse pad, non-slip base.',
    rating: 4.5,
    inStock: true
  },
];

const categories = [
  { id: 'all', name: 'All Products', icon: <FiZap /> },
  { id: 'game-key', name: 'Game Keys', icon: <FaGamepad /> },
  { id: 'accessory', name: 'Accessories', icon: <FiHeadphones /> },
  { id: 'topup', name: 'Top-Ups & Credits', icon: <FiDollarSign /> },
  { id: 'merch', name: 'Merchandise', icon: <FiHeart /> },
];

const GameStore = () => {
  // State
  const [products] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Cart Helpers
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.platform.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Checkout Handlers
  const handleCustomerDetailChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const nextCheckoutStep = () => {
    if (checkoutStep === 1) {
      if (!customerDetails.fullName || !customerDetails.phone) {
        alert('Please fill in your name and phone number');
        return;
      }
    }
    setCheckoutStep(prev => prev + 1);
  };

  const prevCheckoutStep = () => {
    setCheckoutStep(prev => prev - 1);
  };

  const confirmOrder = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setOrderConfirmed(true);
    setTimeout(() => {
      setShowCheckoutModal(false);
      setOrderConfirmed(false);
      setCart([]);
      setCheckoutStep(1);
      setCustomerDetails({ fullName: '', email: '', phone: '', address: '' });
      alert('Order placed successfully! Check your email and WhatsApp for details.');
    }, 1500);
  };

  // Reset modal state on close
  const closeModal = () => {
    setShowCheckoutModal(false);
    setCheckoutStep(1);
    setOrderConfirmed(false);
  };

  return (
    <GameZoneLayout>
      <div className="game-store-page">

        {/* Hero Section */}
        <div className="store-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge"><FiZap className="zap-icon" /> GAMING GEAR & KEYS</div>
            <h1 className="hero-title">LEVEL UP YOUR<br /><span className="highlight">GAMING GEAR</span></h1>
            <p className="hero-desc">Official game keys, premium accessories, exclusive merch and top-ups at unbeatable prices.</p>
            <div className="hero-highlights">
              <div className="highlight-item"><FiCheckCircle /> Instant Delivery</div>
              <div className="highlight-item"><FiShield /> 100% Genuine</div>
              <div className="highlight-item"><FiTruck /> Free Shipping over ₹999</div>
            </div>
            <button className="hero-cta" onClick={() => document.getElementById('store-products').scrollIntoView({ behavior: 'smooth' })}>
              SHOP NOW <FiArrowRight className="btn-icon" />
            </button>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="store-promo container">
          <div className="promo-banner">
            <div className="promo-text">
              <span className="promo-code">USE CODE: ERONIX10</span>
              <h3>Get 10% off on your first purchase</h3>
              <p>Limited time offer. Minimum order ₹499.</p>
            </div>
            <div className="promo-icon-large">
              <FiZap />
            </div>
          </div>
        </div>

        {/* Main Store Section */}
        <div id="store-products" className="store-main container">
          {/* Sidebar Filters */}
          <div className="store-sidebar">
            <div className="filter-section">
              <h3><FiFilter /> Categories</h3>
              <div className="category-list">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-section">
              <h3><FiSearch /> Search</h3>
              <div className="search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search games, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="info-card">
              <h4>Why Shop With Us?</h4>
              <ul>
                <li><FiCheckCircle /> Instant digital delivery</li>
                <li><FiShield /> Official & secure keys</li>
                <li><FiTruck /> Fast shipping on merch</li>
                <li><FiHeadphones /> 24/7 support</li>
                <li><FiDollarSign /> Best price guarantee</li>
              </ul>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-section">
            <div className="products-header">
              <h2>All Products</h2>
              <span className="product-count">{filteredProducts.length} items</span>
            </div>
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  {product.badge && <div className="product-badge">{product.badge}</div>}
                  <div className="product-image">
                    <img src={product.image} alt={product.name} onError={handleImageError} />
                    {!product.inStock && <div className="out-of-stock">Out of Stock</div>}
                  </div>
                  <div className="product-info">
                    <div className="product-platform">{product.platform}</div>
                    <h3 className="product-name">{product.name}</h3>
                    {/* <div className="product-rating">
                      <FiStar className="star" /> {product.rating}
                    </div> */}
                    <p className="product-desc">{product.description}</p>
                    <div className="product-price">
                      <span className="current">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice > product.price && (
                        <span className="original">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                    >
                      <FiShoppingCart /> {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="no-products">
                <FiSearch size={48} />
                <p>No products found. Try a different search or category.</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3><FiShoppingCart /> Your Cart ({getCartCount()})</h3>
              {cart.length > 0 && (
                <button className="clear-cart" onClick={clearCart}>
                  <FiTrash2 /> Clear
                </button>
              )}
            </div>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <FiShoppingCart size={48} />
                <p>Your cart is empty</p>
                <span>Add some games or gear to get started!</span>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} onError={handleImageError} />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <div className="cart-item-price">₹{item.price.toLocaleString()}</div>
                        <div className="cart-item-actions">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <FiMinus />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <FiPlus />
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{getCartTotal() > 999 ? 'FREE' : '₹50'}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{(getCartTotal() + (getCartTotal() > 999 ? 0 : 50)).toLocaleString()}</span>
                  </div>
                  <button
                    className="checkout-btn"
                    onClick={() => setShowCheckoutModal(true)}
                  >
                    Proceed to Checkout <FiArrowRight />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Featured Brands / Trust Section */}
        <div className="trust-section container">
          <div className="trust-header">
            <h3>Trusted by 50,000+ Gamers</h3>
            <p>We partner with official distributors and publishers</p>
          </div>
          <div className="brand-logos">
            <FaSteam className="brand-icon" />
            <FaPlaystation className="brand-icon" />
            <FaXbox className="brand-icon" />
            <FaDiscord className="brand-icon" />
            <FaTwitch className="brand-icon" />
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckoutModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}><FiX /></button>
              <h2>Checkout</h2>
              
              {/* Step Indicators */}
              <div className="modal-step-indicators">
                <div className={`modal-step ${checkoutStep >= 1 ? 'active' : ''}`}>Details</div>
                <div className={`modal-step ${checkoutStep >= 2 ? 'active' : ''}`}>Payment</div>
                <div className={`modal-step ${checkoutStep >= 3 ? 'active' : ''}`}>Confirm</div>
              </div>

              {!orderConfirmed ? (
                <>
                  {/* Step 1: Customer Details */}
                  {checkoutStep === 1 && (
                    <div className="modal-fade-in">
                      <div className="form-group">
                        <label><FiUser /> Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={customerDetails.fullName}
                          onChange={handleCustomerDetailChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label><FiMail /> Email</label>
                          <input
                            type="email"
                            name="email"
                            value={customerDetails.email}
                            onChange={handleCustomerDetailChange}
                            placeholder="your@email.com"
                          />
                        </div>
                        <div className="form-group">
                          <label><FiSmartphone /> Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={customerDetails.phone}
                            onChange={handleCustomerDetailChange}
                            placeholder="10-digit mobile number"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label><FiMapPin /> Delivery Address (for physical items)</label>
                        <input
                          type="text"
                          name="address"
                          value={customerDetails.address}
                          onChange={handleCustomerDetailChange}
                          placeholder="Street, City, Pincode"
                        />
                      </div>
                      <div className="modal-actions">
                        <button className="btn-secondary-modal" onClick={closeModal}>Cancel</button>
                        <button className="btn-primary-modal" onClick={nextCheckoutStep}>Continue to Payment</button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
                  {checkoutStep === 2 && (
                    <div className="modal-fade-in">
                      <div className="payment-methods-grid">
                        <div className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('upi')}>
                          <FiSmartphone className="pay-icon" /> UPI (Google Pay, PhonePe)
                        </div>
                        <div className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}>
                          <FiCreditCard className="pay-icon" /> Credit/Debit Card
                        </div>
                        <div className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                          <FiDollarSign className="pay-icon" /> Cash on Delivery (Merch only)
                        </div>
                        <div className={`payment-option ${paymentMethod === 'wallet' ? 'selected' : ''}`} onClick={() => setPaymentMethod('wallet')}>
                          <FiDollarSign className="pay-icon" /> Eronix Wallet
                        </div>
                      </div>

                      <div className="modal-summary">
                        <h4>Order Summary</h4>
                        <div className="summary-row"><span>Items ({getCartCount()})</span><span>₹{getCartTotal().toLocaleString()}</span></div>
                        <div className="summary-row"><span>Shipping</span><span>{getCartTotal() > 999 ? 'FREE' : '₹50'}</span></div>
                        <div className="summary-row total"><span>Total Payable</span><span>₹{(getCartTotal() + (getCartTotal() > 999 ? 0 : 50)).toLocaleString()}</span></div>
                      </div>

                      <div className="modal-actions">
                        <button className="btn-secondary-modal" onClick={prevCheckoutStep}>Back</button>
                        <button className="btn-primary-modal" onClick={nextCheckoutStep}>Proceed to Pay</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirm Order */}
                  {checkoutStep === 3 && (
                    <div className="modal-fade-in">
                      <div className="confirm-details">
                        <h3>Confirm Your Order</h3>
                        <div className="confirm-section">
                          <p><strong>Name:</strong> {customerDetails.fullName}</p>
                          <p><strong>Phone:</strong> {customerDetails.phone}</p>
                          <p><strong>Email:</strong> {customerDetails.email || 'Not provided'}</p>
                          {customerDetails.address && <p><strong>Address:</strong> {customerDetails.address}</p>}
                          <p><strong>Payment:</strong> {paymentMethod.toUpperCase()}</p>
                        </div>
                        <div className="modal-summary">
                          <div className="summary-row total"><span>Total Amount</span><span>₹{(getCartTotal() + (getCartTotal() > 999 ? 0 : 50)).toLocaleString()}</span></div>
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button className="btn-secondary-modal" onClick={prevCheckoutStep}>Back</button>
                        <button className="btn-submit" onClick={confirmOrder}>
                          <FiLock /> Confirm & Pay
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="success-state">
                  <div className="success-icon-wrapper">
                    <FiCheckCircle className="success-icon-large" />
                  </div>
                  <h3>Order Confirmed!</h3>
                  <p>Thank you for shopping with Eronix Gaming. Your order details have been sent to your email/WhatsApp.</p>
                  <div className="success-note">
                    <FiTruck /> Digital items delivered instantly. Physical items shipped within 24 hours.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GameZoneLayout>
  );
};

export default GameStore;
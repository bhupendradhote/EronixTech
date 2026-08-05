import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import AuthModal from '../../User/Auth/AuthModal';
import cartService from '../../../services/cartService';
import couponService from '../../../services/couponService';
import orderService from '../../../services/orderService';
import './Cart.css';

// ========== Toast ==========
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

// ========== Coupon Modal ==========
const CouponModal = ({ isOpen, onClose, coupons, onApplyCoupon, appliedCoupon, isApplying }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Available Coupons & Offers</h2>
        <div className="coupon-list">
          {coupons.length === 0 ? (
            <p>No active coupons at the moment.</p>
          ) : (
            coupons.map((coupon) => (
              <div key={coupon.id} className="coupon-item">
                <div className="coupon-details">
                  <span className="coupon-code">{coupon.code}</span>
                  <span className="coupon-desc">
                    {coupon.description ||
                      `${coupon.discount_type === 'percentage' ? coupon.discount_amount + '%' : '₹' + coupon.discount_amount} off`}
                  </span>
                  {coupon.min_purchase_amount > 0 && (
                    <span className="coupon-min">Min. ₹{coupon.min_purchase_amount}</span>
                  )}
                </div>
                <button
                  className={`btn-apply-coupon ${appliedCoupon?.coupon === coupon.code ? 'applied' : ''}`}
                  onClick={() => onApplyCoupon(coupon.code)}
                  disabled={isApplying || appliedCoupon?.coupon === coupon.code}
                >
                  {appliedCoupon?.coupon === coupon.code ? 'APPLIED' : 'APPLY'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ========== Price Details Modal ==========
const PriceDetailsModal = ({ isOpen, onClose, pricing }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Payment Summary</h2>
        <div className="price-details-list">
          <div className="summary-row">
            <span>Subtotal (Products)</span>
            <span>₹{pricing.subtotal.toFixed(2)}</span>
          </div>
          {pricing.warrantyTotal > 0 && (
            <div className="summary-row" style={{ color: '#2563eb' }}>
              <span>Warranty</span>
              <span>+ ₹{pricing.warrantyTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row" style={{ fontWeight: 'bold' }}>
            <span>Total Amount</span>
            <span>₹{pricing.totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Estimated GST (18%)</span>
            <span>₹{pricing.gst.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{pricing.shipping === 0 ? 'FREE' : `₹${pricing.shipping.toFixed(2)}`}</span>
          </div>
          {pricing.coinDiscount > 0 && (
            <div className="summary-row" style={{ color: 'var(--green)' }}>
              <span>EronixTechCoins Applied</span>
              <span>- ₹{pricing.coinDiscount.toFixed(2)}</span>
            </div>
          )}
          {pricing.couponDiscount > 0 && (
            <div className="summary-row" style={{ color: '#10b981' }}>
              <span>Coupon Discount</span>
              <span>- ₹{pricing.couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>Amount Payable</span>
            <span>₹{pricing.amountPayable.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== Main Cart Component ==========
const Cart = () => {
  const navigate = useNavigate();

  // Auth
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');

  // Cart data
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // UI states
  const [useCoins, setUseCoins] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Delivery
  const [pincode, setPincode] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  // Modals
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ----- Fetch cart -----
  const fetchCartData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to view your cart.', 'error');
      setIsAuthModalOpen(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCartItems(data?.items || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError(err.response?.data?.message || 'Failed to load your cart.');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setIsAuthModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthModalOpen) {
      fetchCartData();
    }
  }, [isAuthModalOpen]);

  // Clear delivery details when cart changes
  useEffect(() => {
    setDeliveryDetails(null);
    setPincode('');
    setDeliveryError('');
  }, [cartItems]);

  // ----- Fetch coupons -----
  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const data = await couponService.getAllCoupons('active');
      setCoupons(data || []);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      showToast('Could not load coupons', 'error');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleOpenCouponModal = () => {
    if (coupons.length === 0) fetchCoupons();
    setShowCouponModal(true);
  };

  // ====== SHIPROCKET DELIVERY CHECK ======
  const checkDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryError('Please enter a valid 6-digit pincode');
      return;
    }

    // Compute total weight and max dimensions from cart items
    let totalWeight = 0;
    let maxLength = 10;
    let maxBreadth = 10;
    let maxHeight = 10;

    cartItems.forEach((item) => {
      const qty = Number(item.quantity) || 1;
      const weight = Number(item.weight) || 0.5;
      const length = Number(item.length) || 10;
      const breadth = Number(item.breadth) || 10;
      const height = Number(item.height) || 10;

      totalWeight += weight * qty;
      maxLength = Math.max(maxLength, length);
      maxBreadth = Math.max(maxBreadth, breadth);
      maxHeight = Math.max(maxHeight, height);
    });

    setIsCheckingDelivery(true);
    setDeliveryError('');
    try {
      const response = await orderService.checkDelivery({
        pincode,
        weight: totalWeight,
        length: maxLength,
        breadth: maxBreadth,
        height: maxHeight,
      });

      if (response.success && response.serviceable) {
        setDeliveryDetails({
          serviceable: true,
          estimated_days: response.estimated_days,
          courier: response.courier,
          shipping_charge: response.shipping_charge || 0,
          message: response.message || 'Serviceable',
        });
      } else {
        setDeliveryDetails({
          serviceable: false,
          message: response.message || 'We do not deliver to this pincode yet.',
        });
      }
    } catch (err) {
      console.error('Delivery check error:', err);
      setDeliveryError(err.response?.data?.message || 'Failed to check delivery. Please try again.');
    } finally {
      setIsCheckingDelivery(false);
    }
  };

  // ----- Cart actions -----
  const handleRemove = async (cartItemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    setUpdatingItemId(cartItemId);
    try {
      await cartService.removeItem(cartItemId);
      setCartItems((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
      showToast('Item removed from cart');
    } catch (err) {
      showToast('Failed to remove item', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(cartItemId);
    try {
      await cartService.updateQuantity(cartItemId, newQuantity);
      // Re-fetch to get updated total_price (which includes warranty)
      await fetchCartData();
      showToast('Quantity updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update quantity', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ----- Coupon handlers -----
  const handleApplyCoupon = async (code) => {
    if (!code) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const response = await couponService.applyCoupon({
        code: code,
        cart_total: totalAmount,
      });
      setAppliedCoupon(response.data);
      setCouponCode(code);
      setCouponError('');
      showToast(`Coupon ${code} applied successfully!`);
      setShowCouponModal(false);
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid or expired coupon code.');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    showToast('Coupon removed');
  };

  const handleModalClose = () => {
    setIsAuthModalOpen(false);
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  };

  // ----- Calculations -----
  // Subtotal (product only, no warranty)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.unit_price) * Number(item.quantity)),
    0
  );

  // Total warranty cost
  const warrantyTotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.warranty_price) || 0) * Number(item.quantity),
    0
  );

  // Total amount (subtotal + warranty)
  const totalAmount = subtotal + warrantyTotal;

  const totalQuantity = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const gst = totalAmount * 0.18;

  // Shipping: based on subtotal (product amount, not including warranty)
  let shipping = 0;
  if (deliveryDetails && deliveryDetails.serviceable) {
    shipping = deliveryDetails.shipping_charge || 0;
  } else {
    shipping = subtotal > 500 ? 0 : 50;
  }

  const coinDiscount = 18.0;
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;

  let amountPayable = totalAmount + gst + shipping;
  let appliedCoinDiscount = 0;
  if (useCoins && amountPayable > coinDiscount) {
    amountPayable -= coinDiscount;
    appliedCoinDiscount = coinDiscount;
  }
  if (amountPayable > couponDiscountAmount) {
    amountPayable -= couponDiscountAmount;
  } else {
    amountPayable = 0;
  }

  const pricing = {
    subtotal,
    warrantyTotal,
    totalAmount,
    gst,
    shipping,
    coinDiscount: appliedCoinDiscount,
    couponDiscount: couponDiscountAmount,
    amountPayable,
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        cartItems,
        appliedCoupon,
        pricing,
        deliveryDetails,
      },
    });
  };

  // ====== Render ======
  return (
    <Layout>
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleModalClose}
          authType={authType}
          setAuthType={setAuthType}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Coupon Modal */}
      <CouponModal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        coupons={coupons}
        onApplyCoupon={handleApplyCoupon}
        appliedCoupon={appliedCoupon}
        isApplying={isApplyingCoupon}
      />

      {/* Price Details Modal */}
      <PriceDetailsModal isOpen={showPriceModal} onClose={() => setShowPriceModal(false)} pricing={pricing} />

      <div className="cart-page-wrapper">
        {/* LEFT COLUMN */}
        <div className="cart-left-col">
          <div className="mogli-coins-banner">
            <input
              type="checkbox"
              checked={useCoins}
              onChange={(e) => setUseCoins(e.target.checked)}
              disabled={cartItems.length === 0}
            />
            <div className="mogli-coins-text">
              Use <strong>₹ 18 EronixTechCoins</strong> <br />
              & save extra money on this order
            </div>
          </div>

          <div className="cart-items-container">
            <div className="cart-items-header">
              <h2>My Cart</h2>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading your cart...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px' }}>
                <p>{error}</p>
                <button onClick={fetchCartData} className="btn-checkout" style={{ width: 'auto', marginTop: '10px' }}>
                  Retry
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <svg
                  style={{ width: '64px', height: '64px', color: '#d1d5db', marginBottom: '16px' }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3>Your Cart is Empty</h3>
                <p style={{ color: '#6b7280', marginTop: '8px', marginBottom: '24px' }}>
                  Looks like you haven't added anything yet.
                </p>
                <Link
                  to="/"
                  className="btn-checkout"
                  style={{ display: 'inline-block', width: 'auto', padding: '10px 24px', textDecoration: 'none' }}
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-table-head">
                  <span>{totalQuantity} item(s) in your cart</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>

                {cartItems.map((item) => {
                  const mainImage =
                    item.images && item.images.length > 0
                      ? item.images[0].image_path
                      : 'https://via.placeholder.com/150';
                  const isUpdating = updatingItemId === item.cart_item_id;
                  const hasWarranty = item.is_warranty === 1 && item.warranty_price > 0;

                  return (
                    <div key={item.cart_item_id} className="cart-item-row" style={{ opacity: isUpdating ? 0.6 : 1 }}>
                      <div className="cart-item-details">
                        <Link
                          to={`/product/${item.slug || item.product_id}`}
                          style={{ display: 'block', flexShrink: 0 }}
                        >
                          <img src={mainImage} alt={item.name} className="cart-item-img" />
                        </Link>
                        <div className="cart-item-info">
                          <h3>{item.name}</h3>
                          {hasWarranty && (
                            <div style={{ fontSize: '13px', color: '#2563eb', marginTop: '4px' }}>
                              🛡️ {item.warranty_name} (+₹{Number(item.warranty_price).toLocaleString()})
                            </div>
                          )}
                          <div className="cart-item-price-meta">
                            <span>₹{Number(item.unit_price).toLocaleString()} × {item.quantity}</span>
                            {hasWarranty && (
                              <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                                + Warranty ₹{Number(item.warranty_price).toLocaleString()}
                              </span>
                            )}
                            <strong style={{ marginLeft: '8px' }}>
                              ₹{Number(item.total_price).toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="cart-item-qty">
                        <button
                          className="btn-trash"
                          aria-label="Delete"
                          onClick={() => handleRemove(item.cart_item_id)}
                          disabled={isUpdating}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        <button
                          className="btn-qty"
                          onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          −
                        </button>
                        <input type="text" className="qty-input" value={item.quantity} readOnly />
                        <button
                          className="btn-qty"
                          onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                          disabled={isUpdating || item.quantity >= item.stock_quantity}
                          title={item.quantity >= item.stock_quantity ? 'Max stock reached' : ''}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-price-col">
                        <span className="current-price">
                          ₹{Number(item.total_price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <button
                          className="price-details-link"
                          onClick={() => setShowPriceModal(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#2563eb',
                            textDecoration: 'underline',
                          }}
                        >
                          Price Details
                        </button>
                        <div className="free-shipping">
                          {shipping === 0 ? 'Free Shipping' : 'Standard Shipping'}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {cartItems.length > 0 && (
              <div className="cart-checkout-strip">
                <button className="btn-checkout" onClick={handleProceedToCheckout}>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', textAlign: 'left', fontWeight: 500 }}>
                      PROCEED TO CHECKOUT
                    </span>
                    <span>
                      ₹
                      {amountPayable.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="cart-right-col">
          {/* Payment Summary */}
          <div className="summary-box">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Subtotal (Products)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {warrantyTotal > 0 && (
              <div className="summary-row" style={{ color: '#2563eb' }}>
                <span>Warranty</span>
                <span>+ ₹{warrantyTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row" style={{ fontWeight: 'bold' }}>
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated GST (18%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>
                Total Shipping
                <small>{deliveryDetails ? `via ${deliveryDetails.courier}` : 'Free shipping on orders over ₹500'}</small>
              </span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
            </div>
            {useCoins && cartItems.length > 0 && (
              <div className="summary-row" style={{ color: 'var(--green)' }}>
                <span>EronixTechCoins Applied</span>
                <span>- ₹{coinDiscount.toFixed(2)}</span>
              </div>
            )}
            {couponDiscountAmount > 0 && (
              <div className="summary-row" style={{ color: '#10b981', fontWeight: '500' }}>
                <span>Coupon ({appliedCoupon.coupon})</span>
                <span>- ₹{couponDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-divider"></div>
            <div className="summary-total">
              <span>Amount Payable</span>
              <span>₹{amountPayable.toFixed(2)}</span>
            </div>
            <button
              className="btn-checkout"
              style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center' }}
              onClick={handleProceedToCheckout}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>

          {/* Delivery Check */}
          <div className="summary-box">
            <h3>Delivery Details</h3>
            <div className="delivery-input-wrap">
              <input
                type="text"
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setDeliveryError('');
                  setDeliveryDetails(null);
                }}
                maxLength="6"
              />
              <button
                className="btn-checkout"
                style={{ padding: '0 16px' }}
                onClick={checkDelivery}
                disabled={isCheckingDelivery || pincode.length !== 6}
              >
                {isCheckingDelivery ? '...' : 'Check'}
              </button>
            </div>
            {deliveryError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{deliveryError}</div>
            )}
            {deliveryDetails && (
              <div className="delivery-result" style={{ marginTop: '8px', fontSize: '14px' }}>
                {deliveryDetails.serviceable ? (
                  <>
                    <p style={{ color: '#10b981' }}>✓ {deliveryDetails.message}</p>
                    <p>Estimated Delivery: {deliveryDetails.estimated_days} days</p>
                    <p>Courier: {deliveryDetails.courier}</p>
                    {deliveryDetails.shipping_charge > 0 && (
                      <p>Shipping Charge: ₹{deliveryDetails.shipping_charge}</p>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#ef4444' }}>✗ {deliveryDetails.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Coupons */}
          <div className="summary-box">
            <h3>Coupons & Offers</h3>
            <div className="coupon-input-wrap">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                disabled={appliedCoupon || isApplyingCoupon}
              />
              {appliedCoupon ? (
                <button
                  className="btn-checkout"
                  style={{ padding: '0 16px', background: '#ef4444', border: 'none' }}
                  onClick={handleRemoveCoupon}
                >
                  REMOVE
                </button>
              ) : (
                <button
                  className={couponCode ? 'btn-checkout' : 'btn-apply-grey'}
                  style={{ padding: '0 16px' }}
                  disabled={!couponCode || cartItems.length === 0 || isApplyingCoupon}
                  onClick={() => handleApplyCoupon(couponCode)}
                >
                  {isApplyingCoupon ? '...' : 'APPLY'}
                </button>
              )}
            </div>
            {couponError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{couponError}</div>
            )}
            {appliedCoupon && (
              <div style={{ color: '#10b981', fontSize: '13px', marginTop: '4px', fontWeight: 'bold' }}>
                ✓ Coupon Applied
              </div>
            )}

            <button
              className="view-all-coupons"
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginTop: '12px',
              }}
              onClick={handleOpenCouponModal}
            >
              VIEW ALL COUPONS & OFFERS
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
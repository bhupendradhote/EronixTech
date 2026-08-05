import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import paymentService from '../../../services/paymentService';
import addressService from '../../../services/addressService';
import userService from '../../../services/userService';
import couponService from '../../../services/couponService';
import orderService from '../../../services/orderService';
import cartService from '../../../services/cartService';
import './Checkout.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const isWarrantyItem = (item) => {
  return Number(item.is_warranty) === 1 || item.is_warranty === true;
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, pricing, appliedCoupon: initialCoupon, deliveryDetails } = location.state || {};

  // Redirect if missing data
  useEffect(() => {
    if (!cartItems || !pricing) {
      navigate('/cart');
    }
  }, [cartItems, pricing, navigate]);

  // ----- State -----
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingAddr, setShippingAddr] = useState({
    fullName: '', address: '', city: '', state: '', pincode: '', phone: '', email: ''
  });
  const [billingAddr, setBillingAddr] = useState({
    fullName: '', address: '', city: '', state: '', pincode: '', phone: '', email: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(initialCoupon || null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // COD availability
  const isCodAllowed = cartItems ? cartItems.every(item => {
    const cod = Number(item.is_cod_available);
    return cod === 1 || item.is_cod_available === true;
  }) : false;

  useEffect(() => {
    if (!isCodAllowed && paymentMethod === 'cod') {
      setPaymentMethod('razorpay');
    }
  }, [isCodAllowed, paymentMethod]);

  // ----- Fetch user & addresses -----
  useEffect(() => {
    loadRazorpayScript().then(loaded => setRazorpayReady(loaded));
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoadingData(true);
      const profileResponse = await userService.getProfile();
      const user = profileResponse.user || profileResponse;

      if (user) {
        setUserId(user.id);
        setShippingAddr(prev => ({
          ...prev,
          fullName: user.full_name || '',
          email: user.email || '',
          phone: user.phone_number || ''
        }));
        setBillingAddr(prev => ({
          ...prev,
          fullName: user.full_name || '',
          email: user.email || '',
          phone: user.phone_number || ''
        }));

        const addresses = await addressService.getUserAddresses();
        setSavedAddresses(addresses || []);

        if (addresses && addresses.length > 0) {
          const defaultAddress = addresses.find(a => a.is_default_shipping) || addresses[0];
          handleSelectSavedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial checkout data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSelectSavedAddress = (address) => {
    setSelectedAddressId(address.id.toString());
    setShippingAddr(prev => ({
      ...prev,
      address: address.address_line_2 ? `${address.address_line_1}, ${address.address_line_2}` : address.address_line_1,
      city: address.city,
      state: address.state,
      pincode: address.postal_code,
    }));
  };

  const handleAddressDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setSelectedAddressId('new');
      setShippingAddr(prev => ({ ...prev, address: '', city: '', state: '', pincode: '' }));
    } else {
      const selected = savedAddresses.find(a => a.id.toString() === val);
      if (selected) handleSelectSavedAddress(selected);
    }
  };

  const handleShippingChange = (e) => {
    setShippingAddr({ ...shippingAddr, [e.target.name]: e.target.value });
    if (['address', 'city', 'state', 'pincode'].includes(e.target.name)) setSelectedAddressId('new');
  };

  const handleBillingChange = (e) => setBillingAddr({ ...billingAddr, [e.target.name]: e.target.value });

  const validateAddress = (addr) => addr.fullName && addr.address && addr.city && addr.state && addr.pincode && addr.phone && addr.email;

  // ----- Coupon -----
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const response = await couponService.applyCoupon({
        code: couponCode,
        cart_total: pricing.totalAmount
      });
      setAppliedCoupon(response.data);
      setCouponError('');
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
  };

  // ----- Build order payload – ALWAYS send product AND warranty items separately -----
  const buildOrderPayload = (method) => {
    const itemsData = [];

    cartItems.forEach((item) => {
      const qty = Number(item.quantity || 1);
      const productId = item.product_id || item.id || 0;

      const isStandaloneWarranty = (Number(item.is_warranty) === 1 || item.is_warranty === true) && !item.warranty_price;

      if (!isStandaloneWarranty) {
        // 1. Regular Product Item
        const productName = item.product_name || item.name || 'Product';
        const productSku = item.product_sku || item.sku || 'NA';
        const unitPrice = Number(item.unit_price) || Number(item.price) || Number(item.selling_price) || 0;

        itemsData.push({
          product_id: productId,
          product_name: productName,
          product_sku: productSku,
          quantity: qty,
          unit_price: unitPrice,
          product_image: item.images?.[0]?.image_path || item.product_image || null,
          is_warranty: 0,
          warranty_name: null,
        });

        // 2. Attached Extended Warranty (if present)
        const warrantyPrice = Number(item.warranty_price || 0);
        if (warrantyPrice > 0) {
          itemsData.push({
            product_id: productId,
            product_name: item.warranty_name || 'Extended Warranty',
            product_sku: `WARR-${productId}`,
            quantity: qty,
            unit_price: warrantyPrice,
            product_image: null,
            is_warranty: 1,
            warranty_name: item.warranty_name || null,
          });
        }
      } else {
        // 3. Standalone Warranty Item
        const warrantyPrice = Number(item.unit_price || item.warranty_price || 0);
        if (warrantyPrice > 0) {
          itemsData.push({
            product_id: productId,
            product_name: item.warranty_name || item.product_name || 'Extended Warranty',
            product_sku: item.product_sku || `WARR-${productId}`,
            quantity: qty,
            unit_price: warrantyPrice,
            product_image: item.images?.[0]?.image_path || null,
            is_warranty: 1,
            warranty_name: item.warranty_name || null,
          });
        }
      }
    });

    if (itemsData.length === 0) {
      throw new Error('No valid items to order.');
    }

    // 🔥 FIX: Calculate base payable strictly from raw components, avoiding double coupon deduction
    const basePayable = Number(pricing.totalAmount || 0) + Number(pricing.gst || 0) + Number(pricing.shipping || 0);
    const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
    const finalPayable = Math.max(0, basePayable - discountAmount);

    return {
      orderData: {
        user_id: userId,
        address_id: selectedAddressId === 'new' ? null : selectedAddressId,
        order_number: `ORD-${Date.now()}`,
        customer_name: shippingAddr.fullName,
        customer_phone: shippingAddr.phone,
        customer_email: shippingAddr.email,
        subtotal: pricing.totalAmount,
        tax_amount: pricing.gst,
        shipping_fee: pricing.shipping,
        platform_fee: 0,
        coupon_discount: discountAmount,
        total_amount: finalPayable,
        payment_method: method,
        total_weight_kg: 1.0,
        length_cm: 10,
        width_cm: 10,
        height_cm: 10,
        shipping_address_line1: shippingAddr.address,
        shipping_city: shippingAddr.city,
        shipping_state: shippingAddr.state,
        shipping_pincode: shippingAddr.pincode,
        shipping_country: 'India',
      },
      itemsData,
    };
  };

  // ----- Payment handlers -----
  const handleRazorpayPayment = async () => {
    if (!validateAddress(shippingAddr)) {
      alert('Please fill all required shipping address fields');
      return;
    }
    setIsProcessing(true);
    try {
      const orderPayload = buildOrderPayload('prepaid');
      const internalOrderResponse = await orderService.createPendingOrder(orderPayload);
      const internal_order_id = internalOrderResponse.orderId;

      // 🔥 FIX: Reconstruct exactly as above to avoid double deduction
      const basePayable = Number(pricing.totalAmount || 0) + Number(pricing.gst || 0) + Number(pricing.shipping || 0);
      const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
      const finalPayable = Math.max(0, basePayable - discountAmount);

      const rzpOrder = await paymentService.createRazorpayOrder(finalPayable);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'EronixTech',
        description: `Order ${orderPayload.orderData.order_number}`,
        order_id: rzpOrder.id,
        handler: async function (response) {
          try {
            await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internal_order_id: internal_order_id
            });
            await cartService.clearCart();
            navigate('/order-success', { state: { orderId: internal_order_id } });
          } catch (verifyError) {
            console.error("Verification failed:", verifyError);
            window.alert('Payment was successful, but order syncing failed. Our team will contact you.');
            await cartService.clearCart();
            navigate('/order-success', { state: { orderId: internal_order_id } });
          }
        },
        prefill: {
          name: shippingAddr.fullName,
          email: shippingAddr.email,
          contact: shippingAddr.phone
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            alert("Payment cancelled. You can try again from your orders page.");
          }
        }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      alert('Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCOD = async () => {
    if (!validateAddress(shippingAddr)) {
      alert('Please fill all required shipping address fields');
      return;
    }
    setIsProcessing(true);
    try {
      const orderPayload = buildOrderPayload('cod');
      const response = await orderService.createCodOrder(orderPayload);
      window.alert('🎉 Order placed successfully via Cash on Delivery!');
      await cartService.clearCart();
      navigate('/order-success', { state: { orderId: response.orderId || 'COD_SUCCESS' } });
    } catch (error) {
      console.error('COD placement error:', error);
      alert('Failed to place COD order. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'razorpay') {
      if (!razorpayReady) { alert('Payment Gateway is loading, please wait...'); return; }
      handleRazorpayPayment();
    } else {
      handleCOD();
    }
  };

  if (!cartItems || !pricing) return null;

  // ----- Compute breakdown for display (using raw pricing values directly to prevent double deduction) -----
  let productSubtotalDisplay = 0;
  let warrantyTotalDisplay = 0;
  cartItems.forEach(item => {
    const qty = Number(item.quantity || 1);
    if (isWarrantyItem(item)) {
      warrantyTotalDisplay += Number(item.unit_price || 0) * qty;
    } else {
      productSubtotalDisplay += Number(item.unit_price || 0) * qty;
      if (item.warranty_price) {
        warrantyTotalDisplay += Number(item.warranty_price) * qty;
      }
    }
  });

  const totalAmount = Number(pricing.totalAmount || 0);
  const gst = Number(pricing.gst || 0);
  const shipping = Number(pricing.shipping || 0);
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
  
  // 🔥 FIX: Base payable is Subtotal + GST + Shipping. Then subtract the discount ONCE.
  const basePayable = totalAmount + gst + shipping;
  const finalPayable = Math.max(0, basePayable - discountAmount);

  return (
    <Layout>
      <div className="co-page-wrapper">
        <div className="co-steps">
          <div className="co-step active"><span>1</span> Cart</div>
          <div className="co-step-line"></div>
          <div className="co-step active"><span>2</span> Checkout</div>
          <div className="co-step-line"></div>
          <div className="co-step"><span>3</span> Confirmation</div>
        </div>

        <div className="co-grid">
          <div className="co-form-col">
            <form onSubmit={handleSubmit}>
              <div className="co-card">
                <h3>📦 Shipping Address</h3>
                {!isLoadingData && savedAddresses.length > 0 && (
                  <select value={selectedAddressId} onChange={handleAddressDropdownChange} style={{ width: '100%', marginBottom: '20px', padding: '10px' }}>
                    <option value="new">+ Enter a New Address</option>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id.toString()}>
                        {addr.address_line_1}, {addr.city}
                      </option>
                    ))}
                  </select>
                )}
                <div className="co-form-grid">
                  <div className="co-field full"><label>Full Name *</label><input type="text" name="fullName" value={shippingAddr.fullName} onChange={handleShippingChange} required /></div>
                  <div className="co-field full"><label>Address *</label><input type="text" name="address" value={shippingAddr.address} onChange={handleShippingChange} required /></div>
                  <div className="co-field"><label>City *</label><input type="text" name="city" value={shippingAddr.city} onChange={handleShippingChange} required /></div>
                  <div className="co-field"><label>State *</label><input type="text" name="state" value={shippingAddr.state} onChange={handleShippingChange} required /></div>
                  <div className="co-field"><label>PIN Code *</label><input type="text" name="pincode" value={shippingAddr.pincode} onChange={handleShippingChange} required /></div>
                  <div className="co-field"><label>Phone *</label><input type="tel" name="phone" value={shippingAddr.phone} onChange={handleShippingChange} required /></div>
                  <div className="co-field full"><label>Email *</label><input type="email" name="email" value={shippingAddr.email} onChange={handleShippingChange} required /></div>
                </div>
              </div>

              <div className="co-card">
                <label className="co-checkbox">
                  <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} />
                  <span>Billing address same as shipping</span>
                </label>
              </div>

              {!sameAsShipping && (
                <div className="co-card">
                  <h3>🏢 Billing Address</h3>
                  <div className="co-form-grid">
                    <div className="co-field full"><label>Full Name *</label><input type="text" name="fullName" value={billingAddr.fullName} onChange={handleBillingChange} required /></div>
                    <div className="co-field full"><label>Address *</label><input type="text" name="address" value={billingAddr.address} onChange={handleBillingChange} required /></div>
                    <div className="co-field"><label>City *</label><input type="text" name="city" value={billingAddr.city} onChange={handleBillingChange} required /></div>
                    <div className="co-field"><label>State *</label><input type="text" name="state" value={billingAddr.state} onChange={handleBillingChange} required /></div>
                    <div className="co-field"><label>PIN Code *</label><input type="text" name="pincode" value={billingAddr.pincode} onChange={handleBillingChange} required /></div>
                    <div className="co-field"><label>Phone *</label><input type="tel" name="phone" value={billingAddr.phone} onChange={handleBillingChange} required /></div>
                    <div className="co-field full"><label>Email *</label><input type="email" name="email" value={billingAddr.email} onChange={handleBillingChange} required /></div>
                  </div>
                </div>
              )}

              <div className="co-card">
                <h3>💳 Payment Method</h3>
                <div className="co-payment-options">
                  <label className="co-radio">
                    <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                    <span><strong>Pay Online (Razorpay)</strong></span>
                  </label>
                  <label className="co-radio" style={{ marginTop: '10px', opacity: isCodAllowed ? 1 : 0.6 }}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      disabled={!isCodAllowed}
                    />
                    <div>
                      <span><strong>Cash on Delivery</strong></span>
                      {!isCodAllowed && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>Not available for some items in your cart.</div>}
                    </div>
                  </label>
                </div>
              </div>

              <div className="co-actions">
                <Link to="/cart" className="co-btn-secondary">← Back to Cart</Link>
                <button type="submit" className="co-btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Pay ₹${finalPayable.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>

          {/* ----- Order Summary ----- */}
          <div className="co-summary-col">
            <div className="co-summary-card">
              <h3>🛒 Order Summary</h3>

              {cartItems.map(item => {
                const qty = Number(item.quantity || 1);
                if (isWarrantyItem(item)) {
                  const price = Number(item.unit_price || 0);
                  return (
                    <div key={item.cart_item_id} className="co-summary-item">
                      <img src={item.images?.[0]?.image_path || 'https://via.placeholder.com/50'} alt={item.product_name} style={{ opacity: 0.7 }} />
                      <div>
                        <p>
                          {item.warranty_name || item.product_name || 'Warranty'}
                          <span style={{ color: '#2563eb', fontSize: '11px', marginLeft: '5px' }}>(Warranty)</span>
                        </p>
                        <small>Qty: {qty}</small>
                        <strong>₹{Number(price * qty).toLocaleString()}</strong>
                      </div>
                    </div>
                  );
                } else {
                  const productPrice = Number(item.unit_price || 0);
                  const warrantyPrice = Number(item.warranty_price || 0);
                  return (
                    <div key={item.cart_item_id}>
                      <div className="co-summary-item">
                        <img src={item.images?.[0]?.image_path || 'https://via.placeholder.com/50'} alt={item.name} />
                        <div>
                          <p>{item.name || item.product_name}</p>
                          <small>Qty: {qty}</small>
                          <strong>₹{Number(productPrice * qty).toLocaleString()}</strong>
                        </div>
                      </div>
                      {warrantyPrice > 0 && (
                        <div className="co-summary-item" style={{ paddingLeft: '40px', borderLeft: '2px solid #e5e7eb' }}>
                          <div style={{ flex: 1 }}>
                            <p>
                              {item.warranty_name || 'Extended Warranty'}
                              <span style={{ color: '#2563eb', fontSize: '11px', marginLeft: '5px' }}>(Warranty)</span>
                            </p>
                            <small>Qty: {qty}</small>
                            <strong>+ ₹{Number(warrantyPrice * qty).toLocaleString()}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })}

              {/* Coupon Section */}
              <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Apply Promo Code</h4>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#d1fae5', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: '#065f46', fontWeight: 'bold', fontSize: '14px' }}>✓ {appliedCoupon.coupon} applied</span>
                    <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '500' }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                      style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{couponError}</div>}
              </div>

              <div className="co-divider"></div>

              {/* Price Breakdown */}
              <div className="co-row"><span>Subtotal (Products)</span><span>₹{productSubtotalDisplay.toFixed(2)}</span></div>
              {warrantyTotalDisplay > 0 && (
                <div className="co-row" style={{ color: '#2563eb' }}>
                  <span>Warranty</span>
                  <span>+ ₹{warrantyTotalDisplay.toFixed(2)}</span>
                </div>
              )}
              <div className="co-row" style={{ fontWeight: 'bold' }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="co-row"><span>Estimated GST</span><span>₹{gst.toFixed(2)}</span></div>
              <div className="co-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span></div>

              {discountAmount > 0 && (
                <div className="co-row" style={{ color: '#10b981', fontWeight: '500' }}>
                  <span>Discount ({appliedCoupon.coupon})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="co-total">
                <span>Total Payable</span>
                <span>₹{finalPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout; 
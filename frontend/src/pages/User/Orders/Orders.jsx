import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import orderService from '../../../services/orderService';
import userService from '../../../services/userService';
import './Orders.css';

// ========== Cancel Reason Modal ==========
const CancelReasonModal = ({ isOpen, onClose, onConfirm, orderId, isProcessing }) => {
  const [selectedReason, setSelectedReason] = useState('');

  const reasons = [
    'I have self-shipped this order on another platform/courier.',
    'The order is no longer required by the customer.',
    'No courier was found serviceable for this order.',
    'The order has been cancelled on the integrated channel.',
  ];

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedReason) {
      alert('Please select a reason for cancellation.');
      return;
    }
    onConfirm(orderId, selectedReason);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Cancel Order</h2>
        <p style={{ marginBottom: '16px' }}>Select the reason for cancelling this order:</p>
        <div className="cancel-reasons">
          {reasons.map((reason) => (
            <label key={reason} className="cancel-reason-option">
              <input
                type="radio"
                name="cancelReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
              />
              {reason}
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button
            className="btn-cancel-modal"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="btn-confirm-cancel"
            onClick={handleConfirm}
            disabled={!selectedReason || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== Main Orders Component ==========
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cancel Reason Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Fetch orders and user profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await userService.getProfile();
        const user = profileResponse.user || profileResponse;
        setUserName(user?.full_name || 'User');

        const response = await orderService.getUserOrders();
        console.log('Orders API response:', response);

        if (response.success) {
          const parsedOrders = response.orders.map(order => ({
            ...order,
            total_amount: parseFloat(order.total_amount) || 0,
            items: (order.items || []).map(item => ({
              ...item,
              product_image: item.product_image || null
            }))
          }));
          setOrders(parsedOrders);
        } else {
          setError(response.message || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ========== Utility Functions ==========
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      'pending': 'badge-pending',
      'processing': 'badge-processing',
      'shipped': 'badge-shipped',
      'delivered': 'badge-delivered',
      'cancelled': 'badge-cancelled',
      'return_initiated': 'badge-return',
    };
    return map[status?.toLowerCase()] || 'badge-pending';
  };

  const getTrackingUrl = (awb, courier) => {
    if (!awb) return null;
    const courierLower = (courier || '').toLowerCase();
    if (courierLower.includes('delhivery')) {
      return `https://www.delhivery.com/track/${awb}`;
    } else if (courierLower.includes('xpressbees')) {
      return `https://www.xpressbees.com/track/${awb}`;
    } else if (courierLower.includes('bluedart')) {
      return `https://www.bluedart.com/tracking/${awb}`;
    } else if (courierLower.includes('dtdc')) {
      return `https://www.dtdc.in/tracking/${awb}`;
    } else if (courierLower.includes('fedex')) {
      return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${awb}`;
    }
    return null;
  };

  // ========== Modal Handlers ==========
  const handleViewDetails = async (orderId) => {
    setLoadingDetails(true);
    setShowModal(true);
    try {
      const response = await orderService.getOrderDetails(orderId);
      if (response.success) {
        const order = response.order;
        order.total_amount = parseFloat(order.total_amount) || 0;
        order.items = order.items.map(item => ({
          ...item,
          total_price: parseFloat(item.total_price) || 0,
          unit_price: parseFloat(item.unit_price) || 0,
          product_image: item.product_image || null
        }));
        setSelectedOrder(order);
      } else {
        alert('Failed to load order details');
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      alert('Error loading details');
      setShowModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Cancel modal
  const openCancelModal = (orderId) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelOrderId(null);
  };

  const handleConfirmCancel = async (orderId, reason) => {
    setCancelling(true);
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      if (response.success) {
        // Update order status in UI
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o.id === orderId ? { ...o, order_status: 'cancelled' } : o
          )
        );
        alert('Order cancelled successfully');
        closeCancelModal();
      } else {
        alert(response.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert(err.message || 'Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  // ========== Render ==========
  return (
    <Layout>
      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <aside className="sidebar-col">
          <div className="profile-card">
            <div className="profile-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="profile-info">
              <span className="greeting">Hello,</span>
              <span className="name">{userName || 'User'}</span>
            </div>
          </div>

          <div className="coins-card">
            <div className="coins-left">
              <div className="coin-icon">₹</div>
              <div className="coins-info">
                <span className="label">Balance</span>
                <span className="balance">20 EronixTech Coins</span>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>

          <nav className="sidebar-nav">
            <Link to="/address" className="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              My Address
            </Link>
            <Link to="/orders" className="nav-item active">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"></line>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"></line>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"></line>
                <path d="M8 14h.01" stroke="white" strokeWidth="2"></path>
                <path d="M12 14h.01" stroke="white" strokeWidth="2"></path>
                <path d="M16 14h.01" stroke="white" strokeWidth="2"></path>
                <path d="M8 18h.01" stroke="white" strokeWidth="2"></path>
                <path d="M12 18h.01" stroke="white" strokeWidth="2"></path>
                <path d="M16 18h.01" stroke="white" strokeWidth="2"></path>
              </svg>
              My Orders
            </Link>
            <Link to="/rfq" className="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              My RFQ's
            </Link>
            <Link to="/business-details" className="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              My Business Details
            </Link>
            <Link to="/wishlist" className="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              My Wishlist
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <div className="breadcrumb">
            <Link to="/">Home</Link> &gt; <span>My Orders</span>
          </div>

          <h1 className="dashboard-header">My Orders</h1>

          {loading ? (
            <div className="loading-orders">Loading your orders...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : orders.length === 0 ? (
            <div className="empty-order-card">
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/empty-box-8316262-6632283.png"
                alt="Empty Box"
                className="empty-illustration"
              />
              <div className="empty-order-text">
                <h3>No orders yet!</h3>
                <p>Explore our products and place your first order.</p>
                <Link to="/">
                  <button className="btn-start-shopping">Start Shopping</button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => {
                const trackingUrl = order.tracking_url || getTrackingUrl(order.fship_awb || order.awb_code, order.courier_company);
                const awb = order.fship_awb || order.awb_code;

                return (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-number-date">
                        <span className="order-number">Order #{order.order_number}</span>
                        <span className="order-date">{formatDate(order.created_at)}</span>
                      </div>
                      <span className={`order-status ${getStatusBadge(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>

                    <div className="order-items-preview">
                      {order.items && order.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="order-item-preview">
                          <div className="item-image-name">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="item-thumbnail"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="item-thumbnail-placeholder"
                              style={{ display: item.product_image ? 'none' : 'flex' }}
                            >
                              📦
                            </div>
                            <span className="item-name">{item.product_name}</span>
                          </div>
                          <span className="item-qty">× {item.quantity}</span>
                        </div>
                      ))}
                      {order.item_count > 4 && (
                        <span className="more-items">+ {order.item_count - 4} more items</span>
                      )}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        Total: <strong>₹{order.total_amount.toFixed(2)}</strong>
                      </div>
                      <div className="order-payment">
                        {order.payment_method === 'cod' ? 'COD' : 'Prepaid'}
                        {order.payment_status === 'paid' && ' ✓ Paid'}
                      </div>

                      {awb && (
                        <div className="order-tracking">
                          {trackingUrl ? (
                            <a
                              href={trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tracking-link"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ marginRight: '6px' }}
                              >
                                <rect x="1" y="3" width="15" height="13" rx="2" />
                                <polyline points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                <circle cx="5.5" cy="18" r="2.5" />
                                <circle cx="18.5" cy="18" r="2.5" />
                              </svg>
                              Track Shipment
                            </a>
                          ) : (
                            <span className="tracking-awb">Tracking: {awb}</span>
                          )}
                          {order.courier_company && (
                            <span className="courier-name">({order.courier_company})</span>
                          )}
                        </div>
                      )}

                      <button
                        className="order-detail-link"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        View Details
                      </button>

                      {/* Cancel Order Button – opens reason modal */}
                      {['pending', 'processing'].includes(order.order_status) && (
                        <button
                          className="btn-cancel-order"
                          onClick={() => openCancelModal(order.id)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                    {(order.shipping_city || order.shipping_state) && (
                      <div className="order-shipping-summary">
                        Ship to: {order.shipping_city}, {order.shipping_state}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Trending Categories */}
          <div className="trending-section">
            <h3>Trending Categories</h3>
            <div className="trending-grid">
              <Link to="/category/safety" className="trending-card">
                <img src="https://cdn.moglix.com/cms/flyout/yCcy6EUJKPfem-xlarge.png" alt="Safety" />
                <span>Safety</span>
              </Link>
              <Link to="/category/electricals" className="trending-card">
                <img src="https://cdn.moglix.com/cms/flyout/cc3aT5ft2NI6i-xlarge.png" alt="Electricals" />
                <span>Electricals</span>
              </Link>
              <Link to="/category/power-tools" className="trending-card">
                <img src="https://cdn.moglix.com/cms/flyout/vhqePEHKTYjZ7-xlarge.png" alt="Power Tools" />
                <span>Power Tools</span>
              </Link>
              <Link to="/category/pumps-motors" className="trending-card">
                <img src="https://cdn.moglix.com/cms/flyout/wQts5D8PG1xzm-xlarge.png" alt="Pumps & Motors" />
                <span>Pumps & Motors</span>
              </Link>
              <Link to="/category/office" className="trending-card">
                <img src="https://cdn.moglix.com/cms/flyout/SWmIJNjv2p0Io-xlarge.png" alt="Office Stationery" />
                <span>Office Stationery & Supplies</span>
              </Link>
              <Link to="/category/medical" className="trending-card">
                <img src="https://cdn.moglix.com/cms/flyout/Oln43NhrWr026-xlarge.png" alt="Medical Supplies" />
                <span>Medical Supplies</span>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            {loadingDetails ? (
              <div className="modal-loading">Loading details...</div>
            ) : selectedOrder ? (
              <div className="modal-body">
                <h2>Order #{selectedOrder.order_number}</h2>
                <p><strong>Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                <p><strong>Status:</strong> <span className={`order-status ${getStatusBadge(selectedOrder.order_status)}`}>{selectedOrder.order_status}</span></p>
                <p><strong>Payment:</strong> {selectedOrder.payment_method} - {selectedOrder.payment_status}</p>
                <p><strong>Total:</strong> ₹{selectedOrder.total_amount.toFixed(2)}</p>

                <h3>Items</h3>
                <div className="modal-items">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="modal-item">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="modal-item-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="modal-item-placeholder"
                        style={{ display: item.product_image ? 'none' : 'flex' }}
                      >
                        📦
                      </div>
                      <div className="modal-item-details">
                        <div className="modal-item-name">{item.product_name}</div>
                        <div className="modal-item-meta">Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)} = ₹{item.total_price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <h3>Shipping Address</h3>
                <div className="modal-address">
                  {selectedOrder.shipping_address_line1}, {selectedOrder.shipping_address_line2 && selectedOrder.shipping_address_line2 + ', '}
                  {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}
                  <br />
                  {selectedOrder.shipping_country}
                </div>

                {selectedOrder.billing_address_line1 && (
                  <>
                    <h3>Billing Address</h3>
                    <div className="modal-address">
                      {selectedOrder.billing_address_line1}, {selectedOrder.billing_address_line2 && selectedOrder.billing_address_line2 + ', '}
                      {selectedOrder.billing_city}, {selectedOrder.billing_state} - {selectedOrder.billing_pincode}
                      <br />
                      {selectedOrder.billing_country}
                    </div>
                  </>
                )}

                <h3>Tracking Info</h3>
                {(selectedOrder.fship_awb || selectedOrder.awb_code) && (
                  <div className="modal-tracking">
                    <p><strong>AWB:</strong> {selectedOrder.fship_awb || selectedOrder.awb_code}</p>
                    {selectedOrder.courier_company && <p><strong>Courier:</strong> {selectedOrder.courier_company}</p>}
                    {selectedOrder.tracking_url ? (
                      <p>
                        <a
                          href={selectedOrder.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tracking-link"
                        >
                          Track Shipment
                        </a>
                      </p>
                    ) : (
                      <p>No tracking URL provided</p>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      <CancelReasonModal
        isOpen={showCancelModal}
        onClose={closeCancelModal}
        onConfirm={handleConfirmCancel}
        orderId={cancelOrderId}
        isProcessing={cancelling}
      />
    </Layout>
  );
};

export default Orders;
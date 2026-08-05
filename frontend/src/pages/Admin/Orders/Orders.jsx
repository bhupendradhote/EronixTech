import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from 'react-icons/fi';
import orderService from '../../../services/orderService';
import './Orders.css';

// ========== Cancel Reason Modal (for admin) ==========
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
        <button className="close-modal" onClick={onClose}>
          <FiX size={20} />
        </button>
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
          <button className="btn-cancel-modal" onClick={onClose} disabled={isProcessing}>
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

// ========== Main Admin Orders Component ==========
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'pickup_initiated', label: 'Pickup Initiated' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await orderService.getAllOrders();
      if (response.success) {
        const mappedOrders = response.orders.map((order) => ({
          orderId: order.id,
          displayId: order.order_number || `#${order.id}`,
          customer: {
            name: order.customer_name || 'Unknown',
            email: order.customer_email || 'N/A',
            phone: order.customer_phone || 'N/A',
          },
          date: order.created_at
            ? new Date(order.created_at).toISOString().split('T')[0]
            : 'N/A',
          total: Number(order.total_amount) || 0,
          // Extract backend fields if they exist
          subtotal: Number(order.subtotal) || 0,
          warranty_total: Number(order.warranty_total) || 0,
          tax_amount: Number(order.tax_amount) || 0,
          shipping_fee: Number(order.shipping_fee) || 0,
          discount: (Number(order.coupon_discount) || 0) + (Number(order.coin_discount) || 0),
          status: order.order_status || 'pending',
          items: order.items || [],
          shipping: {
            address: [
              order.shipping_address_line1,
              order.shipping_city,
              order.shipping_state,
              order.shipping_pincode,
            ]
              .filter(Boolean)
              .join(', ') || 'No address',
          },
          payment_method: order.payment_method || 'N/A',
          payment_status: order.payment_status || 'N/A',
          courier: order.courier_company || null,
          tracking_url: order.tracking_url || null,
          awb: order.fship_awb || null,
          created_at: order.created_at,
          cancellation_reason: order.cancellation_reason || null,
        }));
        setOrders(mappedOrders);
      } else {
        setError(response.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // ===== Update Order Status (API call) =====
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
      fetchOrders();
    }
  };

  // ===== Delete Order =====
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order?')) return;

    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setShowModal(false);
      setSelectedOrder(null);
    }

    try {
      console.log(`Order ${orderId} deleted locally (API not implemented)`);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete order. Refreshing...');
      fetchOrders();
    }
  };

  // ===== Open Cancel Modal =====
  const openCancelModal = (orderId) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelOrderId(null);
  };

  // ===== Confirm Cancel with Reason =====
  const handleConfirmCancel = async (orderId, reason) => {
    setCancelling(true);
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId ? { ...o, status: 'cancelled', cancellation_reason: reason } : o
          )
        );
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'cancelled', cancellation_reason: reason });
        }
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

  // ===== View Order Details =====
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // ===== Status Badge Class =====
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'pending': return 'status-pending';
      case 'pickup_initiated': return 'status-pickup';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  // ===== Filter & Search =====
  const filteredOrders = orders.filter((order) => {
    const displayId = order.displayId || '';
    const customerName = order.customer?.name || '';
    const customerEmail = order.customer?.email || '';
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      displayId.toLowerCase().includes(search) ||
      customerName.toLowerCase().includes(search) ||
      customerEmail.toLowerCase().includes(search);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);


  // ----- Dynamic Calculation for Modal Breakdown -----
  const computeOrderBreakdown = (order) => {
    if (!order) return { productSubtotal: 0, warrantyTotal: 0 };
    
    let pSub = 0;
    let wTot = 0;
    
    order.items.forEach(item => {
      // Check if it's a warranty item via flag or name fallback
      const isWarranty = item.is_warranty === 1 || 
                         item.is_warranty === true || 
                         (item.product_name && item.product_name.toLowerCase().includes('warranty'));
      
      const price = Number(item.total_price) || (Number(item.unit_price) * Number(item.quantity));
      
      if (isWarranty) {
        wTot += price;
      } else {
        pSub += price;
      }
    });

    return { productSubtotal: pSub, warrantyTotal: wTot };
  };

  const currentBreakdown = computeOrderBreakdown(selectedOrder);

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="orders-header">
        <div className="header-title">
          <h1>Orders Management</h1>
          <p>View and manage all customer orders</p>
        </div>
        <button className="btn-primary" onClick={fetchOrders}>
          ⟳ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-wrapper">
          <FiFilter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table / Loading / Error */}
      {loading ? (
        <div className="loading-spinner">Loading orders...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="order-id">{order.displayId}</td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">{order.customer.name}</span>
                          <span className="customer-email">{order.customer.email}</span>
                        </div>
                      </td>
                      <td>{order.date}</td>
                      <td className="order-amount">₹{order.total.toLocaleString()}</td>
                      <td>
                        <div className="status-select-wrapper">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                            className={`status-select ${getStatusBadgeClass(order.status)}`}
                          >
                            {statusOptions
                              .filter((opt) => opt.value !== 'all')
                              .map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                          </select>
                        </div>
                      </td>
                      <td className="actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => viewOrderDetails(order)}
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          className="action-btn cancel-btn"
                          onClick={() => openCancelModal(order.orderId)}
                          title="Cancel Order"
                          disabled={order.status === 'cancelled' || order.status === 'delivered'}
                        >
                          <FiX size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteOrder(order.orderId)}
                          title="Delete Order"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
                <FiChevronLeft size={16} /> Prev
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.displayId}</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              
              {/* Top Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="details-section" style={{ marginBottom: 0 }}>
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                  <p><strong>Payment:</strong> {selectedOrder.payment_method} - {selectedOrder.payment_status}</p>
                </div>
                
                <div className="details-section" style={{ marginBottom: 0 }}>
                  <h3>Logistics & Status</h3>
                  <p><strong>Order Date:</strong> {selectedOrder.date}</p>
                  <p>
                    <strong>Status:</strong>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.orderId, e.target.value)}
                      className={`modal-status-select ${getStatusBadgeClass(selectedOrder.status)}`}
                      style={{ marginLeft: '10px' }}
                    >
                      {statusOptions
                        .filter((opt) => opt.value !== 'all')
                        .map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                  </p>
                  <p><strong>Courier:</strong> {selectedOrder.courier || 'Pending Assignment'}</p>
                  {selectedOrder.awb && <p><strong>AWB:</strong> {selectedOrder.awb}</p>}
                  {selectedOrder.tracking_url && (
                    <p><a href={selectedOrder.tracking_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Track Shipment</a></p>
                  )}
                  {selectedOrder.cancellation_reason && (
                    <p style={{ color: '#ef4444' }}><strong>Cancellation Reason:</strong> {selectedOrder.cancellation_reason}</p>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3>Shipping Address</h3>
                <p style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  {selectedOrder.shipping.address}
                </p>
              </div>

              {/* Items Section */}
              <div className="details-section">
                <h3>Order Items</h3>
                <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '10px' }}>Item</th>
                      <th style={{ padding: '10px' }}>Quantity</th>
                      <th style={{ padding: '10px' }}>Unit Price</th>
                      <th style={{ padding: '10px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => {
                      const isWarranty = item.is_warranty === 1 || item.is_warranty === true || (item.product_name && item.product_name.toLowerCase().includes('warranty'));
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee', background: isWarranty ? '#eff6ff' : 'transparent' }}>
                          <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.product_image && !isWarranty ? (
                              <img src={item.product_image} alt={item.product_name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                            ) : (
                              <div style={{ width: 40, height: 40, background: isWarranty ? '#bfdbfe' : '#f3f4f6', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                {isWarranty ? '🛡️' : '📦'}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                              {isWarranty && <span style={{ fontSize: '11px', color: '#2563eb', background: '#dbeafe', padding: '2px 6px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' }}>Extended Warranty</span>}
                            </div>
                          </td>
                          <td style={{ padding: '10px' }}>{item.quantity}</td>
                          <td style={{ padding: '10px' }}>₹{Number(item.unit_price).toLocaleString()}</td>
                          <td style={{ padding: '10px', fontWeight: 600 }}>₹{Number(item.total_price || (item.unit_price * item.quantity)).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Breakdown Summary Block */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <div style={{ width: '300px', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Subtotal (Products)</span>
                    <span>₹{currentBreakdown.productSubtotal.toLocaleString()}</span>
                  </div>
                  
                  {currentBreakdown.warrantyTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#2563eb' }}>
                      <span>Total Warranty</span>
                      <span>+ ₹{currentBreakdown.warrantyTotal.toLocaleString()}</span>
                    </div>
                  )}

                  {selectedOrder.tax_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Estimated GST</span>
                      <span>+ ₹{selectedOrder.tax_amount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Shipping</span>
                    <span>{selectedOrder.shipping_fee > 0 ? `+ ₹${selectedOrder.shipping_fee.toLocaleString()}` : 'FREE'}</span>
                  </div>

                  {selectedOrder.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10b981' }}>
                      <span>Discounts Applied</span>
                      <span>- ₹{selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #d1d5db', margin: '12px 0' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>Grand Total</span>
                    <span>₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
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
    </div>
  );
};

export default Orders;
import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiUser,
  FiCalendar,
  FiEye,
  FiMessageSquare
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import preBookingService from '../../../services/preBookingService';
import './PreBookings.css';

const statusOptions = ['All', 'Pending', 'Contacted', 'Completed', 'Cancelled'];
const editableStatuses = ['Pending', 'Contacted', 'Completed', 'Cancelled'];

/* ─── WhatsApp helper ────────────────────────────────────────────────── */
const normalisePhoneForWhatsApp = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

const buildDefaultWhatsAppMessage = (booking) => {
  const name = booking.customerName || 'there';
  const product = booking.productName || 'your pre-booked product';
  const bookingId = booking.displayId || '';
  const variant = booking.variantName ? ` (${booking.variantName})` : '';
  return (
    `Hello ${name},\n\n` +
    `Thank you for your pre-booking with EronixTech.\n\n` +
    `Booking ID: ${bookingId}\n` +
    `Product: ${product}${variant}\n` +
    `Quantity: ${booking.quantity}\n\n` +
    `Our team will get back to you shortly with availability and payment details.\n\n` +
    `Regards,\nEronixTech Team`
  );
};

const PreBookings = () => {
  const [preBookings, setPreBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Track which rows are currently updating status
  const [updatingIds, setUpdatingIds] = useState([]);

  // --- Drawer State ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- 1. Fetch Pre-Bookings ---
  useEffect(() => {
    fetchPreBookings();
  }, []);

  const fetchPreBookings = async () => {
    try {
      setIsLoading(true);
      const data = await preBookingService.getAllPreBookings();
      const list = Array.isArray(data) ? data : [];

      const formatted = list.map((item) => ({
        dbId: item.id,
        displayId: `PB-${String(item.id).padStart(4, '0')}`,
        productId: item.product_id,
        productName: item.product_name || 'Unknown Product',
        variantName: item.variant_name || '',
        customerName: item.name || 'Unknown',
        email: item.email || '',
        phone: item.phone || 'N/A',
        quantity: item.quantity || 1,
        pincode: item.pincode || 'N/A',
        message: item.message || '',
        createdAt: item.created_at
          ? new Date(item.created_at).toISOString().slice(0, 10)
          : 'N/A',
        status: item.status || 'Pending',
      }));

      setPreBookings(formatted);
      setError(null);
    } catch (err) {
      console.error('Fetch pre-bookings error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch pre-bookings'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Filter & Pagination ---
  const filteredBookings = preBookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.customerName.toLowerCase().includes(term) ||
      b.email.toLowerCase().includes(term) ||
      b.phone.toLowerCase().includes(term) ||
      b.productName.toLowerCase().includes(term) ||
      b.displayId.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- 3. Action Handlers ---
  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedBooking(null);
  };

  const handleDelete = async (booking) => {
    if (!window.confirm(`Delete pre-booking ${booking.displayId}?`)) return;

    try {
      await preBookingService.deletePreBooking(booking.dbId);
      setPreBookings((prev) => prev.filter((b) => b.dbId !== booking.dbId));
      if (selectedBooking?.dbId === booking.dbId) closeDrawer();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete pre-booking.'
      );
    }
  };

  // --- 4. Status Change Handler (optimistic) ---
  const handleStatusChange = async (booking, newStatus) => {
    if (!newStatus || newStatus === booking.status) return;

    const previousStatus = booking.status;

    // Optimistically update UI
    setPreBookings((prev) =>
      prev.map((b) => (b.dbId === booking.dbId ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking && selectedBooking.dbId === booking.dbId) {
      setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    }
    setUpdatingIds((prev) => [...prev, booking.dbId]);

    try {
      await preBookingService.updatePreBookingStatus(booking.dbId, newStatus);
    } catch (err) {
      // Rollback on failure
      setPreBookings((prev) =>
        prev.map((b) =>
          b.dbId === booking.dbId ? { ...b, status: previousStatus } : b
        )
      );
      if (selectedBooking && selectedBooking.dbId === booking.dbId) {
        setSelectedBooking((prev) => ({ ...prev, status: previousStatus }));
      }
      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to update status.'
      );
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== booking.dbId));
    }
  };

  // --- 5. WhatsApp Send Handler ---
  const handleWhatsApp = (booking) => {
    const phone = normalisePhoneForWhatsApp(booking.phone);
    if (!phone) {
      alert('No valid phone number available for this customer.');
      return;
    }
    const message = buildDefaultWhatsAppMessage(booking);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Contacted':
        return 'status-contacted';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-inactive';
    }
  };

  return (
    <div className="prebookings-page">
      {/* Header */}
      <div className="prebookings-header">
        <div className="header-title">
          <h1>Pre-Bookings Management</h1>
          <p>View and manage all customer pre-booking requests</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer, email, phone or product..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <div className="filter-wrapper">
          <FiFilter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="prebookings-table-container">
        <table className="prebookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>PIN</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: 'center', padding: '40px' }}
                >
                  Loading pre-bookings...
                </td>
              </tr>
            ) : paginatedBookings.length > 0 ? (
              paginatedBookings.map((b) => (
                <tr key={b.dbId}>
                  <td className="booking-id-cell">
                    <span className="booking-id">{b.displayId}</span>
                  </td>
                  <td className="customer-cell">
                    <div className="customer-avatar">
                      {b.customerName
                        ? b.customerName.charAt(0).toUpperCase()
                        : '?'}
                    </div>
                    <div className="customer-info">
                      <span className="customer-name">{b.customerName}</span>
                      <span className="customer-id">{b.phone}</span>
                    </div>
                  </td>
                  <td className="product-cell">
                    <div className="product-info">
                      <span className="product-name">{b.productName}</span>
                      {b.variantName && (
                        <span className="product-variant">
                          {b.variantName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="qty-cell">{b.quantity}</td>
                  <td className="pincode-cell">{b.pincode}</td>
                  <td className="date-cell">{b.createdAt}</td>
                  <td>
                    <select
                      className={`status-select ${getStatusBadgeClass(
                        b.status
                      )}`}
                      value={b.status}
                      disabled={updatingIds.includes(b.dbId)}
                      onChange={(e) => handleStatusChange(b, e.target.value)}
                      title="Change status"
                    >
                      {editableStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="actions">
                    <button
                      className="action-btn whatsapp-btn"
                      onClick={() => handleWhatsApp(b)}
                      title="Send WhatsApp Message"
                    >
                      <FaWhatsapp size={16} />
                    </button>
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleView(b)}
                      title="View Details"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(b)}
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No pre-bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            <FiChevronLeft size={16} /> Prev
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next <FiChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail Drawer */}
      {isDrawerOpen && selectedBooking && (
        <div className="pbk-drawer-overlay" onClick={closeDrawer}>
          <div
            className="pbk-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pbk-drawer-header">
              <h2>Pre-Booking Details</h2>
              <button className="pbk-close-btn" onClick={closeDrawer}>
                <FiX size={24} />
              </button>
            </div>

            <div className="pbk-drawer-body">
              {/* Booking Summary */}
              <div className="pbk-drawer-section">
                <div className="booking-summary">
                  <span className="booking-id-chip">
                    {selectedBooking.displayId}
                  </span>
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Status Changer */}
              <div className="pbk-drawer-section">
                <h3>Change Status</h3>
                <select
                  className={`status-select status-select-block ${getStatusBadgeClass(
                    selectedBooking.status
                  )}`}
                  value={selectedBooking.status}
                  disabled={updatingIds.includes(selectedBooking.dbId)}
                  onChange={(e) =>
                    handleStatusChange(selectedBooking, e.target.value)
                  }
                >
                  {editableStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {updatingIds.includes(selectedBooking.dbId) && (
                  <p className="status-updating-text">Updating status…</p>
                )}
              </div>

              {/* Customer Info */}
              <div className="pbk-drawer-section">
                <h3>Customer Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <FiUser className="info-icon" />
                    <div>
                      <span className="info-label">Name</span>
                      <span className="info-value">
                        {selectedBooking.customerName}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiMail className="info-icon" />
                    <div>
                      <span className="info-label">Email</span>
                      <span className="info-value">
                        {selectedBooking.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiPhone className="info-icon" />
                    <div>
                      <span className="info-label">Phone</span>
                      <span className="info-value">
                        {selectedBooking.phone}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiMapPin className="info-icon" />
                    <div>
                      <span className="info-label">PIN Code</span>
                      <span className="info-value">
                        {selectedBooking.pincode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="pbk-drawer-section">
                <h3>Product Details</h3>
                <div className="info-list">
                  <div className="info-item">
                    <FiPackage className="info-icon" />
                    <div>
                      <span className="info-label">Product</span>
                      <span className="info-value">
                        {selectedBooking.productName}
                      </span>
                    </div>
                  </div>
                  {selectedBooking.variantName && (
                    <div className="info-item">
                      <FiPackage className="info-icon" />
                      <div>
                        <span className="info-label">Variant</span>
                        <span className="info-value">
                          {selectedBooking.variantName}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="info-item">
                    <FiPackage className="info-icon" />
                    <div>
                      <span className="info-label">Quantity</span>
                      <span className="info-value">
                        {selectedBooking.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiCalendar className="info-icon" />
                    <div>
                      <span className="info-label">Requested On</span>
                      <span className="info-value">
                        {selectedBooking.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedBooking.message && (
                <div className="pbk-drawer-section">
                  <h3>Customer Note</h3>
                  <div className="message-box">
                    <FiMessageSquare className="message-icon" />
                    <p>{selectedBooking.message}</p>
                  </div>
                </div>
              )}

              {/* Drawer Actions */}
              <div className="pbk-drawer-section">
                <h3>Quick Actions</h3>
                <button
                  className="pbk-whatsapp-btn"
                  onClick={() => handleWhatsApp(selectedBooking)}
                >
                  <FaWhatsapp size={18} />
                  Send WhatsApp Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreBookings;
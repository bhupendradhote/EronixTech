import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiTrash2, FiEye, FiCheckCircle, 
  FiStar, FiX, FiClock, FiFilter 
} from 'react-icons/fi';
// Ensure reviewService has the admin methods implemented
import reviewService from '../../../services/reviewService'; 
import './ReviewManagement.css';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Filter States
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const [selectedReview, setSelectedReview] = useState(null);
  
  // Status state for the right-side moderation form
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Fetching all reviews (pending, approved, rejected) for admin
      const data = await reviewService.getAllAdminReviews(); 
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    }
  };

  // --- UPDATED FILTERING LOGIC ---
  const filteredReviews = reviews.filter(r => {
    // 1. Match Search
    const matchesSearch = 
      (r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.review?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.product_id.toString().includes(searchTerm));

    // 2. Match Status
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    // 3. Match Rating (rounding rating to nearest whole number for exact matching)
    const matchesRating = ratingFilter === 'all' || Math.round(r.rating).toString() === ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleSelectReview = (review) => {
    setSelectedReview(review);
    setReviewStatus(review.status);
  };

  const clearSelection = () => {
    setSelectedReview(null);
    setReviewStatus('pending');
  };

  const saveStatusChange = async () => {
    if (!selectedReview) return;
    setIsUpdating(true);
    try {
      await reviewService.updateReviewStatus(selectedReview.id, reviewStatus);
      await fetchReviews();
      
      setSelectedReview(prev => ({ ...prev, status: reviewStatus }));
      alert(`Review status updated to ${reviewStatus}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating review status');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteReview = async (id, e) => {
    e.stopPropagation(); 
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        await reviewService.deleteReview(id);
        fetchReviews();
        if (selectedReview?.id === id) clearSelection();
      } catch (error) {
        alert('Failed to delete review');
      }
    }
  };

  const quickApprove = async (id, e) => {
    e.stopPropagation(); 
    try {
      await reviewService.updateReviewStatus(id, 'approved');
      fetchReviews();
      if (selectedReview?.id === id) {
        setSelectedReview(prev => ({ ...prev, status: 'approved' }));
        setReviewStatus('approved');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to approve review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <FiStar key={i} fill={i < rating ? '#ffc107' : 'none'} color={i < rating ? '#ffc107' : '#e4e5e9'} size={14} />
        ))}
      </div>
    );
  };

  return (
    <div className="rm-page">
      <div className="rm-header">
        <div className="rm-header-title">
          <h1>Review Moderation</h1>
          <p>Manage customer reviews, ratings, and product feedback</p>
        </div>
      </div>

      <div className="rm-layout">
        {/* LEFT SIDE: DATA TABLE */}
        <div className="rm-table-section">
          
          {/* --- UPDATED TOOLBAR WITH FILTERS --- */}
          <div className="rm-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <div className="rm-search" style={{ flex: '1', minWidth: '250px' }}>
              <FiSearch className="rm-search-icon" />
              <input 
                type="text" 
                placeholder="Search by customer, product ID, or keyword..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="rm-filters" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <FiFilter color="#64748b" size={16} />
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="rm-filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select 
                value={ratingFilter} 
                onChange={(e) => setRatingFilter(e.target.value)} 
                className="rm-filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

          </div>

          <div className="rm-table-container">
            <table className="rm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length > 0 ? filteredReviews.map(review => (
                  <tr 
                    key={review.id} 
                    className={selectedReview?.id === review.id ? 'rm-row-active' : ''}
                    onClick={() => handleSelectReview(review)}
                  >
                    <td className="rm-fw-500">#{review.product_id}</td>
                    <td>
                      <div className="rm-text-dark rm-fw-500">{review.customer_name || `User #${review.customer_id}`}</div>
                      <div className="rm-text-muted rm-text-sm">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{renderStars(review.rating)}</td>
                    <td>
                      <span className={`rm-badge rm-badge-${review.status}`}>
                        {review.status}
                      </span>
                    </td>
                    <td>
                      <div className="rm-actions">
                        <button className="rm-btn-icon rm-text-blue" onClick={(e) => { e.stopPropagation(); handleSelectReview(review); }} title="View Details">
                          <FiEye size={16} />
                        </button>
                        {review.status !== 'approved' && (
                          <button className="rm-btn-icon rm-text-green" onClick={(e) => quickApprove(review.id, e)} title="Quick Approve">
                            <FiCheckCircle size={16} />
                          </button>
                        )}
                        <button className="rm-btn-icon rm-text-red" onClick={(e) => deleteReview(review.id, e)} title="Delete Review">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="rm-empty-state">No reviews found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE: MODERATION PANEL */}
        <div className="rm-panel-section">
          <div className="rm-panel-header">
            <h2>Review Details</h2>
            {selectedReview && (
              <button className="rm-btn-close" onClick={clearSelection}>
                <FiX size={20} />
              </button>
            )}
          </div>
          
          <div className="rm-panel-body">
            {!selectedReview ? (
              <div className="rm-panel-placeholder">
                <FiEye size={48} />
                <p>Select a review from the table to view its full details, attached images, and update its moderation status.</p>
              </div>
            ) : (
              <div className="rm-review-card">
                
                {/* Meta Info */}
                <div className="rm-review-meta">
                  <div className="rm-meta-item">
                    <span className="rm-meta-label">Product ID</span>
                    <span className="rm-meta-value">#{selectedReview.product_id}</span>
                  </div>
                  <div className="rm-meta-item">
                    <span className="rm-meta-label">Date Submitted</span>
                    <span className="rm-meta-value rm-flex-center">
                      <FiClock size={12} style={{marginRight: '4px'}}/>
                      {new Date(selectedReview.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <hr className="rm-divider" />

                {/* Customer & Rating */}
                <div className="rm-customer-info">
                  <h3 className="rm-customer-name">{selectedReview.customer_name || 'Anonymous Customer'}</h3>
                  <div className="rm-customer-rating">
                    {renderStars(selectedReview.rating)}
                    <span className="rm-rating-number">{selectedReview.rating} / 5</span>
                  </div>
                </div>

                {/* Review Text */}
                <div className="rm-review-text-box">
                  {selectedReview.review ? (
                    <p>"{selectedReview.review}"</p>
                  ) : (
                    <p className="rm-text-italic rm-text-muted">No written feedback provided by the customer.</p>
                  )}
                </div>

                {/* Review Images */}
                {selectedReview.images && selectedReview.images.length > 0 && (
                  <div className="rm-review-images-section">
                    <label className="rm-label">Attached Images ({selectedReview.images.length})</label>
                    <div className="rm-image-gallery">
                      {selectedReview.images.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noreferrer" className="rm-image-link">
                          <img src={img} alt={`Review upload ${idx + 1}`} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="rm-divider" />

                {/* Status Update Form */}
                <div className="rm-status-form">
                  <label className="rm-label">Moderation Status</label>
                  <div className="rm-status-select-wrapper">
                    <select 
                      className={`rm-select rm-status-text-${reviewStatus}`}
                      value={reviewStatus} 
                      onChange={(e) => setReviewStatus(e.target.value)}
                    >
                      <option value="pending">⏳ Pending Review</option>
                      <option value="approved">✅ Approved (Visible to Public)</option>
                      <option value="rejected">❌ Rejected (Hidden)</option>
                    </select>
                  </div>

                  <button 
                    className="rm-btn-primary" 
                    onClick={saveStatusChange} 
                    disabled={reviewStatus === selectedReview.status || isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Save Status'}
                  </button>
                  
                  {reviewStatus === selectedReview.status && (
                    <p className="rm-status-note">Status is already up to date.</p>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewManagement;
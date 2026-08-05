import React, { useState, useEffect } from 'react';
import { getProductReviews, addReview } from '../../../services/reviewService';
import userService from '../../../services/userService';

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStars = (rating) => {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------
const RatingsReviews = ({ productId }) => {
  // --------------------------------------------
  // State
  // --------------------------------------------
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewData, setReviewData] = useState({
    name: '',
    rating: 5,
    review: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const [hoverRating, setHoverRating] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // --------------------------------------------
  // Fetch logged‑in user's name
  // --------------------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await userService.getProfile();
        const user = response?.user || response?.data || response;
        if (user && user.full_name) {
          setReviewData((prev) => ({
            ...prev,
            name: user.full_name,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch user profile:', err);
        try {
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (localUser?.full_name || localUser?.name) {
            setReviewData((prev) => ({
              ...prev,
              name: localUser.full_name || localUser.name,
            }));
          }
        } catch (_) { /* ignore */ }
      }
    };
    fetchUser();
  }, []);

  // --------------------------------------------
  // Fetch reviews
  // --------------------------------------------
  useEffect(() => {
    if (!productId) {
      setError('No product ID provided.');
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getProductReviews(productId);
        setReviews(data);
        setError(null);
      } catch (err) {
        setError('Could not load reviews. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  // --------------------------------------------
  // Stats
  // --------------------------------------------
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
    return { star, pct };
  });

  // --------------------------------------------
  // Collect all images from reviews
  // --------------------------------------------
  const allImages = reviews
    .filter((rev) => rev.images && rev.images.length > 0)
    .flatMap((rev) => rev.images);

  // --------------------------------------------
  // Lightbox handlers
  // --------------------------------------------
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // --------------------------------------------
  // Form handlers
  // --------------------------------------------
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setSelectedFiles(files);
    }
  };

  const handleStarClick = (rating) => {
    setReviewData((prev) => ({ ...prev, rating }));
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewData.name.trim()) {
      setSubmitMessage('Please enter your name.');
      return;
    }
    if (!reviewData.rating) {
      setSubmitMessage('Please select a rating.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMessage('');

      const payload = {
        product_id: productId,
        rating: reviewData.rating,
        review: reviewData.review.trim() || undefined,
      };

      await addReview(payload, selectedFiles);

      const updated = await getProductReviews(productId);
      setReviews(updated);

      setReviewData((prev) => ({
        ...prev,
        rating: 5,
        review: '',
      }));
      setSelectedFiles([]);
      const fileInput = document.getElementById('review-images');
      if (fileInput) fileInput.value = '';

      setSubmitMessage('Review submitted successfully! It will appear after approval.');
    } catch (err) {
      setSubmitMessage(err?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------
  // Render
  // --------------------------------------------
  return (
    <div className="" style={{  paddingTop: '20px', borderTop: '2px solid #e2e8f0' }} id="reviews">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="pdp-section-title" style={{ margin: 0 }}>Ratings & Reviews</h2>
      </div>

      {/* Image Gallery */}
      {!loading && allImages.length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '10px' }}>
            Customer Images ({allImages.length})
          </h4>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollSnapType: 'x mandatory',
            }}
          >
            {allImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Review ${idx + 1}`}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '2px solid #e2e8f0',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onClick={() => openLightbox(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer',
          }}
          onClick={closeLightbox}
        >
          <span
            style={{
              position: 'absolute',
              top: '20px',
              right: '40px',
              fontSize: '40px',
              color: '#fff',
              cursor: 'pointer',
              zIndex: 10000,
            }}
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            &times;
          </span>

          <button
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              fontSize: '30px',
              padding: '10px 16px',
              borderRadius: '50%',
              cursor: 'pointer',
              zIndex: 10000,
            }}
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            &#10094;
          </button>

          <img
            src={allImages[lightboxIndex]}
            alt={`Review ${lightboxIndex + 1}`}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '4px',
              cursor: 'default',
            }}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              fontSize: '30px',
              padding: '10px 16px',
              borderRadius: '50%',
              cursor: 'pointer',
              zIndex: 10000,
            }}
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            &#10095;
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: '16px',
              background: 'rgba(0,0,0,0.6)',
              padding: '6px 16px',
              borderRadius: '20px',
              zIndex: 10000,
            }}
          >
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Left column: Stats & Form */}
        <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
          <div
            className="review-summary"
            style={{
              padding: '24px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '30px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div className="review-huge-score" style={{ fontSize: '56px', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>
                {loading ? '-' : averageRating || '-'}
                <span style={{ fontSize: '20px', color: '#64748b' }}>/ 5</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                <div style={{ color: '#f59e0b', fontSize: '20px', marginBottom: '4px' }}>
                  {loading ? '☆☆☆☆☆' : (averageRating ? getStars(averageRating) : '☆☆☆☆☆')}
                </div>
                {loading
                  ? 'Loading ratings...'
                  : `Based on ${totalReviews} ${totalReviews === 1 ? 'Rating' : 'Ratings'}`}
              </div>
            </div>

            <div className="review-bars">
              {ratingDistribution.map((row) => (
                <div
                  className="review-bar-row"
                  key={row.star}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}
                >
                  <span style={{ fontSize: '13px', width: '35px', fontWeight: 500, color: '#475569' }}>{row.star} ★</span>
                  <div
                    className="review-progress"
                    style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}
                  >
                    <div
                      className="review-fill"
                      style={{ width: row.pct + '%', height: '100%', background: '#f59e0b', borderRadius: '4px' }}
                    ></div>
                  </div>
                  <span style={{ width: '35px', textAlign: 'right', color: '#64748b', fontSize: '12px' }}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Form */}
          <div
            className="review-form-wrapper"
            style={{
              padding: '24px',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#0f172a', fontWeight: 600 }}>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={reviewData.name}
                  onChange={handleReviewChange}
                  placeholder="Enter your name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outlineColor: '#3b82f6',
                  }}
                />
              </div>

              {/* Star Rating */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                  Rating
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    fontSize: '30px',
                    color: '#f59e0b',
                    cursor: 'pointer',
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                      style={{
                        transition: 'transform 0.1s ease',
                        transform: hoverRating >= star || reviewData.rating >= star ? 'scale(1.1)' : 'scale(1)',
                        color: hoverRating >= star || reviewData.rating >= star ? '#f59e0b' : '#d1d5db',
                      }}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ fontSize: '16px', color: '#64748b', marginLeft: '10px' }}>
                    {reviewData.rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                  Your Review
                </label>
                <textarea
                  name="review"
                  value={reviewData.review}
                  onChange={handleReviewChange}
                  rows="4"
                  placeholder="What did you like or dislike about this product?"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outlineColor: '#3b82f6',
                    resize: 'vertical',
                  }}
                ></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                  Upload Images (max 5)
                </label>
                <input
                  type="file"
                  id="review-images"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '6px' }}
                />
                <small style={{ color: '#64748b' }}>You can upload up to 5 images.</small>
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (submitting || loading) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'background 0.2s',
                  width: '100%',
                  opacity: (submitting || loading) ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              {submitMessage && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: submitMessage.includes('success') ? '#16a34a' : '#dc2626' }}>
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right column: Review List – now scrollable */}
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <div
            className="review-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxHeight: '850px',          // fixed height for scrolling
              overflowY: 'auto',            // vertical scroll when content exceeds height
              paddingRight: '8px',          // avoid scrollbar overlap
              scrollBehavior: 'smooth',
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Loading reviews...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
                {error}
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                No reviews yet. Be the first to review!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="review-item" style={{ paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                  <div
                    className="review-item-head"
                    style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}
                  >
                    <span
                      className="badge-rating"
                      style={{
                        background: '#f59e0b',
                        color: '#0f172a',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {rev.rating} ★
                    </span>
                    <span className="review-author" style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                      {rev.customer_name || 'Anonymous'}
                    </span>
                    {rev.status === 'approved' && (
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#64748b',
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Verified
                      </span>
                    )}
                    <span className="review-date" style={{ color: '#888', fontSize: '13px', marginLeft: 'auto' }}>
                      {formatDate(rev.created_at)}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0f172a' }}>
                    {rev.review ? rev.review.substring(0, 60) : 'No title'}
                  </h4>
                  <div className="review-content" style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                    {rev.review || 'No review text provided.'}
                  </div>
                  {rev.images && rev.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {rev.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`review-${idx}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: '1px solid #e2e8f0',
                          }}
                          onClick={() => {
                            const globalIndex = allImages.indexOf(img);
                            if (globalIndex !== -1) openLightbox(globalIndex);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            {!loading && reviews.length >= 10 && (
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button
                  style={{
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    padding: '10px 24px',
                    borderRadius: '24px',
                    color: '#0f172a',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingsReviews;
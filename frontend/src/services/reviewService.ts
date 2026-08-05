import api from './api';

// ==================== Interfaces ====================

export interface Review {
  id: number;
  product_id: number;
  customer_id: number;
  customer_name?: string;
  rating: number;
  review?: string | null;
  images?: string[] | null; // parsed from JSON
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: { star: number; count: number; pct: number }[];
}

// ==================== API Functions ====================

// Get approved reviews for a product (public)
export const getProductReviews = async (productId: number | string): Promise<Review[]> => {
  const response = await api.get<{ success: boolean; data: Review[] }>(
    `/reviews/product/${productId}`
  );
  return response.data.data;
};

// Add a new review (authenticated)
export const addReview = async (
  reviewData: { product_id: number | string; rating: number; review?: string },
  images: File[] = []
): Promise<Review> => {
  const formData = new FormData();
  formData.append('product_id', String(reviewData.product_id));
  formData.append('rating', String(reviewData.rating));
  if (reviewData.review) formData.append('review', reviewData.review);
  images.forEach((file) => formData.append('images', file));

  const response = await api.post<{ success: boolean; data: Review }>(
    '/reviews',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

// Delete a review (user's own)
export const deleteReview = async (reviewId: number): Promise<void> => {
  await api.delete<{ success: boolean }>(`/reviews/${reviewId}`);
};

// Update review status (admin)
export const updateReviewStatus = async (
  reviewId: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> => {
  await api.put<{ success: boolean }>(`/reviews/${reviewId}/status`, { status });
};

// Compute review stats (helper, can be used separately)
export const getReviewStats = async (productId: number | string): Promise<ReviewStats> => {
  const reviews = await getProductReviews(productId);
  const total = reviews.length;
  if (total === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, pct: 0 })),
    };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = parseFloat((sum / total).toFixed(1));
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = parseFloat(((count / total) * 100).toFixed(0));
    return { star, count, pct };
  });
  return { averageRating: avg, totalReviews: total, distribution };
};

// Add this to your reviewService exports
export const getAllAdminReviews = async () => {
  const response = await api.get('/reviews/admin/all'); // Ensure this route exists on backend
  return response.data.data;
};

// Default export (for backward compatibility)
const reviewService = {
  getProductReviews,
  addReview,
  deleteReview,
  updateReviewStatus,
  getReviewStats,
  getAllAdminReviews
};
export default reviewService;
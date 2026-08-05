const Review = require('../models/Review');

// Helper function to parse JSON images field
const parseJSONFields = (review) => {
    if (review.images && typeof review.images === 'string') {
        try {
            review.images = JSON.parse(review.images);
        } catch (e) {
            console.warn(`Could not parse images JSON for review ID: ${review.id}`);
            review.images = [];
        }
    }
    return review;
};

const reviewController = {
    // 1. Add a new review
    addReview: async (req, res) => {
        try {
            const { product_id, rating, review } = req.body;
            const customer_id = req.user.id; // From JWT Auth Middleware

            if (!product_id || !rating) {
                return res.status(400).json({ success: false, message: 'Product ID and rating are required.' });
            }

            const reviewData = {
                product_id,
                customer_id,
                rating,
                review: review || null
            };

            // Handle Multiple Image Uploads via Multer
            if (req.files && req.files.length > 0) {
                const imagesArray = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
                reviewData.images = JSON.stringify(imagesArray);
            }

            // Note: DB defaults status to 'pending', so no need to pass it unless auto-approving
            const insertId = await Review.create(reviewData);
            let newReview = await Review.findById(insertId);
            
            newReview = parseJSONFields(newReview);

            res.status(201).json({ 
                success: true, 
                message: 'Review submitted successfully and is pending approval.', 
                data: newReview 
            });
        } catch (error) {
            console.error('Add Review Error:', error);
            res.status(500).json({ success: false, message: 'Error adding review', error: error.message });
        }
    },

    // 2. Get approved reviews for a product (Public)
    getProductReviews: async (req, res) => {
        try {
            const { productId } = req.params;
            
            // Fetch only 'approved' reviews by default for the frontend
            const reviews = await Review.findByProductId(productId, 'approved');

            const formattedReviews = reviews.map(r => parseJSONFields(r));

            res.status(200).json({ success: true, data: formattedReviews });
        } catch (error) {
            console.error('Get Product Reviews Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
        }
    },

    // 3. Update Review Status (Admin Endpoint)
    updateReviewStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // Expects 'pending', 'approved', or 'rejected'

            const validStatuses = ['pending', 'approved', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status value.' });
            }

            const affectedRows = await Review.updateStatus(id, status);

            if (affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Review not found.' });
            }

            res.status(200).json({ success: true, message: `Review status updated to ${status}.` });
        } catch (error) {
            console.error('Update Review Status Error:', error);
            res.status(500).json({ success: false, message: 'Error updating review status', error: error.message });
        }
    },

    // 4. Delete a review
    deleteReview: async (req, res) => {
        try {
            const { id } = req.params;
            const customer_id = req.user.id; // Current logged in user

            // Delete passing customer_id ensures they only delete their own review
            const affectedRows = await Review.delete(id, customer_id);

            if (affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Review not found or you are not authorized to delete it.' });
            }

            res.status(200).json({ success: true, message: 'Review deleted successfully.' });
        } catch (error) {
            console.error('Delete Review Error:', error);
            res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
        }
    },

    // Add this inside reviewController
    getAllAdminReviews: async (req, res) => {
        try {
            const reviews = await Review.getAllForAdmin();
            const formattedReviews = reviews.map(r => parseJSONFields(r));

            res.status(200).json({ success: true, data: formattedReviews });
        } catch (error) {
            console.error('Get All Admin Reviews Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching all reviews', error: error.message });
        }
    },
};

module.exports = reviewController;
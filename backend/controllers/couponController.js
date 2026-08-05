const Coupon = require('../models/Coupon');

const couponController = {
    // 1. Create a new coupon
    createCoupon: async (req, res) => {
        try {
            const couponData = { ...req.body };

            // Ensure the code is uppercase and stripped of whitespace
            if (couponData.code) {
                couponData.code = couponData.code.toUpperCase().replace(/\s+/g, '');
            } else {
                return res.status(400).json({ success: false, message: 'Coupon code is required.' });
            }

            // Set defaults if not provided
            couponData.status = couponData.status || 'active';
            couponData.used_count = 0;

            const insertId = await Coupon.create(couponData);
            const newCoupon = await Coupon.findById(insertId);

            res.status(201).json({ success: true, message: 'Coupon created successfully', data: newCoupon });
        } catch (error) {
            console.error('Create Coupon Error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Duplicate entry detected. This coupon code already exists.' });
            }
            res.status(500).json({ success: false, message: 'Error creating coupon', error: error.message });
        }
    },

    // 2. Get all coupons
    getAllCoupons: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                active_only: req.query.active_only
            };

            const coupons = await Coupon.findAll(filters);
            res.status(200).json({ success: true, data: coupons });
        } catch (error) {
            console.error('Get Coupons Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching coupons', error: error.message });
        }
    },

    // 3. Get single coupon by ID
    getCouponById: async (req, res) => {
        try {
            const { id } = req.params;
            const coupon = await Coupon.findById(id);

            if (!coupon) {
                return res.status(404).json({ success: false, message: 'Coupon not found' });
            }

            res.status(200).json({ success: true, data: coupon });
        } catch (error) {
            console.error('Get Coupon By ID Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching coupon', error: error.message });
        }
    },

    // 4. Validate and Apply a Coupon Code (Used during checkout)
    applyCoupon: async (req, res) => {
        try {
            const { code, cart_total } = req.body;

            if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });
            if (cart_total === undefined) return res.status(400).json({ success: false, message: 'Cart total is required to validate minimum purchase requirements.' });

            const formattedCode = code.toUpperCase().replace(/\s+/g, '');
            const coupon = await Coupon.findByCode(formattedCode);

            if (!coupon) {
                return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
            }

            // Validation Checks
            if (coupon.status !== 'active') {
                return res.status(400).json({ success: false, message: 'This coupon is no longer active.' });
            }

            const now = new Date();
            if (coupon.valid_from && new Date(coupon.valid_from) > now) {
                return res.status(400).json({ success: false, message: 'This coupon is not yet valid.' });
            }

            if (coupon.valid_until && new Date(coupon.valid_until) < now) {
                return res.status(400).json({ success: false, message: 'This coupon has expired.' });
            }

            if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit.' });
            }

            if (coupon.min_purchase_amount && cart_total < coupon.min_purchase_amount) {
                return res.status(400).json({ success: false, message: `A minimum purchase of ${coupon.min_purchase_amount} is required to use this coupon.` });
            }

            // Calculate Discount
            let discountAmount = 0;
            if (coupon.discount_type === 'percentage') {
                discountAmount = (cart_total * coupon.discount_amount) / 100;
                // Cap the discount if a max_discount_amount exists
                if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                    discountAmount = coupon.max_discount_amount;
                }
            } else if (coupon.discount_type === 'fixed') {
                discountAmount = coupon.discount_amount;
            }

            // Ensure discount doesn't exceed cart total
            discountAmount = Math.min(discountAmount, cart_total);

            res.status(200).json({ 
                success: true, 
                message: 'Coupon applied successfully.', 
                data: {
                    coupon: coupon.code,
                    discount_type: coupon.discount_type,
                    original_total: cart_total,
                    discount_amount: parseFloat(discountAmount.toFixed(2)),
                    final_total: parseFloat((cart_total - discountAmount).toFixed(2))
                } 
            });

        } catch (error) {
            console.error('Apply Coupon Error:', error);
            res.status(500).json({ success: false, message: 'Error applying coupon', error: error.message });
        }
    },

    // 5. Update an existing coupon
    updateCoupon: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            if (updateData.code) {
                updateData.code = updateData.code.toUpperCase().replace(/\s+/g, '');
            }

            const existingCoupon = await Coupon.findById(id);
            if (!existingCoupon) {
                return res.status(404).json({ success: false, message: 'Coupon not found' });
            }

            await Coupon.update(id, updateData);
            const updatedCoupon = await Coupon.findById(id);

            res.status(200).json({ success: true, message: 'Coupon updated successfully', data: updatedCoupon });
        } catch (error) {
            console.error('Update Coupon Error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Duplicate entry detected. This coupon code already exists.' });
            }
            res.status(500).json({ success: false, message: 'Error updating coupon', error: error.message });
        }
    },

    // 6. Delete a coupon
    deleteCoupon: async (req, res) => {
        try {
            const { id } = req.params;

            const existingCoupon = await Coupon.findById(id);
            if (!existingCoupon) {
                return res.status(404).json({ success: false, message: 'Coupon not found' });
            }

            await Coupon.delete(id);
            res.status(200).json({ success: true, message: 'Coupon archived/deleted successfully' });
        } catch (error) {
            console.error('Delete Coupon Error:', error);
            res.status(500).json({ success: false, message: 'Error deleting coupon', error: error.message });
        }
    }
};

module.exports = couponController;
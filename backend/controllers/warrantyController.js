// controllers/warrantyController.js
const WarrantyPurchase = require('../models/WarrantyPurchase');

// Optional: verify product exists (if you need it)
// const Product = require('../models/Product');

exports.addWarranty = async (req, res) => {
  try {
    const { productId, variantId, warrantyName, warrantyPrice, totalPrice } = req.body;
    const userId = req.user.id; // from auth middleware

    // 1. Validate required fields
    if (!productId || !warrantyName || warrantyPrice == null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, warrantyName, warrantyPrice',
      });
    }

    // 2. Optional: Check if product exists
    // const product = await Product.findById(productId);
    // if (!product) {
    //   return res.status(404).json({ success: false, message: 'Product not found' });
    // }

    // 3. Create warranty record
    const warrantyId = await WarrantyPurchase.create({
      user_id: userId,
      product_id: productId,
      variant_id: variantId || null,
      warranty_name: warrantyName,
      warranty_price: warrantyPrice,
      total_price: totalPrice || warrantyPrice, // fallback if not provided
      status: 'active',
    });

    // 4. Fetch the newly created record (optional)
    const warranty = await WarrantyPurchase.findById(warrantyId);

    res.status(201).json({
      success: true,
      message: 'Extended warranty added successfully',
      data: warranty,
    });
  } catch (error) {
    console.error('Error adding warranty:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding warranty',
      error: error.message,
    });
  }
};
const Compare = require('../models/Compare');
const Product = require('../models/Product');

// Helper to parse JSON fields
const parseProductJSON = (product) => {
  const fields = ['description', 'key_features', 'images', 'offers', 'variants', 'specifications'];
  fields.forEach(f => {
    if (product[f] && typeof product[f] === 'string') {
      try { product[f] = JSON.parse(product[f]); } catch(e) {}
    }
  });
  return product;
};

exports.getCompare = async (req, res) => {
  try {
    const customerId = req.user.id; // assuming JWT middleware sets req.user
    const items = await Compare.getByCustomer(customerId);
    const products = items.map(item => parseProductJSON(item));
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Get Compare Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching compare list' });
  }
};

exports.addToCompare = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already in compare
    const existing = await Compare.getByCustomer(customerId);
    if (existing.some(p => p.id === parseInt(productId))) {
      return res.status(400).json({ success: false, message: 'Product already in compare' });
    }

    await Compare.add(customerId, productId);
    res.status(201).json({ success: true, message: 'Product added to compare' });
  } catch (error) {
    console.error('Add Compare Error:', error);
    res.status(500).json({ success: false, message: 'Error adding to compare' });
  }
};

exports.removeFromCompare = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { productId } = req.params;

    const affected = await Compare.remove(customerId, productId);
    if (affected === 0) {
      return res.status(404).json({ success: false, message: 'Product not in compare' });
    }
    res.status(200).json({ success: true, message: 'Removed from compare' });
  } catch (error) {
    console.error('Remove Compare Error:', error);
    res.status(500).json({ success: false, message: 'Error removing from compare' });
  }
};

exports.clearCompare = async (req, res) => {
  try {
    const customerId = req.user.id;
    await Compare.clear(customerId);
    res.status(200).json({ success: true, message: 'Compare list cleared' });
  } catch (error) {
    console.error('Clear Compare Error:', error);
    res.status(500).json({ success: false, message: 'Error clearing compare' });
  }
};
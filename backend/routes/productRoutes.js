const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const upload = require('../middleware/uploadMiddleware'); 

// Import your API Key middleware
const protectRoute = require('../middleware/apiAuth'); 

// A dedicated middleware just for Excel/CSV files
const documentUpload = multer({ dest: 'uploads/temp_imports/' });

// ==========================================
// ALL ROUTES PROTECTED BY API KEY
// ==========================================

// Get Routes (Browsing the store)
router.get('/', protectRoute, productController.getAllProducts);
router.get('/slug/:slug', protectRoute, productController.getProductBySlug);
router.get('/:id', protectRoute, productController.getProductById);

// Create, Update, Delete, and Import Routes (Now using protectRoute)
router.post('/import', protectRoute, documentUpload.single('file'), productController.importProducts);
router.post('/', protectRoute, upload.any(), productController.createProduct);
router.put('/:id', protectRoute, upload.any(), productController.updateProduct);
router.delete('/:id', protectRoute, productController.deleteProduct);

module.exports = router;
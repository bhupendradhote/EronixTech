const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// Import your middlewares
const upload = require('../middleware/uploadMiddleware'); 
const protectRoute = require('../middleware/apiAuth'); 

// ==========================================
// ALL ROUTES PROTECTED BY API KEY
// ==========================================

// Get Routes
router.get('/', protectRoute, brandController.getAllBrands);
router.get('/:id', protectRoute, brandController.getBrandById);

// Create, Update, Delete Routes (Now using protectRoute)
router.post('/', protectRoute, upload.single('logo'), brandController.createBrand);
router.put('/:id', protectRoute, upload.single('logo'), brandController.updateBrand);
router.delete('/:id', protectRoute, brandController.deleteBrand);

module.exports = router;
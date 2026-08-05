const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Import your middlewares
const upload = require('../middleware/uploadMiddleware');
const protectRoute = require('../middleware/apiAuth'); 

// ==========================================
// ALL ROUTES PROTECTED BY API KEY
// ==========================================

// Get Routes
router.get('/', protectRoute, categoryController.getAllCategories);
router.get('/:id', protectRoute, categoryController.getCategoryById);

// Create, Update, Delete Routes (Now using protectRoute)
router.post('/', protectRoute, upload.single('icon'), categoryController.createCategory);
router.put('/:id', protectRoute, upload.single('icon'), categoryController.updateCategory);
router.delete('/:id', protectRoute, categoryController.deleteCategory);

module.exports = router;
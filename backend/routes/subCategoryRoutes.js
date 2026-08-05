const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');

// Import your middlewares
const upload = require('../middleware/uploadMiddleware'); 
const protectRoute = require('../middleware/apiAuth'); 

// ==========================================
// ALL ROUTES PROTECTED BY API KEY
// ==========================================

// Get Routes
router.get('/category/:categoryId', protectRoute, subCategoryController.getSubCategoriesByCategory);
router.get('/:id', protectRoute, subCategoryController.getSubCategoryById);

// Create, Update, Delete Routes (Now using protectRoute)
router.post('/', protectRoute, upload.single('icon'), subCategoryController.createSubCategory);
router.put('/:id', protectRoute, upload.single('icon'), subCategoryController.updateSubCategory);
router.delete('/:id', protectRoute, subCategoryController.deleteSubCategory);

module.exports = router;
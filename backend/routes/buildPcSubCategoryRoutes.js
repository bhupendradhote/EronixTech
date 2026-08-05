const express = require('express');
const router = express.Router();
const buildPcSubCategoryController = require('../controllers/buildPcSubCategoryController');

const upload = require('../middleware/uploadMiddleware');
const protectRoute = require('../middleware/apiAuth'); 

// Get subcategories specifically linked to a category ID
router.get('/category/:categoryId', protectRoute, buildPcSubCategoryController.getSubCategoriesByCategory);
router.get('/:id', protectRoute, buildPcSubCategoryController.getSubCategoryById);

router.post('/', protectRoute, upload.single('icon'), buildPcSubCategoryController.createSubCategory);
router.put('/:id', protectRoute, upload.single('icon'), buildPcSubCategoryController.updateSubCategory);
router.delete('/:id', protectRoute, buildPcSubCategoryController.deleteSubCategory);

module.exports = router;
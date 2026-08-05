const express = require('express');
const router = express.Router();
const buildPcCategoryController = require('../controllers/buildPcCategoryController');

const upload = require('../middleware/uploadMiddleware');
const protectRoute = require('../middleware/apiAuth'); 

router.get('/', protectRoute, buildPcCategoryController.getAllCategories);
router.get('/:id', protectRoute, buildPcCategoryController.getCategoryById);

router.post('/', protectRoute, upload.single('icon'), buildPcCategoryController.createCategory);
router.put('/:id', protectRoute, upload.single('icon'), buildPcCategoryController.updateCategory);
router.delete('/:id', protectRoute, buildPcCategoryController.deleteCategory);

module.exports = router;
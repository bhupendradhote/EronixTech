const express = require('express');
const router = express.Router();
const controller = require('../controllers/buildPcSubSubCategoryController');

const upload = require('../middleware/uploadMiddleware');
const protectRoute = require('../middleware/apiAuth'); 

// Note: Fetches specifically linked to a sub-category ID
router.get('/subcategory/:subCategoryId', protectRoute, controller.getBySubCategory);
router.get('/:id', protectRoute, controller.getById);

router.post('/', protectRoute, upload.single('icon'), controller.createSubSubCategory);
router.put('/:id', protectRoute, upload.single('icon'), controller.updateSubSubCategory);
router.delete('/:id', protectRoute, controller.deleteSubSubCategory);

module.exports = router;
const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const upload = require('../middleware/uploadMiddleware');

router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);

// We will name the upload field 'image'
router.post('/', upload.single('image'), bannerController.createBanner);
router.put('/:id', upload.single('image'), bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
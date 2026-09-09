const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const upload = require('../middleware/uploadMiddleware');

router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);

// One banner record can now contain both desktop and mobile creatives.
// `image` is accepted as a legacy field so older frontend builds keep working.
const bannerUpload = upload.fields([
    { name: 'desktop_image', maxCount: 1 },
    { name: 'mobile_image', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]);

router.post('/', bannerUpload, bannerController.createBanner);
router.put('/:id', bannerUpload, bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;

const Banner = require('../models/Banner');

const makeUploadUrl = (req, file) => {
    if (!file) return null;
    return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
};

const getUploadedFiles = (req) => {
    const files = req.files || {};

    // `image` is kept for backward compatibility with the old admin form.
    const desktopFile = files.desktop_image?.[0] || files.image?.[0] || null;
    const mobileFile = files.mobile_image?.[0] || null;

    return { desktopFile, mobileFile };
};

const bannerController = {
    createBanner: async (req, res) => {
        try {
            const bannerData = { ...req.body };
            const { desktopFile, mobileFile } = getUploadedFiles(req);

            if (desktopFile) {
                bannerData.image_url = makeUploadUrl(req, desktopFile);
            }

            if (mobileFile) {
                bannerData.mobile_image_url = makeUploadUrl(req, mobileFile);
            }

            if (!bannerData.image_url) {
                return res.status(400).json({
                    success: false,
                    message: 'Desktop banner image is required'
                });
            }

            const insertId = await Banner.create(bannerData);
            const newBanner = await Banner.findById(insertId);

            res.status(201).json({
                success: true,
                message: 'Banner created successfully',
                data: newBanner
            });
        } catch (error) {
            console.error('Create banner error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating banner',
                error: error.message
            });
        }
    },

    getAllBanners: async (req, res) => {
        try {
            const activeOnly = req.query.active === 'true';
            const banners = await Banner.findAll(activeOnly);
            res.status(200).json({ success: true, data: banners });
        } catch (error) {
            console.error('Get banners error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching banners',
                error: error.message
            });
        }
    },

    getBannerById: async (req, res) => {
        try {
            const { id } = req.params;
            const banner = await Banner.findById(id);

            if (!banner) {
                return res.status(404).json({ success: false, message: 'Banner not found' });
            }

            res.status(200).json({ success: true, data: banner });
        } catch (error) {
            console.error('Get banner error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching banner',
                error: error.message
            });
        }
    },

    updateBanner: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existingBanner = await Banner.findById(id);
            if (!existingBanner) {
                return res.status(404).json({ success: false, message: 'Banner not found' });
            }

            const { desktopFile, mobileFile } = getUploadedFiles(req);

            if (desktopFile) {
                updateData.image_url = makeUploadUrl(req, desktopFile);
            }

            if (mobileFile) {
                updateData.mobile_image_url = makeUploadUrl(req, mobileFile);
            }

            // Allows admin to intentionally remove the mobile image and fall back to desktop.
            if (updateData.remove_mobile_image === '1' || updateData.remove_mobile_image === 1) {
                updateData.mobile_image_url = null;
            }
            delete updateData.remove_mobile_image;

            await Banner.update(id, updateData);
            const updatedBanner = await Banner.findById(id);

            res.status(200).json({
                success: true,
                message: 'Banner updated successfully',
                data: updatedBanner
            });
        } catch (error) {
            console.error('Update banner error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating banner',
                error: error.message
            });
        }
    },

    deleteBanner: async (req, res) => {
        try {
            const { id } = req.params;
            const existingBanner = await Banner.findById(id);

            if (!existingBanner) {
                return res.status(404).json({ success: false, message: 'Banner not found' });
            }

            await Banner.delete(id);
            res.status(200).json({ success: true, message: 'Banner deleted successfully' });
        } catch (error) {
            console.error('Delete banner error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting banner',
                error: error.message
            });
        }
    }
};

module.exports = bannerController;

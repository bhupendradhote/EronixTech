const Banner = require('../models/Banner');

const bannerController = {
    createBanner: async (req, res) => {
        try {
            const bannerData = { ...req.body };

            // Catch the uploaded file and generate URL
            if (req.file) {
                bannerData.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const insertId = await Banner.create(bannerData);
            const newBanner = await Banner.findById(insertId);

            res.status(201).json({ success: true, message: 'Banner created successfully', data: newBanner });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error creating banner', error: error.message });
        }
    },

    getAllBanners: async (req, res) => {
        try {
            const activeOnly = req.query.active === 'true';
            const banners = await Banner.findAll(activeOnly);
            res.status(200).json({ success: true, data: banners });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching banners', error: error.message });
        }
    },

    getBannerById: async (req, res) => {
        try {
            const { id } = req.params;
            const banner = await Banner.findById(id);

            if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

            res.status(200).json({ success: true, data: banner });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching banner', error: error.message });
        }
    },

    updateBanner: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existingBanner = await Banner.findById(id);
            if (!existingBanner) return res.status(404).json({ success: false, message: 'Banner not found' });

            // Update image if a new file is uploaded
            if (req.file) {
                updateData.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            await Banner.update(id, updateData);
            const updatedBanner = await Banner.findById(id);

            res.status(200).json({ success: true, message: 'Banner updated successfully', data: updatedBanner });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating banner', error: error.message });
        }
    },

    deleteBanner: async (req, res) => {
        try {
            const { id } = req.params;
            const existingBanner = await Banner.findById(id);
            if (!existingBanner) return res.status(404).json({ success: false, message: 'Banner not found' });

            await Banner.delete(id);
            res.status(200).json({ success: true, message: 'Banner deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error deleting banner', error: error.message });
        }
    }
};

module.exports = bannerController;
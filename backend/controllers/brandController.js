const Brand = require('../models/Brand');

const brandController = {
    // 1. Create a new brand
    createBrand: async (req, res) => {
        try {
            const brandData = { ...req.body };

            // Catch the uploaded file and generate the URL
            if (req.file) {
                brandData.logo_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const insertId = await Brand.create(brandData);
            const newBrand = await Brand.findById(insertId);

            res.status(201).json({ success: true, message: 'Brand created successfully', data: newBrand });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Brand slug must be unique' });
            }
            res.status(500).json({ success: false, message: 'Error creating brand', error: error.message });
        }
    },

    // 2. Get all brands
    getAllBrands: async (req, res) => {
        try {
            const activeOnly = req.query.active === 'true'; // ?active=true
            const brands = await Brand.findAll(activeOnly);

            res.status(200).json({ success: true, data: brands });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching brands', error: error.message });
        }
    },

    // 3. Get single brand by ID
    getBrandById: async (req, res) => {
        try {
            const { id } = req.params;
            const brand = await Brand.findById(id);

            if (!brand) {
                return res.status(404).json({ success: false, message: 'Brand not found' });
            }

            res.status(200).json({ success: true, data: brand });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching brand', error: error.message });
        }
    },

    // 4. Update an existing brand
    updateBrand: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existingBrand = await Brand.findById(id);
            if (!existingBrand) {
                return res.status(404).json({ success: false, message: 'Brand not found' });
            }

            // Catch the newly uploaded file (if any) and update the URL
            if (req.file) {
                updateData.logo_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            await Brand.update(id, updateData);
            const updatedBrand = await Brand.findById(id);

            res.status(200).json({ success: true, message: 'Brand updated successfully', data: updatedBrand });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Brand slug must be unique' });
            }
            res.status(500).json({ success: false, message: 'Error updating brand', error: error.message });
        }
    },

    // 5. Delete a brand
    deleteBrand: async (req, res) => {
        try {
            const { id } = req.params;

            const existingBrand = await Brand.findById(id);
            if (!existingBrand) {
                return res.status(404).json({ success: false, message: 'Brand not found' });
            }

            await Brand.delete(id);
            res.status(200).json({ success: true, message: 'Brand deleted successfully' });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cannot delete brand because it contains products.' 
                });
            }
            res.status(500).json({ success: false, message: 'Error deleting brand', error: error.message });
        }
    }
};

module.exports = brandController;
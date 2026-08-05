const BuildPcSubCategory = require('../models/BuildPcSubCategory');

const buildPcSubCategoryController = {
    createSubCategory: async (req, res) => {
        try {
            const subCategoryData = { ...req.body };

            if (!subCategoryData.build_pc_category_id) {
                return res.status(400).json({ success: false, message: 'Category ID is required' });
            }

            if (req.file) {
                subCategoryData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const insertId = await BuildPcSubCategory.create(subCategoryData);
            const newSubCategory = await BuildPcSubCategory.findById(insertId);

            res.status(201).json({ success: true, message: 'Build PC Sub-category created successfully', data: newSubCategory });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Sub-category slug must be unique' });
            }
            res.status(500).json({ success: false, message: 'Error creating sub-category', error: error.message });
        }
    },

    getSubCategoriesByCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const activeOnly = req.query.active === 'true';

            const subCategories = await BuildPcSubCategory.findByCategoryId(categoryId, activeOnly);
            res.status(200).json({ success: true, data: subCategories });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching sub-categories', error: error.message });
        }
    },

    getSubCategoryById: async (req, res) => {
        try {
            const { id } = req.params;
            const subCategory = await BuildPcSubCategory.findById(id);

            if (!subCategory) {
                return res.status(404).json({ success: false, message: 'Sub-category not found' });
            }

            res.status(200).json({ success: true, data: subCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching sub-category', error: error.message });
        }
    },

    updateSubCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existingSubCategory = await BuildPcSubCategory.findById(id);
            if (!existingSubCategory) {
                return res.status(404).json({ success: false, message: 'Sub-category not found' });
            }

            if (req.file) {
                updateData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            await BuildPcSubCategory.update(id, updateData);
            const updatedSubCategory = await BuildPcSubCategory.findById(id);

            res.status(200).json({ success: true, message: 'Sub-category updated successfully', data: updatedSubCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating sub-category', error: error.message });
        }
    },

    deleteSubCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const existingSubCategory = await BuildPcSubCategory.findById(id);
            if (!existingSubCategory) {
                return res.status(404).json({ success: false, message: 'Sub-category not found' });
            }

            await BuildPcSubCategory.delete(id);
            res.status(200).json({ success: true, message: 'Sub-category deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error deleting sub-category', error: error.message });
        }
    }
};

module.exports = buildPcSubCategoryController;
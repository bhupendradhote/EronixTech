const BuildPcCategory = require('../models/BuildPcCategory');
const BuildPcSubCategory = require('../models/BuildPcSubCategory');

const buildPcCategoryController = {
    createCategory: async (req, res) => {
        try {
            const categoryData = { ...req.body };

            if (req.file) {
                categoryData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const insertId = await BuildPcCategory.create(categoryData);
            const newCategory = await BuildPcCategory.findById(insertId);

            res.status(201).json({ success: true, message: 'Build PC Category created successfully', data: newCategory });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Build PC Category slug must be unique' });
            }
            res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
        }
    },

    getAllCategories: async (req, res) => {
        try {
            const activeOnly = req.query.active === 'true';
            const includeSubCategories = req.query.include_subs === 'true';

            const categories = await BuildPcCategory.findAll(activeOnly);

            if (includeSubCategories) {
                for (let i = 0; i < categories.length; i++) {
                    categories[i].sub_categories = await BuildPcSubCategory.findByCategoryId(categories[i].id, activeOnly);
                }
            }

            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await BuildPcCategory.findById(id);

            if (!category) {
                return res.status(404).json({ success: false, message: 'Build PC Category not found' });
            }

            res.status(200).json({ success: true, data: category });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching category', error: error.message });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existingCategory = await BuildPcCategory.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ success: false, message: 'Build PC Category not found' });
            }

            if (req.file) {
                updateData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            await BuildPcCategory.update(id, updateData);
            const updatedCategory = await BuildPcCategory.findById(id);

            res.status(200).json({ success: true, message: 'Build PC Category updated successfully', data: updatedCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating category', error: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const existingCategory = await BuildPcCategory.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ success: false, message: 'Build PC Category not found' });
            }

            await BuildPcCategory.delete(id);
            res.status(200).json({ success: true, message: 'Build PC Category deleted successfully' });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cannot delete category because it contains sub-categories. Please delete or move them first.' 
                });
            }
            res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
        }
    }
};

module.exports = buildPcCategoryController;
const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

const subCategoryController = {
    // 1. Create a new sub-category
    createSubCategory: async (req, res) => {
        try {
            // Verify parent category exists
            const parentExists = await Category.findById(req.body.category_id);
            if (!parentExists) {
                return res.status(404).json({ success: false, message: 'Parent category not found' });
            }

            const subCategoryData = { ...req.body };

            // Catch the uploaded file and generate the URL
            if (req.file) {
                subCategoryData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const insertId = await SubCategory.create(subCategoryData);
            const newSubCategory = await SubCategory.findById(insertId);

            res.status(201).json({ success: true, message: 'Sub-Category created successfully', data: newSubCategory });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Sub-Category slug must be unique' });
            }
            res.status(500).json({ success: false, message: 'Error creating sub-category', error: error.message });
        }
    },

    // 2. Get all sub-categories for a parent category
    getSubCategoriesByCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const activeOnly = req.query.active === 'true';

            const subCategories = await SubCategory.findByCategoryId(categoryId, activeOnly);
            res.status(200).json({ success: true, data: subCategories });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching sub-categories', error: error.message });
        }
    },

    // 3. Get single sub-category by ID
    getSubCategoryById: async (req, res) => {
        try {
            const { id } = req.params;
            const subCategory = await SubCategory.findById(id);

            if (!subCategory) {
                return res.status(404).json({ success: false, message: 'Sub-Category not found' });
            }

            res.status(200).json({ success: true, data: subCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching sub-category', error: error.message });
        }
    },

    // 4. Update an existing sub-category
    updateSubCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existingSub = await SubCategory.findById(id);
            if (!existingSub) {
                return res.status(404).json({ success: false, message: 'Sub-Category not found' });
            }

            // If updating parent category, verify the new parent exists
            if (updateData.category_id) {
                const parentExists = await Category.findById(updateData.category_id);
                if (!parentExists) {
                    return res.status(404).json({ success: false, message: 'New parent category not found' });
                }
            }

            // Catch the newly uploaded file (if any) and update the URL
            if (req.file) {
                updateData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            await SubCategory.update(id, updateData);
            const updatedSubCategory = await SubCategory.findById(id);

            res.status(200).json({ success: true, message: 'Sub-Category updated successfully', data: updatedSubCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating sub-category', error: error.message });
        }
    },

    // 5. Delete a sub-category
    deleteSubCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const existingSub = await SubCategory.findById(id);
            if (!existingSub) {
                return res.status(404).json({ success: false, message: 'Sub-Category not found' });
            }

            await SubCategory.delete(id);
            res.status(200).json({ success: true, message: 'Sub-Category deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error deleting sub-category', error: error.message });
        }
    }
};

module.exports = subCategoryController;
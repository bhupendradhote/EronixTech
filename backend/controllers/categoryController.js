const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

const categoryController = {
    // 1. Create a new category
    createCategory: async (req, res) => {
        try {
            // Copy everything from the body (which comes from FormData)
            const categoryData = { ...req.body };

            // Check if Multer processed a file. If yes, generate the URL.
            if (req.file) {
                // Example: http://localhost:5000/uploads/icon-16982348.jpg
                categoryData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const insertId = await Category.create(categoryData);
            const newCategory = await Category.findById(insertId);

            res.status(201).json({ success: true, message: 'Category created successfully', data: newCategory });
        } catch (error) {
            console.error(error);
            // Handle unique slug constraint error specifically
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Category slug must be unique' });
            }
            res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
        }
    },

    // 2. Get all categories (Optionally include their sub-categories)
    getAllCategories: async (req, res) => {
        try {
            // Check if frontend is requesting active-only categories
            const activeOnly = req.query.active === 'true';
            const includeSubCategories = req.query.include_subs === 'true';

            const categories = await Category.findAll(activeOnly);

            if (includeSubCategories) {
                // Fetch sub-categories for each category
                for (let i = 0; i < categories.length; i++) {
                    categories[i].sub_categories = await SubCategory.findByCategoryId(categories[i].id, activeOnly);
                }
            }

            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
        }
    },

    // 3. Get single category by ID
    getCategoryById: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }

            res.status(200).json({ success: true, data: category });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching category', error: error.message });
        }
    },

    // 4. Update an existing category
    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }

            // Check if a NEW file was uploaded during the update
            if (req.file) {
                updateData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            await Category.update(id, updateData);
            const updatedCategory = await Category.findById(id);

            res.status(200).json({ success: true, message: 'Category updated successfully', data: updatedCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating category', error: error.message });
        }
    },

    // 5. Delete a category
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }

            await Category.delete(id);
            res.status(200).json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            console.error(error);
            // Handle foreign key constraint error if sub-categories still exist
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

module.exports = categoryController;
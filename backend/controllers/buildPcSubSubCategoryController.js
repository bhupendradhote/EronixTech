const BuildPcSubSubCategory = require('../models/BuildPcSubSubCategory');

const buildPcSubSubCategoryController = {
    createSubSubCategory: async (req, res) => {
        try {
            const data = { ...req.body };

            if (!data.build_pc_subcategory_id) {
                return res.status(400).json({ success: false, message: 'Sub-category ID is required' });
            }

            if (req.file) {
                data.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const insertId = await BuildPcSubSubCategory.create(data);
            const newRecord = await BuildPcSubSubCategory.findById(insertId);

            res.status(201).json({ success: true, message: 'Build PC Sub-Sub-category created successfully', data: newRecord });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Slug must be unique' });
            }
            res.status(500).json({ success: false, message: 'Error creating sub-sub-category', error: error.message });
        }
    },

    getBySubCategory: async (req, res) => {
        try {
            const { subCategoryId } = req.params;
            const activeOnly = req.query.active === 'true';

            const records = await BuildPcSubSubCategory.findBySubCategoryId(subCategoryId, activeOnly);
            res.status(200).json({ success: true, data: records });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching data', error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const record = await BuildPcSubSubCategory.findById(id);

            if (!record) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }
            res.status(200).json({ success: true, data: record });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching record', error: error.message });
        }
    },

    updateSubSubCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existing = await BuildPcSubSubCategory.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }

            if (req.file) {
                updateData.icon_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            await BuildPcSubSubCategory.update(id, updateData);
            const updated = await BuildPcSubSubCategory.findById(id);

            res.status(200).json({ success: true, message: 'Updated successfully', data: updated });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating record', error: error.message });
        }
    },

    deleteSubSubCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const existing = await BuildPcSubSubCategory.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Record not found' });
            }

            await BuildPcSubSubCategory.delete(id);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error deleting record', error: error.message });
        }
    }
};

module.exports = buildPcSubSubCategoryController;
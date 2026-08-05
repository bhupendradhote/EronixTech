const Product = require('../models/Product');
const xlsx = require('xlsx'); 
const fs = require('fs');

// Helper function to safely parse DB JSON strings for the frontend response
const parseJSONFields = (product) => {
    const jsonFields = ['description', 'key_features', 'images', 'offers', 'variants', 'specifications'];
    jsonFields.forEach(field => {
        if (product[field] && typeof product[field] === 'string') {
            try {
                product[field] = JSON.parse(product[field]);
            } catch (e) {
                console.warn(`Could not parse JSON for field: ${field} in product ID: ${product.id}`);
            }
        }
    });
    return product;
};

const productController = {
    // 1. Create a new product
    createProduct: async (req, res) => {
        try {
            const productData = { ...req.body };

            let descriptions = [];
            if (productData.description) {
                try {
                    descriptions = typeof productData.description === 'string' ? JSON.parse(productData.description) : productData.description;
                } catch (e) {
                    descriptions = [];
                }
            }

            if (req.files && req.files.length > 0) {
                const mainImagesArray = [];

                req.files.forEach((file) => {
                    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

                    if (file.fieldname === 'product_video') {
                        productData.video_url = fileUrl;
                        productData.video_type = 'upload';
                    }
                    else if (file.fieldname.startsWith('gallery_images') || file.fieldname === 'images') {
                        mainImagesArray.push({
                            image_path: fileUrl,
                            sort_order: mainImagesArray.length + 1,
                            is_primary: mainImagesArray.length === 0
                        });
                    }
                    else if (file.fieldname.startsWith('description_images')) {
                        const match = file.fieldname.match(/\[(\d+)\]/);
                        if (match) {
                            const index = parseInt(match[1], 10);
                            if (descriptions[index]) {
                                descriptions[index].image = fileUrl;
                            }
                        }
                    }
                });

                if (mainImagesArray.length > 0) {
                    productData.images = JSON.stringify(mainImagesArray);
                }
            }

            productData.description = JSON.stringify(descriptions);

            const jsonFields = ['key_features', 'offers', 'variants', 'specifications'];
            jsonFields.forEach(field => {
                if (productData[field] && typeof productData[field] !== 'string') {
                    productData[field] = JSON.stringify(productData[field]);
                }
            });

            if (productData.video_type === 'youtube' && productData.video_url) {
                productData.video_url = String(productData.video_url).trim();
            }
            if (!productData.video_url && productData.video_type !== 'upload') {
                productData.video_type = 'none';
                productData.video_url = null;
            }

            if (productData.existing_images) delete productData.existing_images;
            if (productData.remove_video) delete productData.remove_video;

            const insertId = await Product.create(productData);
            let newProduct = await Product.findById(insertId);
            
            newProduct = parseJSONFields(newProduct);

            res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
        } catch (error) {
            console.error('Create Product Error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Duplicate entry detected (Slug, SKU, or Product Code must be unique).' });
            }
            res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
        }
    },

    // 2. Get all products
    getAllProducts: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                category_id: req.query.category_id,
                is_active: req.query.active === 'true'
            };

            const products = await Product.findAll(filters);
            const formattedProducts = products.map(product => parseJSONFields(product));

            res.status(200).json({ success: true, data: formattedProducts });
        } catch (error) {
            console.error('Get Products Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
        }
    },

    // 3. Get single product by ID
    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            let product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            product = parseJSONFields(product);
            Product.update(id, { view_count: product.view_count + 1 }).catch(err => console.log('Failed to update view count:', err));

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            console.error('Get Product By ID Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
        }
    },

    // 3.5 Get single product by Slug
    getProductBySlug: async (req, res) => {
        try {
            const { slug } = req.params;
            let product = await Product.findBySlug(slug);

            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            product = parseJSONFields(product);
            Product.update(product.id, { view_count: product.view_count + 1 }).catch(err => console.log('Failed to update view count:', err));

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            console.error('Get Product By Slug Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
        }
    },

    // 4. Update an existing product
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            let descriptions = [];
            if (updateData.description) {
                try {
                    descriptions = typeof updateData.description === 'string' ? JSON.parse(updateData.description) : updateData.description;
                } catch (e) {
                    descriptions = [];
                }
            }

            let finalMainImages = [];
            if (updateData.existing_images) {
                try {
                    finalMainImages = JSON.parse(updateData.existing_images);
                } catch(e) {
                    finalMainImages = [];
                }
                delete updateData.existing_images;
            }

            if (req.files && req.files.length > 0) {
                req.files.forEach((file) => {
                    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

                    if (file.fieldname === 'product_video') {
                        updateData.video_url = fileUrl;
                        updateData.video_type = 'upload';
                    }
                    else if (file.fieldname.startsWith('gallery_images') || file.fieldname === 'images') {
                        finalMainImages.push({
                            image_path: fileUrl,
                            sort_order: finalMainImages.length + 1,
                            is_primary: finalMainImages.length === 0
                        });
                    } else if (file.fieldname.startsWith('description_images')) {
                        const match = file.fieldname.match(/\[(\d+)\]/);
                        if (match) {
                            const index = parseInt(match[1], 10);
                            if (descriptions[index]) {
                                descriptions[index].image = fileUrl;
                            }
                        }
                    }
                });
            }

            updateData.images = JSON.stringify(finalMainImages);
            updateData.description = JSON.stringify(descriptions);

            if (String(updateData.remove_video || '') === '1') {
                updateData.video_url = null;
                updateData.video_type = 'none';
            } else if (updateData.video_type === 'youtube' && updateData.video_url) {
                updateData.video_url = String(updateData.video_url).trim();
            }
            delete updateData.remove_video;

            const jsonFields = ['key_features', 'offers', 'variants', 'specifications'];
            jsonFields.forEach(field => {
                if (updateData[field] && typeof updateData[field] !== 'string') {
                    updateData[field] = JSON.stringify(updateData[field]);
                }
            });

            await Product.update(id, updateData);
            let updatedProduct = await Product.findById(id);
            updatedProduct = parseJSONFields(updatedProduct);

            res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
        } catch (error) {
            console.error('Update Product Error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Duplicate entry detected (Slug, SKU, or Product Code must be unique).' });
            }
            res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
        }
    },

    // 5. Delete a product
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;

            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            await Product.delete(id);
            res.status(200).json({ success: true, message: 'Product archived/deleted successfully' });
        } catch (error) {
            console.error('Delete Product Error:', error);
            res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
        }
    },

    // 6. Import Products from Excel
    importProducts: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No Excel file uploaded.' });
        }

        try {
            const workbook = xlsx.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0]; 
            const sheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(sheet);

            let successCount = 0;
            let errors = [];

            for (let i = 0; i < rawData.length; i++) {
                const row = rawData[i];
                
                try {
                    const name = row['Product Name'] || row['Name'];
                    if (!name) {
                        errors.push(`Row ${i + 2}: Missing Product Name`);
                        continue;
                    }

                    // Auto-generate slug securely
                    let slug = row['Slug'];
                    if (!slug) {
                        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        const randomString = Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(-2); 
                        slug = `${baseSlug}-${randomString}`;
                    }

                    // CRITICAL FIX: Convert empty strings to true NULL to prevent Duplicate Entry errors on UNIQUE columns
                    const safeValue = (val) => val && String(val).trim() !== '' ? String(val).trim() : null;

                    const productData = {
                        name: name,
                        slug: slug,
                        
                        // Product type - default to 'normal' if not provided
                        product_type: row['Product Type'] || 'normal',
                        
                        // Safely handled unique fields
                        sku: safeValue(row['SKU']),
                        product_code: safeValue(row['Product Code']),
                        upc: safeValue(row['UPC']),
                        ean: safeValue(row['EAN']),
                        gtin: safeValue(row['GTIN']),
                        mpn: safeValue(row['MPN']),
                        model_number: safeValue(row['Model Number']),
                        
                        // Relationships
                        brand_id: parseInt(row['Brand ID']) || null,
                        category_id: parseInt(row['Category ID']) || null,
                        sub_category_id: parseInt(row['Sub Category ID']) || null,
                        child_category_id: parseInt(row['Child Category ID']) || null,
                        // Build PC fields
                        build_pc_category_id: parseInt(row['Build PC Category ID']) || null,
                        build_pc_subcategory_id: parseInt(row['Build PC Subcategory ID']) || null,
                        build_pc_sub_subcategory_id: parseInt(row['Build PC Sub‑Subcategory ID']) || null,

                        short_description: row['Short Description'] || '',
                        condition: row['Condition'] || 'New',
                        color: row['Color'] || null,
                        
                        // Forced Status
                        status: 'inactive', 
                        
                        // Financials
                        cost_price: parseFloat(row['Cost Price']) || null,
                        mrp: parseFloat(row['MRP']) || 0,
                        selling_price: parseFloat(row['Selling Price']) || 0,
                        offer_price: parseFloat(row['Offer Price']) || null,
                        tax_percentage: parseFloat(row['Tax Percentage']) || null,
                        tax_type: 'exclusive', 
                        
                        // Inventory & Dimensions
                        stock_quantity: parseInt(row['Stock Quantity']) || 0,
                        minimum_stock_alert: parseInt(row['Minimum Stock Alert']) || 5,
                        stock_status: (parseInt(row['Stock Quantity']) > 0) ? 'in_stock' : 'out_of_stock',
                        weight: parseFloat(row['Weight']) || null,
                        height: parseFloat(row['Height']) || null,
                        width: parseFloat(row['Width']) || null,
                        depth: parseFloat(row['Depth']) || null,
                        
                        // JSON Fallbacks
                        description: JSON.stringify([]),
                        images: JSON.stringify([]),
                        key_features: JSON.stringify([]),
                        specifications: JSON.stringify([]),
                        offers: JSON.stringify([]),
                        variants: JSON.stringify([])
                    };

                    await Product.create(productData);
                    successCount++;
                } catch (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        errors.push(`Row ${i + 2}: Duplicate Entry (SKU, UPC, EAN, or Slug already exists).`);
                    } else {
                        errors.push(`Row ${i + 2}: ${err.message}`);
                    }
                }
            }

            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Failed to delete temp excel file:", err);
            });

            res.status(200).json({ 
                success: true, 
                message: `Import complete. ${successCount} added. ${errors.length} failed.`,
                errors 
            });

        } catch (error) {
            console.error('Import Error:', error);
            res.status(500).json({ success: false, message: 'Failed to parse Excel file', error: error.message });
        }
    }
}; 

module.exports = productController;
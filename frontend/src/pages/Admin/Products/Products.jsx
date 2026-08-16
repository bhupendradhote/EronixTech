import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiStar, FiUploadCloud, FiDownload } from 'react-icons/fi';
import productService from '../../../services/productService';
import brandService from '../../../services/brandService';
import categoryService from '../../../services/categoryService';
import ProductForm from './ProductForm';
import { getImageUrl } from '../../../utils/imageUrl';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All'); // NEW
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getAllProducts();
      // Extract the product array from the paginated response object
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Fallback to an empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [brandsData, categoriesData] = await Promise.all([
        brandService.getAllBrands(),
        categoryService.getAllCategories()
      ]);
      setBrands(brandsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Error fetching brands or categories:", error);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, brandFilter, typeFilter]);

  const getBrandName = (product) => {
    if (product.brand?.name) return product.brand.name; 
    if (product.brand_name) return product.brand_name;
    if (product.brand_id) {
      const foundBrand = brands.find(b => b.id === product.brand_id);
      return foundBrand ? foundBrand.name : `ID: ${product.brand_id}`;
    }
    return '—';
  };

  const getCategoryName = (product) => {
    if (product.category?.name) return product.category.name; 
    if (product.category_name) return product.category_name;
    if (product.category_id) {
      const foundCategory = categories.find(c => c.id === product.category_id);
      return foundCategory ? foundCategory.name : `ID: ${product.category_id}`;
    }
    return '—';
  };

  const getStockStatusBadgeClass = (stockStatus) => {
    switch (stockStatus) {
      case 'in_stock': return 'stock-badge stock-in';
      case 'out_of_stock': return 'stock-badge stock-out';
      case 'pre_order': return 'stock-badge stock-preorder';
      default: return 'stock-badge';
    }
  };

  const getStockStatusLabel = (stockStatus) => {
    switch (stockStatus) {
      case 'in_stock': return 'In Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'pre_order': return 'Pre-Order';
      default: return stockStatus || '—';
    }
  };

  // Helper for product type display
  const getProductTypeLabel = (type) => {
    if (!type) return 'Normal';
    switch (type) {
      case 'pc_build': return 'PC Build';
      case 'pc_pre_build': return 'PC Pre‑Build';
      default: return 'Normal';
    }
  };

  const getProductTypeBadgeClass = (type) => {
    if (!type || type === 'normal') return 'type-badge type-normal';
    if (type === 'pc_build') return 'type-badge type-pc-build';
    if (type === 'pc_pre_build') return 'type-badge type-pc-pre-build';
    return 'type-badge type-normal';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (product.product_code && product.product_code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || product.status === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'All' || product.category_id?.toString() === categoryFilter;
    const matchesBrand = brandFilter === 'All' || product.brand_id?.toString() === brandFilter;
    const matchesType = typeFilter === 'All' || product.product_type === typeFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesBrand && matchesType;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to archive/delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      await productService.updateProduct(product.id, formData);
      fetchProducts();
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  // ==========================================
  // EXCEL IMPORT & EXPORT LOGIC (unchanged)
  // ==========================================

  const handleDownloadTemplate = () => {
    const headers = [
      'Product Name', 
      'SKU', 
      'Product Code', 
      'UPC',
      'EAN',
      'GTIN',
      'MPN',
      'Model Number',
      'Brand ID',
      'Category ID',
      'Sub Category ID',
      'Child Category ID',
      'Short Description', 
      'Cost Price',
      'MRP', 
      'Selling Price', 
      'Offer Price',
      'Tax Percentage',
      'Stock Quantity', 
      'Minimum Stock Alert',
      'Weight',
      'Height',
      'Width',
      'Depth',
      'Color',
      'Condition'
    ];
    
    const sampleRow = [
      'Sample Smartphone',
      'MOB-123',
      'PROD-001',
      '',
      '',
      '',
      '',
      'SM-G998B',
      '1',
      '2',
      '',
      '',
      'A great 6.5-inch smartphone',
      '10000',
      '15000',
      '12999',
      '',
      '18',
      '50',
      '5',
      '0.2',
      '15.5',
      '7.5',
      '0.8',
      'Midnight Blue',
      'New'
    ];
    
    const csvContent = [
      headers.join(','),
      sampleRow.map(item => `"${item}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Product_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert("Please upload a valid Excel or CSV file.");
      e.target.value = null;
      return;
    }

    setIsImporting(true);
    try {
      const result = await productService.importProducts(file);
      
      let msg = result.message;
      if (result.errors && result.errors.length > 0) {
        msg += `\n\nErrors:\n${result.errors.slice(0, 5).join('\n')}`;
        if (result.errors.length > 5) msg += `\n...and ${result.errors.length - 5} more.`;
      }
      alert(msg);
      
      fetchProducts();
    } catch (error) {
      console.error("Import failed:", error);
      alert(error.response?.data?.message || "Failed to import products.");
    } finally {
      setIsImporting(false);
      e.target.value = null; 
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="header-title">
          <h1>Products Management</h1>
          <p>Manage your product inventory, prices, and availability</p>
        </div>
        
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          
          <button 
            className="btn-secondary" 
            onClick={handleDownloadTemplate}
            style={{ padding: '10px 16px', borderRadius: '4px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', cursor: 'pointer' }}
          >
            <FiDownload size={16} /> 
            Download Template
          </button>

          <input 
            type="file" 
            id="excel-upload" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          
          <label 
            htmlFor="excel-upload" 
            className="btn-secondary" 
            style={{ cursor: isImporting ? 'wait' : 'pointer', padding: '10px 16px', borderRadius: '4px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '8px', opacity: isImporting ? 0.7 : 1, background: '#fff' }}
          >
            <FiUploadCloud size={16} /> 
            {isImporting ? 'Importing...' : 'Import Products'}
          </label>

          <button className="btn-primary" onClick={handleAddNew}>
            <FiPlus size={16} /> Add New Product
          </button>
        </div>
      </div>

      {/* ===== NEW: Product Type Tabs ===== */}
      <div className="product-type-tabs" style={{ display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
        <button
          className={`type-tab ${typeFilter === 'All' ? 'active' : ''}`}
          onClick={() => setTypeFilter('All')}
          style={{
            padding: '8px 18px',
            border: 'none',
            background: typeFilter === 'All' ? '#2a7de1' : 'transparent',
            color: typeFilter === 'All' ? '#fff' : '#555',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: '0.2s'
          }}
        >
          All
        </button>
        <button
          className={`type-tab ${typeFilter === 'normal' ? 'active' : ''}`}
          onClick={() => setTypeFilter('normal')}
          style={{
            padding: '8px 18px',
            border: 'none',
            background: typeFilter === 'normal' ? '#2a7de1' : 'transparent',
            color: typeFilter === 'normal' ? '#fff' : '#555',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: '0.2s'
          }}
        >
          Normal
        </button>
        <button
          className={`type-tab ${typeFilter === 'pc_build' ? 'active' : ''}`}
          onClick={() => setTypeFilter('pc_build')}
          style={{
            padding: '8px 18px',
            border: 'none',
            background: typeFilter === 'pc_build' ? '#2a7de1' : 'transparent',
            color: typeFilter === 'pc_build' ? '#fff' : '#555',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: '0.2s'
          }}
        >
          PC Build
        </button>
        <button
          className={`type-tab ${typeFilter === 'pc_pre_build' ? 'active' : ''}`}
          onClick={() => setTypeFilter('pc_pre_build')}
          style={{
            padding: '8px 18px',
            border: 'none',
            background: typeFilter === 'pc_pre_build' ? '#2a7de1' : 'transparent',
            color: typeFilter === 'pc_pre_build' ? '#fff' : '#555',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: '0.2s'
          }}
        >
          PC Pre‑Build
        </button>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ flex: '1', minWidth: '250px' }}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, SKU or product code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-wrapper" style={{ display: 'flex', gap: '10px' }}>
          <FiFilter className="filter-icon" />
          
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="filter-select">
            <option value="All">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="products-table-container">
        {isLoading ? (
          <div className="loading-state">Loading products...</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Product Type</th>  {/* NEW COLUMN */}
                <th>Selling Price</th>
                <th>MRP</th>
                {/* <th>Stock (Qty)</th> */}
                {/* <th>Stock Status</th> */}
                {/* <th>Featured</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(product => {
                  
                  let parsedImages = [];
                  if (product.images) {
                    try {
                      parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                    } catch (e) {
                      parsedImages = [];
                    }
                  }
                  
                  const firstImage = parsedImages.length > 0 ? parsedImages[0] : null;
                  const firstImagePath = typeof firstImage === 'string'
                    ? firstImage
                    : firstImage?.image_path || firstImage?.path || firstImage?.url;

                  const primaryImage = firstImagePath
                    ? getImageUrl(firstImagePath)
                    : 'https://placehold.co/60x60?text=No+Image';

                  const stockQuantity = product.stock_quantity ?? 0;
                  const isLowStock = stockQuantity <= (product.minimum_stock_alert ?? 5);
                  
                  return (
                    <tr key={product.id}>
                      <td className="product-cell">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="product-thumb"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = 'https://placehold.co/60x60?text=No+Image';
                          }}
                        />
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                          <span className="product-id"> {product.sku}</span>
                        </div>
                      </td>
                      <td className="brand-cell">{getBrandName(product)}</td>
                      <td className="category-cell">{getCategoryName(product)}</td>
                      <td>
                        <span className={getProductTypeBadgeClass(product.product_type)}>
                          {getProductTypeLabel(product.product_type)}
                        </span>
                      </td>
                      <td className="price-cell">${parseFloat(product.selling_price || 0).toLocaleString()}</td>
                      <td className="mrp-cell">
                        {product.mrp ? (
                          <span className="mrp-value">${parseFloat(product.mrp).toLocaleString()}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      {/* <td>
                        <div className="stock-info">
                          <span className={`stock-badge ${isLowStock ? 'stock-low' : 'stock-in'}`}>
                            {stockQuantity > 0 ? `${stockQuantity} units` : 'Out of Stock'}
                          </span>
                        </div>
                      </td> */}
                      {/* <td>
                        <span className={getStockStatusBadgeClass(product.stock_status)}>
                          {getStockStatusLabel(product.stock_status)}
                        </span>
                      </td> */}
                      {/* <td className="featured-cell">
                        {product.featured ? (
                          <span className="featured-badge">
                            <FiStar size={14} /> Featured
                          </span>
                        ) : (
                          <span className="not-featured">—</span>
                        )}
                      </td> */}
                      <td>
                        <button className={`status-toggle status-${product.status}`} onClick={() => handleToggleStatus(product)}>
                          {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : ''}
                        </button>
                      </td>
                      <td className="actions">
                        <button className="action-btn edit-btn" onClick={() => handleEdit(product)} title="Edit"><FiEdit2 size={16} /></button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(product.id)} title="Delete"><FiTrash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12" className="no-data">No products found for these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="page-btn">
            <FiChevronLeft size={16} /> Prev
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="page-btn">
            Next <FiChevronRight size={16} />
          </button>
        </div>
      )}

      <ProductForm 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        product={editingProduct}
        onSaveSuccess={fetchProducts}
      />
    </div>
  );
};

export default Products;
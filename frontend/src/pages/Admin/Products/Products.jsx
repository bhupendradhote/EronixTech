import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiStar, FiUploadCloud, FiDownload } from 'react-icons/fi';
import productService from '../../../services/productService';
import brandService from '../../../services/brandService';
import categoryService from '../../../services/categoryService';
import ProductForm from './ProductForm';
import { getImageUrl } from '../../../utils/imageUrl';
import './Products.css';

// ---------- helpers ----------

const extractArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.products)) return res.products;
  if (Array.isArray(res.items)) return res.items;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.products)) return res.data.products;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (res.result && Array.isArray(res.result)) return res.result;
  return [];
};

const extractTotal = (res) => {
  if (!res) return null;
  const t =
    res.total ??
    res.data?.total ??
    res.pagination?.total ??
    res.data?.pagination?.total ??
    null;
  return typeof t === 'number' ? t : null;
};

// ---------- module-level cache (survives component remounts) ----------

let productsCache = null;
let productsCacheTime = 0;
const PRODUCTS_CACHE_TTL = 60 * 1000; // 1 minute

let brandsCache = null;
let categoriesCache = null;

// ---------- component ----------

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
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ---------- data fetching ----------

  const fetchProducts = useCallback(async (force = false) => {
    const now = Date.now();

    // Use cache if fresh and not forcing refresh
    if (!force && productsCache && now - productsCacheTime < PRODUCTS_CACHE_TTL) {
      setProducts(productsCache);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const limit = 100;

      // First request: gets page 1 + total
      const firstRes = await productService.getAllProducts({ limit, page: 1 });
      const firstBatch = extractArray(firstRes);
      const total = extractTotal(firstRes);

      let all = [...firstBatch];

      if (total && firstBatch.length === limit) {
        // Parallel fetch all remaining pages
        const totalPages = Math.ceil(total / limit);
        const requests = [];
        for (let p = 2; p <= totalPages; p += 1) {
          requests.push(productService.getAllProducts({ limit, page: p }));
        }

        const results = await Promise.all(requests);
        results.forEach((res) => {
          all = all.concat(extractArray(res));
        });
      } else if (firstBatch.length === limit) {
        // Fallback: sequential paging if server doesn't report total
        let page = 2;
        let safety = 0;
        while (safety < 100) {
          const res = await productService.getAllProducts({ limit, page });
          const batch = extractArray(res);
          if (!batch.length) break;
          all = all.concat(batch);
          if (batch.length < limit) break;
          page += 1;
          safety += 1;
        }
      }

      console.log(`Loaded ${all.length} products (reported total: ${total})`);

      productsCache = all;
      productsCacheTime = Date.now();
      setProducts(all);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDependencies = useCallback(async () => {
    // Cache brands & categories for the session
    if (brandsCache && categoriesCache) {
      setBrands(brandsCache);
      setCategories(categoriesCache);
      return;
    }

    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        brandService.getAllBrands(),
        categoryService.getAllCategories(),
      ]);

      const brandsList = extractArray(brandsRes);
      const categoriesList = extractArray(categoriesRes);

      brandsCache = brandsList;
      categoriesCache = categoriesList;

      setBrands(brandsList);
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching brands or categories:', error);
      setBrands([]);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
    fetchProducts();
  }, [fetchDependencies, fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, brandFilter, typeFilter]);

  // ---------- lookup helpers ----------

  const brandMap = useMemo(() => {
    const map = new Map();
    brands.forEach((b) => map.set(String(b.id), b.name));
    return map;
  }, [brands]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(String(c.id), c.name));
    return map;
  }, [categories]);

  const getBrandName = useCallback((product) => {
    if (product.brand?.name) return product.brand.name;
    if (product.brand_name) return product.brand_name;
    if (product.brand_id) {
      return brandMap.get(String(product.brand_id)) || `ID: ${product.brand_id}`;
    }
    return '—';
  }, [brandMap]);

  const getCategoryName = useCallback((product) => {
    if (product.category?.name) return product.category.name;
    if (product.category_name) return product.category_name;
    if (product.category_id) {
      return categoryMap.get(String(product.category_id)) || `ID: ${product.category_id}`;
    }
    return '—';
  }, [categoryMap]);

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

  // ---------- filtering (memoized for performance) ----------

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        (product.name || '').toLowerCase().includes(term) ||
        (product.sku || '').toLowerCase().includes(term) ||
        (product.product_code || '').toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'All' ||
        String(product.status || '').toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === 'All' ||
        String(product.category_id) === String(categoryFilter);

      const matchesBrand =
        brandFilter === 'All' ||
        String(product.brand_id) === String(brandFilter);

      const matchesType =
        typeFilter === 'All' ||
        product.product_type === typeFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesBrand && matchesType;
    });
  }, [products, searchTerm, statusFilter, categoryFilter, brandFilter, typeFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProducts, currentPage, itemsPerPage]);

  // ---------- actions ----------

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
        // Invalidate cache and refetch
        productsCache = null;
        productsCacheTime = 0;
        fetchProducts(true);
      } catch (error) {
        console.error('Failed to delete', error);
      }
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      await productService.updateProduct(product.id, formData);
      productsCache = null;
      productsCacheTime = 0;
      fetchProducts(true);
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleSaveSuccess = () => {
    productsCache = null;
    productsCacheTime = 0;
    fetchProducts(true);
  };

  // ---------- import / export ----------

  const handleDownloadTemplate = () => {
    const headers = [
      'Product Name', 'SKU', 'Product Code', 'UPC', 'EAN', 'GTIN', 'MPN',
      'Model Number', 'Brand ID', 'Category ID', 'Sub Category ID',
      'Child Category ID', 'Short Description', 'Cost Price', 'MRP',
      'Selling Price', 'Offer Price', 'Tax Percentage', 'Stock Quantity',
      'Minimum Stock Alert', 'Weight', 'Height', 'Width', 'Depth', 'Color',
      'Condition',
    ];

    const sampleRow = [
      'Sample Smartphone', 'MOB-123', 'PROD-001', '', '', '', '', 'SM-G998B',
      '1', '2', '', '', 'A great 6.5-inch smartphone', '10000', '15000',
      '12999', '', '18', '50', '5', '0.2', '15.5', '7.5', '0.8',
      'Midnight Blue', 'New',
    ];

    const csvContent = [
      headers.join(','),
      sampleRow.map((item) => `"${item}"`).join(','),
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
      alert('Please upload a valid Excel or CSV file.');
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

      productsCache = null;
      productsCacheTime = 0;
      fetchProducts(true);
    } catch (error) {
      console.error('Import failed:', error);
      alert(error.response?.data?.message || 'Failed to import products.');
    } finally {
      setIsImporting(false);
      e.target.value = null;
    }
  };

  // ---------- render ----------

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

      {/* Product Type Tabs */}
      <div className="product-type-tabs" style={{ display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
        {[
          { key: 'All', label: 'All' },
          { key: 'normal', label: 'Normal' },
          { key: 'pc_build', label: 'PC Build' },
          { key: 'pc_pre_build', label: 'PC Pre‑Build' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`type-tab ${typeFilter === key ? 'active' : ''}`}
            onClick={() => setTypeFilter(key)}
            style={{
              padding: '8px 18px',
              border: 'none',
              background: typeFilter === key ? '#2a7de1' : 'transparent',
              color: typeFilter === key ? '#fff' : '#555',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: '0.2s',
            }}
          >
            {label}
          </button>
        ))}
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
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="filter-select">
            <option value="All">All Brands</option>
            {brands.map((brand) => (
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
                <th>Product Type</th>
                <th>Selling Price</th>
                <th>MRP</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
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

                  return (
                    <tr key={product.id}>
                      <td className="product-cell">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="product-thumb"
                          loading="lazy"
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
                  <td colSpan="8" className="no-data">No products found for these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="page-btn">
            <FiChevronLeft size={16} /> Prev
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="page-btn">
            Next <FiChevronRight size={16} />
          </button>
        </div>
      )}

      <ProductForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={editingProduct}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default Products;
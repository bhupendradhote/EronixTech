import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiX, FiFilter } from 'react-icons/fi';
import buildPcCategoryService from '../../../services/buildPcCategoryService';
import buildPcSubCategoryService from '../../../services/buildPcSubCategoryService';
import buildPcSubSubCategoryService from '../../../services/buildPcSubSubCategoryService';
import buildPcItemService from '../../../services/buildPcItemService';
import './Masters.css';

const BuildPcItemManagement = () => {
  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [items, setItems] = useState([]);

  // Selections for cascading dropdowns
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [selectedSubSubCategoryId, setSelectedSubSubCategoryId] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const initialFormState = { build_pc_sub_subcategory_id: '', name: '', slug: '', description: '', price: '', discount_price: '', is_active: true, display_order: 0 };
  const [formData, setFormData] = useState(initialFormState);

  // 1. Fetch Main Categories on Mount
  useEffect(() => {
    fetchParentCategories();
  }, []);

  // 2. Fetch Sub Categories when Main Category changes
  useEffect(() => {
    if (selectedParentId) {
      setSubCategories([]);
      setSelectedSubCategoryId('');
      setSubSubCategories([]);
      setSelectedSubSubCategoryId('');
      setItems([]);
      fetchSubCategories(selectedParentId);
    }
  }, [selectedParentId]);

  // 3. Fetch Sub-Sub Categories when Sub Category changes
  useEffect(() => {
    if (selectedSubCategoryId) {
      setSubSubCategories([]);
      setSelectedSubSubCategoryId('');
      setItems([]);
      fetchSubSubCategories(selectedSubCategoryId);
    }
  }, [selectedSubCategoryId]);

  // 4. Fetch Items when Sub-Sub Category changes
  useEffect(() => {
    if (selectedSubSubCategoryId) {
      fetchItems(selectedSubSubCategoryId);
      if (!editingItem) {
        setFormData(prev => ({ ...prev, build_pc_sub_subcategory_id: selectedSubSubCategoryId }));
      }
    } else {
      setItems([]);
    }
  }, [selectedSubSubCategoryId]);

  const fetchParentCategories = async () => {
    try {
      const data = await buildPcCategoryService.getAllCategories();
      setParentCategories(data);
      if (data.length > 0) setSelectedParentId(data[0].id.toString());
    } catch (error) {
      console.error('Failed to fetch parent categories', error);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const data = await buildPcSubCategoryService.getSubCategoriesByCategory(categoryId);
      setSubCategories(data);
      if (data.length > 0) setSelectedSubCategoryId(data[0].id.toString());
    } catch (error) {
      console.error('Failed to fetch sub-categories', error);
    }
  };

  const fetchSubSubCategories = async (subCategoryId) => {
    try {
      const data = await buildPcSubSubCategoryService.getSubSubCategoriesBySubCategory(subCategoryId);
      setSubSubCategories(data);
      if (data.length > 0) setSelectedSubSubCategoryId(data[0].id.toString());
    } catch (error) {
      console.error('Failed to fetch sub-sub-categories', error);
    }
  };

  const fetchItems = async (subSubCategoryId) => {
    try {
      const data = await buildPcItemService.getItemsBySubSubCategory(subSubCategoryId);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items', error);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'name' && !editingItem) {
        updated.slug = newValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleEdit = (item) => {
    setImageFile(null);
    setEditingItem(item);
    setFormData({
      build_pc_sub_subcategory_id: item.build_pc_sub_subcategory_id,
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      price: item.price || '',
      discount_price: item.discount_price || '',
      is_active: item.is_active,
      display_order: item.display_order
    });
  };

  const clearForm = () => {
    setImageFile(null);
    setEditingItem(null);
    setFormData({ 
      ...initialFormState, 
      build_pc_sub_subcategory_id: selectedSubSubCategoryId, 
      display_order: items.length + 1 
    });
  };

  const saveItem = async () => {
    if (!formData.name || !formData.slug || !formData.build_pc_sub_subcategory_id || !formData.price) {
      return alert('Parent Category, Name, Slug, and Base Price are required.');
    }
    
    const dataToSend = new FormData();
    dataToSend.append('build_pc_sub_subcategory_id', formData.build_pc_sub_subcategory_id);
    dataToSend.append('name', formData.name);
    dataToSend.append('slug', formData.slug);
    dataToSend.append('description', formData.description || '');
    dataToSend.append('price', formData.price);
    
    // Append discount_price only if provided, else empty string allows backend to nullify it
    dataToSend.append('discount_price', formData.discount_price || '');
    
    dataToSend.append('display_order', formData.display_order);
    dataToSend.append('is_active', formData.is_active ? 1 : 0);

    if (imageFile) dataToSend.append('icon', imageFile);

    try {
      if (editingItem) {
        await buildPcItemService.update(editingItem.id, dataToSend);
      } else {
        await buildPcItemService.create(dataToSend);
      }
      
      if (selectedSubSubCategoryId === formData.build_pc_sub_subcategory_id.toString()) {
        fetchItems(selectedSubSubCategoryId);
      } else {
        setSelectedSubSubCategoryId(formData.build_pc_sub_subcategory_id.toString());
      }
      
      clearForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving item');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await buildPcItemService.delete(id);
        fetchItems(selectedSubSubCategoryId);
        if (editingItem?.id === id) clearForm();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting item');
      }
    }
  };

  const toggleActive = async (item) => {
    try {
      const dataToSend = new FormData();
      dataToSend.append('is_active', item.is_active ? 0 : 1);
      await buildPcItemService.update(item.id, dataToSend);
      fetchItems(selectedSubSubCategoryId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="master-page">
      <div className="master-header">
        <div className="header-title">
          <h1>Build PC Items</h1>
          <p>Manage actual physical components with pricing (e.g., Processors - Intel - Core i9 - i9 14900k)</p>
        </div>
      </div>

      <div className="master-content-layout">
        
        {/* LEFT SIDE: TABLE & FILTERS */}
        <div className="master-table-section">
          
          <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="search-wrapper" style={{ flex: '1 1 150px' }}>
              <FiFilter className="search-icon"/>
              <select 
                value={selectedParentId} 
                onChange={(e) => setSelectedParentId(e.target.value)} 
                className="search-input"
                style={{ appearance: 'auto', paddingLeft: '35px' }}
              >
                <option value="" disabled>1. Category...</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="search-wrapper" style={{ flex: '1 1 150px' }}>
              <FiFilter className="search-icon"/>
              <select 
                value={selectedSubCategoryId} 
                onChange={(e) => setSelectedSubCategoryId(e.target.value)} 
                className="search-input"
                style={{ appearance: 'auto', paddingLeft: '35px' }}
                disabled={!selectedParentId || subCategories.length === 0}
              >
                <option value="" disabled>
                  {subCategories.length === 0 ? "No Sub-Categories" : "2. Sub-Category..."}
                </option>
                {subCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div className="search-wrapper" style={{ flex: '1 1 150px' }}>
              <FiFilter className="search-icon"/>
              <select 
                value={selectedSubSubCategoryId} 
                onChange={(e) => setSelectedSubSubCategoryId(e.target.value)} 
                className="search-input"
                style={{ appearance: 'auto', paddingLeft: '35px' }}
                disabled={!selectedSubCategoryId || subSubCategories.length === 0}
              >
                <option value="" disabled>
                  {subSubCategories.length === 0 ? "No Sub-Sub-Cats" : "3. Sub-Sub-Cat..."}
                </option>
                {subSubCategories.map(subSub => (
                  <option key={subSub.id} value={subSub.id}>{subSub.name}</option>
                ))}
              </select>
            </div>
            
            <div className="search-wrapper" style={{ flex: '1 1 150px' }}>
              <FiSearch className="search-icon"/>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={!selectedSubSubCategoryId}
              />
            </div>
          </div>

          <table className="master-table">
            <thead>
              <tr>
                <th className="image-cell">Image</th>
                <th>Item Details</th>
                <th>Pricing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!selectedSubSubCategoryId ? (
                 <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Please select all categories to view items</td></tr>
              ) : filteredItems.length > 0 ? filteredItems.map(item => (
                <tr key={item.id}>
                  <td className="image-cell">
                    {item.icon_url ? 
                      <img src={item.icon_url} alt={item.name} className="table-image" /> : 
                      <div className="image-placeholder"><FiImage size={20} /></div>
                    }
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#333' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>/{item.slug}</div>
                  </td>
                  <td>
                    {item.discount_price && item.discount_price > 0 ? (
                      <div>
                        <div style={{ fontWeight: 600, color: '#28a745' }}>₹{parseFloat(item.discount_price).toFixed(2)}</div>
                        <div style={{ fontSize: '12px', color: '#888', textDecoration: 'line-through' }}>₹{parseFloat(item.price).toFixed(2)}</div>
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600, color: '#2b5a9e' }}>₹{parseFloat(item.price).toFixed(2)}</div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${item.is_active ? 'status-active' : 'status-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit"><FiEdit2 size={14} /></button>
                      <button className="action-btn delete-btn" onClick={() => deleteItem(item.id)} title="Delete"><FiTrash2 size={14} /></button>
                      <button className={`action-btn toggle-btn ${item.is_active ? 'active' : 'inactive'}`} onClick={() => toggleActive(item)} title="Toggle Status">
                        {item.is_active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No items found in this section</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="master-form-section">
          <div className="form-header">
            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            {editingItem && (
              <button className="btn-clear" onClick={clearForm} title="Cancel Edit"><FiX size={18} /></button>
            )}
          </div>
          
          <div className="form-body">
            
            <div className="form-group">
              <label>Parent Sub-Sub-Category *</label>
              <select 
                name="build_pc_sub_subcategory_id" 
                value={formData.build_pc_sub_subcategory_id} 
                onChange={handleInputChange} 
                className="form-input"
                style={{ appearance: 'auto' }}
                disabled={subSubCategories.length === 0}
              >
                <option value="" disabled>-- Select Sub-Sub-Category --</option>
                {subSubCategories.map(subSub => (
                  <option key={subSub.id} value={subSub.id}>{subSub.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="e.g., Intel Core i9-14900K" />
            </div>
            
            <div className="form-group">
              <label>URL Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="form-input" />
            </div>

            {/* Price Inputs placed side-by-side */}
            <div className="form-row">
              <div className="form-group">
                <label>Base Price (₹) *</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="form-input" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Discount Price (₹)</label>
                <input type="number" step="0.01" name="discount_price" value={formData.discount_price} onChange={handleInputChange} className="form-input" placeholder="Leave empty if none" />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleInputChange} className="form-input" rows="3" />
            </div>
            
            <div className="form-group">
              <label>Item Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                className="form-input" 
                style={{ padding: '6px' }}
              />
              {editingItem && editingItem.icon_url && !imageFile && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={editingItem.icon_url} alt="Current Image" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }} />
                  <span style={{ fontSize: '12px', color: '#666' }}>Current Image</span>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Display Order</label>
                <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="form-input" />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} /> 
                  Active
                </label>
              </div>
            </div>

            <div className="form-actions">
              {editingItem && <button className="btn-secondary" onClick={clearForm}>Cancel</button>}
              <button className="btn-primary" onClick={saveItem} disabled={!selectedSubSubCategoryId}>
                {editingItem ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildPcItemManagement;
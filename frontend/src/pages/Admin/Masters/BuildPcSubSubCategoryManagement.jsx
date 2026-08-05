import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiX, FiFilter } from 'react-icons/fi';
import buildPcCategoryService from '../../../services/buildPcCategoryService';
import buildPcSubCategoryService from '../../../services/buildPcSubCategoryService';
import buildPcSubSubCategoryService from '../../../services/buildPcSubSubCategoryService';
import './Masters.css';

const BuildPcSubSubCategoryManagement = () => {
  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  // Selections for cascading dropdowns
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSubSubCategory, setEditingSubSubCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const initialFormState = { build_pc_subcategory_id: '', name: '', slug: '', description: '', is_active: true, display_order: 0 };
  const [formData, setFormData] = useState(initialFormState);

  // 1. Fetch Main Categories on Mount
  useEffect(() => {
    fetchParentCategories();
  }, []);

  // 2. Fetch Sub Categories when Main Category changes
  useEffect(() => {
    if (selectedParentId) {
      setSubSubCategories([]); // Clear bottom table while loading new subcategories
      fetchSubCategories(selectedParentId);
    }
  }, [selectedParentId]);

  // 3. Fetch Sub-Sub Categories when Sub Category changes
  useEffect(() => {
    if (selectedSubCategoryId) {
      fetchSubSubCategories(selectedSubCategoryId);
      if (!editingSubSubCategory) {
        setFormData(prev => ({ ...prev, build_pc_subcategory_id: selectedSubCategoryId }));
      }
    } else {
      setSubSubCategories([]); // Clear table if no sub-category is selected
    }
  }, [selectedSubCategoryId]);

  const fetchParentCategories = async () => {
    try {
      const data = await buildPcCategoryService.getAllCategories();
      setParentCategories(data);
      // Auto-select the first Parent Category
      if (data.length > 0) {
        setSelectedParentId(data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch parent categories', error);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const data = await buildPcSubCategoryService.getSubCategoriesByCategory(categoryId);
      setSubCategories(data);
      // Auto-select the first Sub Category
      if (data.length > 0) {
        setSelectedSubCategoryId(data[0].id.toString());
      } else {
        setSelectedSubCategoryId(''); // Reset if the parent has no sub-categories
      }
    } catch (error) {
      console.error('Failed to fetch sub-categories', error);
    }
  };

  const fetchSubSubCategories = async (subCategoryId) => {
    try {
      const data = await buildPcSubSubCategoryService.getSubSubCategoriesBySubCategory(subCategoryId);
      setSubSubCategories(data);
    } catch (error) {
      console.error('Failed to fetch sub-sub-categories', error);
    }
  };

  const filteredSubSubCategories = subSubCategories.filter(sc =>
    sc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sc.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'name' && !editingSubSubCategory) {
        updated.slug = newValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleEdit = (subSubCategory) => {
    setImageFile(null);
    setEditingSubSubCategory(subSubCategory);
    setFormData({
      build_pc_subcategory_id: subSubCategory.build_pc_subcategory_id,
      name: subSubCategory.name,
      slug: subSubCategory.slug,
      description: subSubCategory.description || '',
      is_active: subSubCategory.is_active,
      display_order: subSubCategory.display_order
    });
  };

  const clearForm = () => {
    setImageFile(null);
    setEditingSubSubCategory(null);
    setFormData({ 
      ...initialFormState, 
      build_pc_subcategory_id: selectedSubCategoryId, 
      display_order: subSubCategories.length + 1 
    });
  };

  const saveSubSubCategory = async () => {
    if (!formData.name || !formData.slug || !formData.build_pc_subcategory_id) {
      return alert('Sub-Category, Name, and Slug are required.');
    }
    
    const dataToSend = new FormData();
    dataToSend.append('build_pc_subcategory_id', formData.build_pc_subcategory_id);
    dataToSend.append('name', formData.name);
    dataToSend.append('slug', formData.slug);
    dataToSend.append('description', formData.description || '');
    dataToSend.append('display_order', formData.display_order);
    dataToSend.append('is_active', formData.is_active ? 1 : 0);

    if (imageFile) dataToSend.append('icon', imageFile);

    try {
      if (editingSubSubCategory) {
        await buildPcSubSubCategoryService.update(editingSubSubCategory.id, dataToSend);
      } else {
        await buildPcSubSubCategoryService.create(dataToSend);
      }
      
      if (selectedSubCategoryId === formData.build_pc_subcategory_id.toString()) {
        fetchSubSubCategories(selectedSubCategoryId);
      } else {
        setSelectedSubCategoryId(formData.build_pc_subcategory_id.toString());
      }
      
      clearForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving sub-sub-category');
    }
  };

  const deleteSubSubCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await buildPcSubSubCategoryService.delete(id);
        fetchSubSubCategories(selectedSubCategoryId);
        if (editingSubSubCategory?.id === id) clearForm();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting item');
      }
    }
  };

  const toggleActive = async (subSubCategory) => {
    try {
      const dataToSend = new FormData();
      dataToSend.append('is_active', subSubCategory.is_active ? 0 : 1);
      await buildPcSubSubCategoryService.update(subSubCategory.id, dataToSend);
      fetchSubSubCategories(selectedSubCategoryId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="master-page">
      <div className="master-header">
        <div className="header-title">
          <h1>Build PC Sub-Sub-Categories</h1>
          <p>Manage 3rd level components (e.g., Processors - Intel - Core i9)</p>
        </div>
      </div>

      <div className="master-content-layout">
        
        {/* LEFT SIDE: TABLE & FILTERS */}
        <div className="master-table-section">
          
          <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="search-wrapper" style={{ flex: '1 1 200px' }}>
              <FiFilter className="search-icon"/>
              <select 
                value={selectedParentId} 
                onChange={(e) => setSelectedParentId(e.target.value)} 
                className="search-input"
                style={{ appearance: 'auto', paddingLeft: '35px' }}
              >
                <option value="" disabled>1. Select Main Category...</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="search-wrapper" style={{ flex: '1 1 200px' }}>
              <FiFilter className="search-icon"/>
              <select 
                value={selectedSubCategoryId} 
                onChange={(e) => setSelectedSubCategoryId(e.target.value)} 
                className="search-input"
                style={{ appearance: 'auto', paddingLeft: '35px' }}
                disabled={!selectedParentId || subCategories.length === 0}
              >
                <option value="" disabled>
                  {subCategories.length === 0 ? "No Sub-Categories Found" : "2. Select Sub-Category..."}
                </option>
                {subCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            
            <div className="search-wrapper" style={{ flex: '1 1 200px' }}>
              <FiSearch className="search-icon"/>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={!selectedSubCategoryId}
              />
            </div>
          </div>

          <table className="master-table">
            <thead>
              <tr>
                <th className="image-cell">Icon</th>
                <th>Sub-Sub-Category Details</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!selectedSubCategoryId ? (
                 <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Please select a Sub-Category to view items</td></tr>
              ) : filteredSubSubCategories.length > 0 ? filteredSubSubCategories.map(item => (
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
                  <td>{item.display_order}</td>
                  <td>
                    <span className={`status-badge ${item.is_active ? 'status-active' : 'status-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit"><FiEdit2 size={14} /></button>
                      <button className="action-btn delete-btn" onClick={() => deleteSubSubCategory(item.id)} title="Delete"><FiTrash2 size={14} /></button>
                      <button className={`action-btn toggle-btn ${item.is_active ? 'active' : 'inactive'}`} onClick={() => toggleActive(item)} title="Toggle Status">
                        {item.is_active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No items found in this Sub-Category</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="master-form-section">
          <div className="form-header">
            <h2>{editingSubSubCategory ? 'Edit Item' : 'Add New Item'}</h2>
            {editingSubSubCategory && (
              <button className="btn-clear" onClick={clearForm} title="Cancel Edit"><FiX size={18} /></button>
            )}
          </div>
          
          <div className="form-body">
            
            <div className="form-group">
              <label>Parent Sub-Category *</label>
              <select 
                name="build_pc_subcategory_id" 
                value={formData.build_pc_subcategory_id} 
                onChange={handleInputChange} 
                className="form-input"
                style={{ appearance: 'auto' }}
                disabled={subCategories.length === 0}
              >
                <option value="" disabled>-- Select Sub-Category --</option>
                {subCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="e.g., Core i9 14th Gen" />
            </div>
            
            <div className="form-group">
              <label>URL Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="form-input" />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleInputChange} className="form-input" rows="3" />
            </div>
            
            <div className="form-group">
              <label>Icon / Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                className="form-input" 
                style={{ padding: '6px' }}
              />
              {editingSubSubCategory && editingSubSubCategory.icon_url && !imageFile && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={editingSubSubCategory.icon_url} alt="Current Icon" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }} />
                  <span style={{ fontSize: '12px', color: '#666' }}>Current Icon</span>
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
              {editingSubSubCategory && <button className="btn-secondary" onClick={clearForm}>Cancel</button>}
              <button className="btn-primary" onClick={saveSubSubCategory} disabled={!selectedSubCategoryId}>
                {editingSubSubCategory ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildPcSubSubCategoryManagement;
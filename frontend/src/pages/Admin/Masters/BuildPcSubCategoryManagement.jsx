import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiX, FiFilter } from 'react-icons/fi';
import buildPcCategoryService from '../../../services/buildPcCategoryService';
import buildPcSubCategoryService from '../../../services/buildPcSubCategoryService';
import './Masters.css';

const BuildPcSubCategoryManagement = () => {
  const [parentCategories, setParentCategories] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(''); // Used to filter the table
  const [subCategories, setSubCategories] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const initialFormState = { build_pc_category_id: '', name: '', slug: '', description: '', is_active: true, display_order: 0 };
  const [formData, setFormData] = useState(initialFormState);

  // 1. Fetch parent categories on mount
  useEffect(() => {
    fetchParentCategories();
  }, []);

  // 2. Fetch subcategories whenever the selected parent ID changes
  useEffect(() => {
    if (selectedParentId) {
      fetchSubCategories(selectedParentId);
      // Auto-select the parent in the form if we are creating a new one
      if (!editingSubCategory) {
        setFormData(prev => ({ ...prev, build_pc_category_id: selectedParentId }));
      }
    } else {
      setSubCategories([]);
    }
  }, [selectedParentId]);

  const fetchParentCategories = async () => {
    try {
      const data = await buildPcCategoryService.getAllCategories();
      setParentCategories(data);
      if (data.length > 0) {
        setSelectedParentId(data[0].id.toString()); // Auto-select first category
      }
    } catch (error) {
      console.error('Failed to fetch parent categories', error);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const data = await buildPcSubCategoryService.getSubCategoriesByCategory(categoryId);
      setSubCategories(data);
    } catch (error) {
      console.error('Failed to fetch sub-categories', error);
    }
  };

  const filteredSubCategories = subCategories.filter(sc =>
    sc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sc.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'name' && !editingSubCategory) {
        updated.slug = newValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleEdit = (subCategory) => {
    setImageFile(null);
    setEditingSubCategory(subCategory);
    setFormData({
      build_pc_category_id: subCategory.build_pc_category_id,
      name: subCategory.name,
      slug: subCategory.slug,
      description: subCategory.description || '',
      is_active: subCategory.is_active,
      display_order: subCategory.display_order
    });
  };

  const clearForm = () => {
    setImageFile(null);
    setEditingSubCategory(null);
    setFormData({ 
      ...initialFormState, 
      build_pc_category_id: selectedParentId, 
      display_order: subCategories.length + 1 
    });
  };

  const saveSubCategory = async () => {
    if (!formData.name || !formData.slug || !formData.build_pc_category_id) {
      return alert('Parent Category, Name, and Slug are required.');
    }
    
    const dataToSend = new FormData();
    dataToSend.append('build_pc_category_id', formData.build_pc_category_id);
    dataToSend.append('name', formData.name);
    dataToSend.append('slug', formData.slug);
    dataToSend.append('description', formData.description || '');
    dataToSend.append('display_order', formData.display_order);
    dataToSend.append('is_active', formData.is_active ? 1 : 0);

    if (imageFile) dataToSend.append('icon', imageFile);

    try {
      if (editingSubCategory) {
        await buildPcSubCategoryService.updateSubCategory(editingSubCategory.id, dataToSend);
      } else {
        await buildPcSubCategoryService.createSubCategory(dataToSend);
      }
      
      // Refresh the table for the currently selected parent category
      if (selectedParentId === formData.build_pc_category_id.toString()) {
        fetchSubCategories(selectedParentId);
      } else {
        setSelectedParentId(formData.build_pc_category_id.toString());
      }
      
      clearForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving sub-category');
    }
  };

  const deleteSubCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-category?')) {
      try {
        await buildPcSubCategoryService.deleteSubCategory(id);
        fetchSubCategories(selectedParentId);
        if (editingSubCategory?.id === id) clearForm();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting sub-category');
      }
    }
  };

  const toggleActive = async (subCategory) => {
    try {
      const dataToSend = new FormData();
      dataToSend.append('is_active', subCategory.is_active ? 0 : 1);
      await buildPcSubCategoryService.updateSubCategory(subCategory.id, dataToSend);
      fetchSubCategories(selectedParentId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="master-page">
      <div className="master-header">
        <div className="header-title">
          <h1>Build PC Sub-Categories</h1>
          <p>Manage sub-categories linked to PC Builder components (e.g., Intel, AMD, ATX)</p>
        </div>
      </div>

      <div className="master-content-layout">
        {/* LEFT SIDE: TABLE */}
        <div className="master-table-section">
          
          <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div className="search-wrapper" style={{ flex: 1 }}>
              <FiFilter className="search-icon" />
              <select 
                value={selectedParentId} 
                onChange={(e) => setSelectedParentId(e.target.value)} 
                className="search-input"
                style={{ appearance: 'auto', paddingLeft: '35px' }}
              >
                <option value="" disabled>Select Parent Category to view...</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="search-wrapper" style={{ flex: 1 }}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search sub-categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={!selectedParentId}
              />
            </div>
          </div>

          <table className="master-table">
            <thead>
              <tr>
                <th className="image-cell">Icon</th>
                <th>Sub-Category Details</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!selectedParentId ? (
                 <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Please select a parent category to view items</td></tr>
              ) : filteredSubCategories.length > 0 ? filteredSubCategories.map(subCategory => (
                <tr key={subCategory.id}>
                  <td className="image-cell">
                    {subCategory.icon_url ? 
                      <img src={subCategory.icon_url} alt={subCategory.name} className="table-image" /> : 
                      <div className="image-placeholder"><FiImage size={20} /></div>
                    }
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#333' }}>{subCategory.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>/{subCategory.slug}</div>
                  </td>
                  <td>{subCategory.display_order}</td>
                  <td>
                    <span className={`status-badge ${subCategory.is_active ? 'status-active' : 'status-inactive'}`}>
                      {subCategory.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(subCategory)} title="Edit"><FiEdit2 size={14} /></button>
                      <button className="action-btn delete-btn" onClick={() => deleteSubCategory(subCategory.id)} title="Delete"><FiTrash2 size={14} /></button>
                      <button className={`action-btn toggle-btn ${subCategory.is_active ? 'active' : 'inactive'}`} onClick={() => toggleActive(subCategory)} title="Toggle Status">
                        {subCategory.is_active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No sub-categories found in this category</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="master-form-section">
          <div className="form-header">
            <h2>{editingSubCategory ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h2>
            {editingSubCategory && (
              <button className="btn-clear" onClick={clearForm} title="Cancel Edit"><FiX size={18} /></button>
            )}
          </div>
          
          <div className="form-body">
            
            <div className="form-group">
              <label>Parent Category *</label>
              <select 
                name="build_pc_category_id" 
                value={formData.build_pc_category_id} 
                onChange={handleInputChange} 
                className="form-input"
                style={{ appearance: 'auto' }}
              >
                <option value="" disabled>-- Select Parent Category --</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="e.g., Intel Processors" />
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
              <label>Sub-Category Icon</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                className="form-input" 
                style={{ padding: '6px' }}
              />
              {editingSubCategory && editingSubCategory.icon_url && !imageFile && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={editingSubCategory.icon_url} alt="Current Icon" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }} />
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
              {editingSubCategory && <button className="btn-secondary" onClick={clearForm}>Cancel</button>}
              <button className="btn-primary" onClick={saveSubCategory}>
                {editingSubCategory ? 'Update Sub-Category' : 'Save Sub-Category'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildPcSubCategoryManagement;
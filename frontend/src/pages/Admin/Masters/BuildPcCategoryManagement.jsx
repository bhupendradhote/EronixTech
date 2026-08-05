import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiPlus, FiX } from 'react-icons/fi';
import buildPcCategoryService from '../../../services/buildPcCategoryService';
import './Masters.css';

const BuildPcCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const initialFormState = { name: '', slug: '', description: '', is_active: true, display_order: 0 };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await buildPcCategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch build pc categories', error);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'name' && !editingCategory) {
        updated.slug = newValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleEdit = (category) => {
    setImageFile(null);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
      display_order: category.display_order
    });
  };

  const clearForm = () => {
    setImageFile(null);
    setEditingCategory(null);
    setFormData({ ...initialFormState, display_order: categories.length + 1 });
  };

  const saveCategory = async () => {
    if (!formData.name || !formData.slug) return alert('Name and Slug are required.');
    
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('slug', formData.slug);
    dataToSend.append('description', formData.description || '');
    dataToSend.append('display_order', formData.display_order);
    dataToSend.append('is_active', formData.is_active ? 1 : 0);

    if (imageFile) dataToSend.append('icon', imageFile);

    try {
      if (editingCategory) await buildPcCategoryService.updateCategory(editingCategory.id, dataToSend);
      else await buildPcCategoryService.createCategory(dataToSend);
      
      fetchCategories();
      clearForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving build pc category');
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Sub-categories must be deleted first.')) {
      try {
        await buildPcCategoryService.deleteCategory(id);
        fetchCategories();
        if (editingCategory?.id === id) clearForm();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting build pc category');
      }
    }
  };

  const toggleActive = async (category) => {
    try {
      const dataToSend = new FormData();
      dataToSend.append('is_active', category.is_active ? 0 : 1);
      await buildPcCategoryService.updateCategory(category.id, dataToSend);
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="master-page">
      <div className="master-header">
        <div className="header-title">
          <h1>Build PC Categories</h1>
          <p>Manage main components for the PC Builder (e.g., Processors, Motherboards)</p>
        </div>
      </div>

      <div className="master-content-layout">
        {/* LEFT SIDE: TABLE */}
        <div className="master-table-section">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <table className="master-table">
            <thead>
              <tr>
                <th className="image-cell">Icon</th>
                <th>Category Details</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? filteredCategories.map(category => (
                <tr key={category.id}>
                  <td className="image-cell">
                    {category.icon_url ? 
                      <img src={category.icon_url} alt={category.name} className="table-image" /> : 
                      <div className="image-placeholder"><FiImage size={20} /></div>
                    }
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#333' }}>{category.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>/{category.slug}</div>
                  </td>
                  <td>{category.display_order}</td>
                  <td>
                    <span className={`status-badge ${category.is_active ? 'status-active' : 'status-inactive'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(category)} title="Edit"><FiEdit2 size={14} /></button>
                      <button className="action-btn delete-btn" onClick={() => deleteCategory(category.id)} title="Delete"><FiTrash2 size={14} /></button>
                      <button className={`action-btn toggle-btn ${category.is_active ? 'active' : 'inactive'}`} onClick={() => toggleActive(category)} title="Toggle Status">
                        {category.is_active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="master-form-section">
          <div className="form-header">
            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            {editingCategory && (
              <button className="btn-clear" onClick={clearForm} title="Cancel Edit"><FiX size={18} /></button>
            )}
          </div>
          
          <div className="form-body">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="e.g., Processor" />
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
              <label>Category Icon</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                className="form-input" 
                style={{ padding: '6px' }}
              />
              {editingCategory && editingCategory.icon_url && !imageFile && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={editingCategory.icon_url} alt="Current Icon" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }} />
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
              {editingCategory && <button className="btn-secondary" onClick={clearForm}>Cancel</button>}
              <button className="btn-primary" onClick={saveCategory}>
                {editingCategory ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildPcCategoryManagement;
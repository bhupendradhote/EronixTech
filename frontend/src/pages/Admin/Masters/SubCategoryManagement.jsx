import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiX } from 'react-icons/fi';
import subCategoryService from '../../../services/subCategoryService';
import categoryService from '../../../services/categoryService';
import './Masters.css';

const SubCategoryManagement = () => {
  const [parentCategories, setParentCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]); // Flat list of all subs
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSub, setEditingSub] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const initialFormState = { category_id: '', name: '', slug: '', description: '', is_active: true, display_order: 0 };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // By passing true for includeSubs, we get Categories WITH their sub_categories nested
      const cats = await categoryService.getAllCategories(false, true);
      setParentCategories(cats);
      
      // Flatten the nested array so we can display it nicely in a single table
      const flattenedSubs = cats.reduce((acc, cat) => {
        if (cat.sub_categories && cat.sub_categories.length > 0) {
          // Attach the parent name to each sub so the table knows where it belongs
          const subsWithParent = cat.sub_categories.map(s => ({...s, parent_name: cat.name}));
          return [...acc, ...subsWithParent];
        }
        return acc;
      }, []);
      
      setAllSubCategories(flattenedSubs);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const filteredSubs = allSubCategories.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'name' && !editingSub) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleEdit = (sub) => {
    setImageFile(null);
    setEditingSub(sub);
    setFormData({
      category_id: sub.category_id,
      name: sub.name,
      slug: sub.slug,
      description: sub.description || '',
      is_active: sub.is_active,
      display_order: sub.display_order
    });
  };

  const clearForm = () => {
    setImageFile(null);
    setEditingSub(null);
    setFormData(initialFormState);
  };

  const saveSubCategory = async () => {
    if (!formData.name || !formData.category_id) return alert('Name and Parent Category are required.');
    
    const dataToSend = new FormData();
    dataToSend.append('category_id', formData.category_id);
    dataToSend.append('name', formData.name);
    dataToSend.append('slug', formData.slug);
    dataToSend.append('description', formData.description || '');
    dataToSend.append('display_order', formData.display_order);
    dataToSend.append('is_active', formData.is_active ? 1 : 0);

    if (imageFile) dataToSend.append('icon', imageFile);

    try {
      if (editingSub) await subCategoryService.updateSubCategory(editingSub.id, dataToSend);
      else await subCategoryService.createSubCategory(dataToSend);
      
      fetchAllData(); // Refresh everything
      clearForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving sub-category');
    }
  };

  const deleteSubCategory = async (id) => {
    if (window.confirm('Delete this sub-category?')) {
      await subCategoryService.deleteSubCategory(id);
      fetchAllData();
      if (editingSub?.id === id) clearForm();
    }
  };

  const toggleActive = async (sub) => {
    const dataToSend = new FormData();
    dataToSend.append('is_active', sub.is_active ? 0 : 1);
    await subCategoryService.updateSubCategory(sub.id, dataToSend);
    fetchAllData();
  };

  return (
    <div className="master-page">
      <div className="master-header">
        <div className="header-title">
          <h1>Sub-Categories</h1>
          <p>Manage product sub-categories across all parents</p>
        </div>
      </div>

      <div className="master-content-layout">
        {/* LEFT SIDE: TABLE */}
        <div className="master-table-section">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search by name or parent..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>

          <table className="master-table">
            <thead>
              <tr>
                <th className="image-cell">Icon</th>
                <th>Sub-Category Details</th>
                <th>Parent Category</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length > 0 ? filteredSubs.map(sub => (
                <tr key={sub.id}>
                  <td className="image-cell">
                    {sub.icon_url ? 
                      <img src={sub.icon_url} alt={sub.name} className="table-image" /> : 
                      <div className="image-placeholder"><FiImage size={20} /></div>
                    }
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#333' }}>{sub.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>/{sub.slug}</div>
                  </td>
                  <td><span style={{ background: '#f0f4f8', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: '#0056b3' }}>{sub.parent_name}</span></td>
                  <td>{sub.display_order}</td>
                  <td>
                    <span className={`status-badge ${sub.is_active ? 'status-active' : 'status-inactive'}`}>
                      {sub.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(sub)}><FiEdit2 size={14} /></button>
                      <button className="action-btn delete-btn" onClick={() => deleteSubCategory(sub.id)}><FiTrash2 size={14} /></button>
                      <button className={`action-btn toggle-btn ${sub.is_active ? 'active' : 'inactive'}`} onClick={() => toggleActive(sub)}>
                        {sub.is_active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No sub-categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="master-form-section">
          <div className="form-header">
            <h2>{editingSub ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h2>
            {editingSub && <button className="btn-clear" onClick={clearForm}><FiX size={18} /></button>}
          </div>
          
          <div className="form-body">
            <div className="form-group">
              <label>Parent Category *</label>
              <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="form-input">
                <option value="">-- Select Parent --</option>
                {parentCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="e.g., Gaming Laptops" />
            </div>
            
            <div className="form-group">
              <label>URL Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="form-input" />
            </div>

            <div className="form-group">
              <label>Sub-Category Icon</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="form-input" style={{ padding: '6px' }} />
              {editingSub && editingSub.icon_url && !imageFile && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={editingSub.icon_url} alt="Current Icon" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }} />
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
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} /> Active
                </label>
              </div>
            </div>

            <div className="form-actions">
              {editingSub && <button className="btn-secondary" onClick={clearForm}>Cancel</button>}
              <button className="btn-primary" onClick={saveSubCategory}>
                {editingSub ? 'Update Sub-Category' : 'Save Sub-Category'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryManagement;
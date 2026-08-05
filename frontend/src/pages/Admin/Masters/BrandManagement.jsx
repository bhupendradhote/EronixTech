import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiX } from 'react-icons/fi';
import brandService from '../../../services/brandService';
import './Masters.css';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const initialFormState = { name: '', slug: '', description: '', website_url: '', is_active: true };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (error) {
      console.error('Failed to fetch brands', error);
    }
  };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'name' && !editingBrand) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleEdit = (brand) => {
    setImageFile(null);
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      website_url: brand.website_url || '',
      is_active: brand.is_active
    });
  };

  const clearForm = () => {
    setImageFile(null);
    setEditingBrand(null);
    setFormData(initialFormState);
  };

  const saveBrand = async () => {
    if (!formData.name || !formData.slug) return alert('Name and Slug are required.');
    
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('slug', formData.slug);
    dataToSend.append('description', formData.description || '');
    dataToSend.append('website_url', formData.website_url || '');
    dataToSend.append('is_active', formData.is_active ? 1 : 0);

    if (imageFile) dataToSend.append('logo', imageFile);

    try {
      if (editingBrand) await brandService.updateBrand(editingBrand.id, dataToSend);
      else await brandService.createBrand(dataToSend);
      
      fetchBrands();
      clearForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving brand');
    }
  };

  const deleteBrand = async (id) => {
    if (window.confirm('Delete this brand?')) {
      await brandService.deleteBrand(id);
      fetchBrands();
      if (editingBrand?.id === id) clearForm();
    }
  };

  const toggleActive = async (brand) => {
    const dataToSend = new FormData();
    dataToSend.append('is_active', brand.is_active ? 0 : 1);
    await brandService.updateBrand(brand.id, dataToSend);
    fetchBrands();
  };

  return (
    <div className="master-page">
      <div className="master-header">
        <div className="header-title">
          <h1>Brands</h1>
          <p>Manage product manufacturers and brands</p>
        </div>
      </div>

      <div className="master-content-layout">
        {/* LEFT SIDE: TABLE */}
        <div className="master-table-section">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search brands..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>

          <table className="master-table">
            <thead>
              <tr>
                <th className="image-cell">Logo</th>
                <th>Brand Name</th>
                <th>Website</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.length > 0 ? filteredBrands.map(brand => (
                <tr key={brand.id}>
                  <td className="image-cell">
                    {brand.logo_url ? 
                      <img src={brand.logo_url} alt={brand.name} className="table-image" /> : 
                      <div className="image-placeholder"><FiImage size={20} /></div>
                    }
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#333' }}>{brand.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>/{brand.slug}</div>
                  </td>
                  <td>
                    {brand.website_url ? (
                      <a href={brand.website_url} target="_blank" rel="noreferrer" style={{ color: '#007bff', fontSize: '13px', textDecoration: 'none' }}>Link ↗</a>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${brand.is_active ? 'status-active' : 'status-inactive'}`}>
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(brand)}><FiEdit2 size={14} /></button>
                      <button className="action-btn delete-btn" onClick={() => deleteBrand(brand.id)}><FiTrash2 size={14} /></button>
                      <button className={`action-btn toggle-btn ${brand.is_active ? 'active' : 'inactive'}`} onClick={() => toggleActive(brand)}>
                        {brand.is_active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No brands found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="master-form-section">
          <div className="form-header">
            <h2>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h2>
            {editingBrand && <button className="btn-clear" onClick={clearForm}><FiX size={18} /></button>}
          </div>
          
          <div className="form-body">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="e.g., Samsung" />
            </div>
            
            <div className="form-group">
              <label>URL Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="form-input" />
            </div>

            <div className="form-group">
              <label>Brand Logo</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="form-input" style={{ padding: '6px' }} />
              {editingBrand && editingBrand.logo_url && !imageFile && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={editingBrand.logo_url} alt="Current Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }} />
                  <span style={{ fontSize: '12px', color: '#666' }}>Current Logo</span>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Website URL</label>
                <input type="text" name="website_url" value={formData.website_url || ''} onChange={handleInputChange} className="form-input" placeholder="https://..." />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} /> Active
                </label>
              </div>
            </div>

            <div className="form-actions">
              {editingBrand && <button className="btn-secondary" onClick={clearForm}>Cancel</button>}
              <button className="btn-primary" onClick={saveBrand}>
                {editingBrand ? 'Update Brand' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandManagement;
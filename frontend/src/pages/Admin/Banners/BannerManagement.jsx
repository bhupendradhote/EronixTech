import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiImage,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiMove
} from 'react-icons/fi';
import bannerService from '../../../services/bannerService';
import './BannerManagement.css';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(8); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const bannerTypes = ['Hero', 'Promotional', 'Sidebar', 'Footer', 'Popup'];

  const initialFormState = {
    title: '',
    subtitle: '',
    link_url: '',
    banner_type: 'Hero',
    display_order: '',
    is_active: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- 1. Fetch data on load ---
  useEffect(() => {
    fetchBanners();
  }, []);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchBanners = async () => {
    try {
      const data = await bannerService.getAllBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch banners', error);
    }
  };

  // --- 2. Filter & Pagination Logic ---
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || banner.banner_type === filterType;
    
    let matchesStatus = true;
    if (filterStatus === 'Active') matchesStatus = banner.is_active === true || banner.is_active === 1;
    if (filterStatus === 'Inactive') matchesStatus = banner.is_active === false || banner.is_active === 0;

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => a.display_order - b.display_order); 

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [filteredBanners.length, totalPages, currentPage]);

  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- 3. Drawer & Form Handlers ---
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setFormData(initialFormState);
      setImageFile(null);
      setImagePreview('');
      setEditingBanner(null);
    }, 300); // Wait for animation before clearing
  };

  const openAddDrawer = () => {
    setFormData({ ...initialFormState, display_order: banners.length + 1 });
    setEditingBanner(null);
    setImageFile(null);
    setImagePreview('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      link_url: banner.link_url || '',
      banner_type: banner.banner_type || 'Hero',
      display_order: banner.display_order,
      is_active: banner.is_active === 1 || banner.is_active === true,
    });
    setImageFile(null);
    setImagePreview(banner.image_url || ''); 
    setIsDrawerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  // --- 4. API Actions ---
  const saveBanner = async () => {
    if (!formData.title || !formData.display_order) {
      alert('Please fill in Title and Display Order.');
      return;
    }
    if (!editingBanner && !imageFile && !imagePreview) {
      alert('Please select an image for the new banner.');
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('subtitle', formData.subtitle || '');
    dataToSend.append('link_url', formData.link_url || '');
    dataToSend.append('banner_type', formData.banner_type);
    dataToSend.append('display_order', formData.display_order);
    dataToSend.append('is_active', formData.is_active ? 1 : 0);

    if (imageFile) {
      dataToSend.append('image', imageFile);
    }

    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, dataToSend);
      } else {
        await bannerService.createBanner(dataToSend);
      }
      fetchBanners();
      closeDrawer();
    } catch (error) {
      alert('Error saving banner');
      console.error(error);
    }
  };

  const deleteBanner = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner permanently?')) {
      try {
        await bannerService.deleteBanner(bannerId);
        fetchBanners();
      } catch (error) {
        alert('Error deleting banner');
      }
    }
  };

  const toggleActive = async (banner) => {
    try {
      const isActiveNow = banner.is_active === 1 || banner.is_active === true;
      const dataToSend = new FormData();
      dataToSend.append('is_active', isActiveNow ? 0 : 1);
      
      dataToSend.append('display_order', banner.display_order);
      dataToSend.append('title', banner.title);
      dataToSend.append('banner_type', banner.banner_type);

      await bannerService.updateBanner(banner.id, dataToSend);
      fetchBanners();
    } catch (error) {
      console.error(error);
    }
  };

  const reorderBanner = async (bannerId, direction) => {
    const sortedBanners = [...banners].sort((a, b) => a.display_order - b.display_order);
    const bannerIndex = sortedBanners.findIndex(b => b.id === bannerId);
    
    if (bannerIndex < 0) return;

    const targetIndex = direction === 'up' ? bannerIndex - 1 : bannerIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedBanners.length) return;

    const currentBanner = sortedBanners[bannerIndex];
    const targetBanner = sortedBanners[targetIndex];

    const currentData = new FormData();
    currentData.append('display_order', targetBanner.display_order);
    currentData.append('title', currentBanner.title);
    currentData.append('banner_type', currentBanner.banner_type);

    const targetData = new FormData();
    targetData.append('display_order', currentBanner.display_order);
    targetData.append('title', targetBanner.title);
    targetData.append('banner_type', targetBanner.banner_type);

    try {
      await Promise.all([
        bannerService.updateBanner(currentBanner.id, currentData),
        bannerService.updateBanner(targetBanner.id, targetData)
      ]);
      fetchBanners();
    } catch (error) {
      console.error('Error reordering banners', error);
    }
  };

  return (
    <div className="banner-page">
      <div className="banner-header">
        <div className="header-title">
          <h1>Advertisement & Banners</h1>
          <p>Manage promotional creatives and scheduled displays</p>
        </div>
        <button className="btn-primary" onClick={openAddDrawer}>
          <FiPlus size={16} /> Add New Banner
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filters-bar">
        <div className="search-wrapper flex-grow">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-wrapper">
          <FiFilter className="filter-icon" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="All">All Types</option>
            {bannerTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="filter-wrapper">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        <div className="filter-wrapper">
          <span className="filter-label">Show:</span>
          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="filter-select">
            <option value={4}>4 per page</option>
            <option value={8}>8 per page</option>
            <option value={12}>12 per page</option>
            <option value={1000}>Show All</option>
          </select>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="banners-grid">
        {paginatedBanners.length > 0 ? (
          paginatedBanners.map(banner => (
            <div key={banner.id} className="banner-card">
              <div className="banner-image">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} />
                ) : (
                  <div className="placeholder-image">
                    <FiImage size={40} color="#cbd5e1" />
                  </div>
                )}
                
                <div className="banner-overlay">
                  <div className="order-controls">
                    <button onClick={() => reorderBanner(banner.id, 'up')} className="order-btn" title="Move Up">↑</button>
                    <span className="order-number">{banner.display_order}</span>
                    <button onClick={() => reorderBanner(banner.id, 'down')} className="order-btn" title="Move Down">↓</button>
                  </div>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => openEditDrawer(banner)} title="Edit">
                      <FiEdit2 size={16} />
                    </button>
                    <button className="action-btn delete-btn" onClick={() => deleteBanner(banner.id)} title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                    <button 
                      className={`action-btn toggle-btn ${(banner.is_active === 1 || banner.is_active === true) ? 'active' : 'inactive'}`} 
                      onClick={() => toggleActive(banner)} 
                      title={(banner.is_active === 1 || banner.is_active === true) ? 'Deactivate' : 'Activate'}
                    >
                      {(banner.is_active === 1 || banner.is_active === true) ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="banner-details">
                <div className="banner-title">{banner.title}</div>
                <div className="banner-subtitle">{banner.subtitle || 'No subtitle provided'}</div>
                <div className="banner-meta">
                  <span className="banner-type-badge">{banner.banner_type}</span>
                  <span className={`status-badge ${(banner.is_active === 1 || banner.is_active === true) ? 'status-active' : 'status-inactive'}`}>
                    {(banner.is_active === 1 || banner.is_active === true) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No banners found matching current filters.</div>
        )}
      </div>

      {/* Pagination */}
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

      {/* Strict Isolated Drawer (Prevents Global CSS Conflicts) */}
      {isDrawerOpen && (
        <div className="banner-drawer-overlay" onClick={closeDrawer}>
          <div className={`banner-drawer-content ${isDrawerOpen ? 'slide-in' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="banner-drawer-header">
              <h2>{editingBanner ? 'Edit Banner Settings' : 'Upload New Banner'}</h2>
              <button className="banner-close-btn" onClick={closeDrawer}>
                <FiX size={24} />
              </button>
            </div>
            
            <div className="banner-drawer-body">
              <div className="banner-drawer-section">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="E.g., Summer Sale Hero" className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>Subtitle / Description</label>
                  <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="Optional secondary text" className="form-input" />
                </div>

                <div className="form-group">
                  <label>Banner Image Asset *</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="form-input" style={{ padding: '8px' }} />
                </div>
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Creative Preview" />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Placement Type</label>
                    <select name="banner_type" value={formData.banner_type} onChange={handleInputChange} className="form-select">
                      {bannerTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sort / Display Order *</label>
                    <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Target URL (On Click)</label>
                  <input type="text" name="link_url" value={formData.link_url} onChange={handleInputChange} placeholder="https://..." className="form-input" />
                </div>

                <div className="form-group mt-3">
                  <label className="checkbox-label">
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                    Publish Immediately (Set Active)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="banner-drawer-footer">
              <button className="btn-secondary" onClick={closeDrawer}>Cancel</button>
              <button className="btn-primary" onClick={saveBanner}>Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
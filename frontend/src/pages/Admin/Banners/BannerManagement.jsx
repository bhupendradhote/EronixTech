import React, { useEffect, useState } from 'react';
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
  FiMonitor,
  FiSmartphone
} from 'react-icons/fi';
import bannerService from '../../../services/bannerService';
import './BannerManagement.css';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [desktopImageFile, setDesktopImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [desktopImagePreview, setDesktopImagePreview] = useState('');
  const [mobileImagePreview, setMobileImagePreview] = useState('');
  const [removeMobileImage, setRemoveMobileImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const bannerTypes = ['Hero', 'Promotional', 'Popup'];

  const initialFormState = {
    title: '',
    subtitle: '',
    link_url: '',
    banner_type: 'Hero',
    display_order: '',
    is_active: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchBanners();
  }, []);

  // Revoke only locally-created blob URLs.
  useEffect(() => {
    return () => {
      if (desktopImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(desktopImagePreview);
      }
    };
  }, [desktopImagePreview]);

  useEffect(() => {
    return () => {
      if (mobileImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(mobileImagePreview);
      }
    };
  }, [mobileImagePreview]);

  const fetchBanners = async () => {
    try {
      const data = await bannerService.getAllBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch banners', error);
    }
  };

  const filteredBanners = banners
    .filter((banner) => {
      const matchesSearch = banner.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || banner.banner_type === filterType;

      let matchesStatus = true;
      if (filterStatus === 'Active') matchesStatus = banner.is_active === true || banner.is_active === 1;
      if (filterStatus === 'Inactive') matchesStatus = banner.is_active === false || banner.is_active === 0;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => a.display_order - b.display_order);

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

  const resetImageState = () => {
    setDesktopImageFile(null);
    setMobileImageFile(null);
    setDesktopImagePreview('');
    setMobileImagePreview('');
    setRemoveMobileImage(false);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setFormData(initialFormState);
      resetImageState();
      setEditingBanner(null);
    }, 300);
  };

  const openAddDrawer = () => {
    setFormData({ ...initialFormState, display_order: banners.length + 1 });
    setEditingBanner(null);
    resetImageState();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      link_url: banner.link_url || '',
      banner_type: banner.banner_type || 'Hero',
      display_order: banner.display_order,
      is_active: banner.is_active === 1 || banner.is_active === true,
    });
    setDesktopImageFile(null);
    setMobileImageFile(null);
    setDesktopImagePreview(banner.image_url || '');
    setMobileImagePreview(banner.mobile_image_url || '');
    setRemoveMobileImage(false);
    setIsDrawerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDesktopFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDesktopImageFile(file);
    setDesktopImagePreview(URL.createObjectURL(file));
  };

  const handleMobileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMobileImageFile(file);
    setMobileImagePreview(URL.createObjectURL(file));
    setRemoveMobileImage(false);
  };

  const clearMobileImage = () => {
    setMobileImageFile(null);
    setMobileImagePreview('');
    setRemoveMobileImage(true);
  };

  const saveBanner = async () => {
    if (!formData.title || !formData.display_order) {
      alert('Please fill in Title and Display Order.');
      return;
    }

    if (!editingBanner && !desktopImageFile) {
      alert('Please select a Desktop Banner Image.');
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('subtitle', formData.subtitle || '');
    dataToSend.append('link_url', formData.link_url || '');
    dataToSend.append('banner_type', formData.banner_type);
    dataToSend.append('display_order', String(formData.display_order));
    dataToSend.append('is_active', formData.is_active ? '1' : '0');

    if (desktopImageFile) {
      dataToSend.append('desktop_image', desktopImageFile);
    }

    if (mobileImageFile) {
      dataToSend.append('mobile_image', mobileImageFile);
    }

    if (removeMobileImage) {
      dataToSend.append('remove_mobile_image', '1');
    }

    try {
      setSaving(true);
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, dataToSend);
      } else {
        await bannerService.createBanner(dataToSend);
      }
      await fetchBanners();
      closeDrawer();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error saving banner';
      alert(message);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner permanently?')) return;

    try {
      await bannerService.deleteBanner(bannerId);
      await fetchBanners();
    } catch (error) {
      alert('Error deleting banner');
      console.error(error);
    }
  };

  const toggleActive = async (banner) => {
    try {
      const isActiveNow = banner.is_active === 1 || banner.is_active === true;
      const dataToSend = new FormData();
      dataToSend.append('is_active', isActiveNow ? '0' : '1');
      dataToSend.append('display_order', String(banner.display_order));
      dataToSend.append('title', banner.title);
      dataToSend.append('banner_type', banner.banner_type);

      await bannerService.updateBanner(banner.id, dataToSend);
      await fetchBanners();
    } catch (error) {
      console.error(error);
    }
  };

  const reorderBanner = async (bannerId, direction) => {
    const sortedBanners = [...banners].sort((a, b) => a.display_order - b.display_order);
    const bannerIndex = sortedBanners.findIndex((b) => b.id === bannerId);
    if (bannerIndex < 0) return;

    const targetIndex = direction === 'up' ? bannerIndex - 1 : bannerIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedBanners.length) return;

    const currentBanner = sortedBanners[bannerIndex];
    const targetBanner = sortedBanners[targetIndex];

    const currentData = new FormData();
    currentData.append('display_order', String(targetBanner.display_order));
    currentData.append('title', currentBanner.title);
    currentData.append('banner_type', currentBanner.banner_type);

    const targetData = new FormData();
    targetData.append('display_order', String(currentBanner.display_order));
    targetData.append('title', targetBanner.title);
    targetData.append('banner_type', targetBanner.banner_type);

    try {
      await Promise.all([
        bannerService.updateBanner(currentBanner.id, currentData),
        bannerService.updateBanner(targetBanner.id, targetData),
      ]);
      await fetchBanners();
    } catch (error) {
      console.error('Error reordering banners', error);
    }
  };

  return (
    <div className="banner-page">
      <div className="banner-header">
        <div className="header-title">
          <h1>Advertisement & Banners</h1>
          <p>Manage responsive desktop and mobile banner creatives</p>
        </div>
        <button className="btn-primary" onClick={openAddDrawer}>
          <FiPlus size={16} /> Add New Banner
        </button>
      </div>

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
            {bannerTypes.map((type) => <option key={type} value={type}>{type}</option>)}
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

      <div className="banners-grid">
        {paginatedBanners.length > 0 ? (
          paginatedBanners.map((banner) => (
            <div key={banner.id} className="banner-card">
              <div className="banner-image">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title} />
                ) : (
                  <div className="placeholder-image">
                    <FiImage size={40} color="#cbd5e1" />
                  </div>
                )}

                <div className="responsive-image-status">
                  <span title="Desktop image available"><FiMonitor size={13} /> Desktop</span>
                  <span className={banner.mobile_image_url ? 'available' : 'fallback'} title={banner.mobile_image_url ? 'Mobile image available' : 'Mobile will use desktop image'}>
                    <FiSmartphone size={13} /> {banner.mobile_image_url ? 'Mobile' : 'Desktop fallback'}
                  </span>
                </div>

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

      {isDrawerOpen && (
        <div className="banner-drawer-overlay" onClick={closeDrawer}>
          <div className="banner-drawer-content" onClick={(e) => e.stopPropagation()}>
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
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="E.g., Laptop Hero"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Subtitle / Description</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Optional secondary text"
                    className="form-input"
                  />
                </div>

                <div className="responsive-upload-grid">
                  <div className="responsive-upload-card desktop-upload-card">
                    <div className="upload-card-heading">
                      <span className="upload-device-icon"><FiMonitor /></span>
                      <div>
                        <strong>Desktop Banner *</strong>
                        <small>Recommended: 1920 × 650 px • WebP</small>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDesktopFileChange}
                      className="form-input"
                    />
                    {desktopImagePreview && (
                      <div className="image-preview desktop-preview">
                        <img src={desktopImagePreview} alt="Desktop banner preview" />
                      </div>
                    )}
                  </div>

                  <div className="responsive-upload-card mobile-upload-card">
                    <div className="upload-card-heading">
                      <span className="upload-device-icon"><FiSmartphone /></span>
                      <div>
                        <strong>Mobile Banner</strong>
                        <small>Recommended: 900 × 650 px • WebP</small>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMobileFileChange}
                      className="form-input"
                    />
                    {mobileImagePreview ? (
                      <>
                        <div className="image-preview mobile-preview">
                          <img src={mobileImagePreview} alt="Mobile banner preview" />
                        </div>
                        <button type="button" className="remove-mobile-btn" onClick={clearMobileImage}>
                          Remove mobile image
                        </button>
                      </>
                    ) : (
                      <div className="mobile-fallback-note">
                        <FiSmartphone /> No mobile creative selected. Phones will automatically use the desktop image.
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Placement Type</label>
                    <select name="banner_type" value={formData.banner_type} onChange={handleInputChange} className="form-select">
                      {bannerTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sort / Display Order *</label>
                    <input
                      type="number"
                      min="1"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Target URL (On Click)</label>
                  <input
                    type="text"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleInputChange}
                    placeholder="/category/laptops or https://..."
                    className="form-input"
                  />
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
              <button className="btn-secondary" onClick={closeDrawer} disabled={saving}>Cancel</button>
              <button className="btn-primary" onClick={saveBanner} disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;

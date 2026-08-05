import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import subCategoryService from '../../../services/subCategoryService';
import brandService from '../../../services/brandService';
import buildPcCategoryService from '../../../services/buildPcCategoryService';
import buildPcSubCategoryService from '../../../services/buildPcSubCategoryService';
import buildPcSubSubCategoryService from '../../../services/buildPcSubSubCategoryService';
import { getImageUrl } from '../../../utils/imageUrl';
import './Products.css';

const ProductForm = ({ isOpen, onClose, product, onSaveSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // ==========================================
  // STRICTLY ISOLATED MEDIA STATES FOR MAIN GALLERY
  // ==========================================
  const [mainImageFiles, setMainImageFiles] = useState([]);
  const [mainImagePreviews, setMainImagePreviews] = useState([]);
  const [existingMainImages, setExistingMainImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoRemoved, setVideoRemoved] = useState(false);

  // Dropdown Data States
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Build PC dropdown data
  const [buildPcCategories, setBuildPcCategories] = useState([]);
  const [buildPcSubCategories, setBuildPcSubCategories] = useState([]);
  const [buildPcSubSubCategories, setBuildPcSubSubCategories] = useState([]);

  // ==========================================
  // 1. Initial State
  // ==========================================
  const initialFormState = {
    // Product type: 'normal', 'pc_build', 'pc_pre_build'
    product_type: 'normal',
    name: '', slug: '', short_description: '', 
    category_id: '', sub_category_id: '', child_category_id: '', brand_id: '',
    // Build PC fields
    build_pc_category_id: '',
    build_pc_subcategory_id: '',
    build_pc_sub_subcategory_id: '',
    status: 'draft', condition: 'New', launch_date: '',
    product_code: '', sku: '', barcode: '', upc: '', ean: '', gtin: '', mpn: '',
    model_number: '', manufacturer: '', hsn_code: '', country_of_origin: '',
    cost_price: '', mrp: '', selling_price: '', offer_price: '',
    tax_percentage: '', tax_type: 'exclusive', offer_start_date: '', offer_end_date: '',
    stock_quantity: 0, minimum_stock_alert: 5, stock_status: 'in_stock',
    weight: '', height: '', width: '', depth: '', color: '',
    featured: false, is_new: true, is_refurbished: false, 
    is_best_seller: false, is_trending: false, is_cod_available: true,
    warranty: '', return_policy_id: '',
    meta_title: '', meta_description: '', meta_keywords: '', search_keywords: '',
    video_type: 'none', video_url: '',
    
    // Dynamic JSON Arrays
    description: [], 
    key_features: [''], 
    specifications: [], 
    variants: [], 
    offers: []
  };

  const [formData, setFormData] = useState(initialFormState);

  // ==========================================
  // 2. Fetch Dependent Data
  // ==========================================
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fetchedCategories, fetchedBrands, fetchedBuildPcCategories] = await Promise.all([
          categoryService.getAllCategories(true),
          brandService.getAllBrands(true),
          buildPcCategoryService.getAllCategories(true, false)
        ]);
        setCategories(fetchedCategories);
        setBrands(fetchedBrands);
        setBuildPcCategories(fetchedBuildPcCategories);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch standard subcategories when category_id changes (always)
  useEffect(() => {
    if (formData.category_id) {
      const fetchSubCategories = async () => {
        try {
          const fetchedSubCategories = await subCategoryService.getSubCategoriesByCategory(formData.category_id, true);
          setSubCategories(fetchedSubCategories);
        } catch (error) {
          console.error("Failed to fetch sub categories", error);
        }
      };
      fetchSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [formData.category_id]);

  // Fetch Build PC Subcategories when Build PC Category changes
  useEffect(() => {
    if (formData.build_pc_category_id) {
      const fetchSubCategories = async () => {
        try {
          const fetched = await buildPcSubCategoryService.getSubCategoriesByCategory(
            formData.build_pc_category_id,
            true
          );
          setBuildPcSubCategories(fetched);
        } catch (error) {
          console.error("Failed to fetch build PC subcategories", error);
        }
      };
      fetchSubCategories();
    } else {
      setBuildPcSubCategories([]);
    }
    // Reset lower level
    setBuildPcSubSubCategories([]);
    if (!formData.build_pc_category_id) {
      setFormData(prev => ({ ...prev, build_pc_subcategory_id: '', build_pc_sub_subcategory_id: '' }));
    }
  }, [formData.build_pc_category_id]);

  // Fetch Build PC Sub‑Subcategories when Build PC Subcategory changes
  useEffect(() => {
    if (formData.build_pc_subcategory_id) {
      const fetchSubSubCategories = async () => {
        try {
          const fetched = await buildPcSubSubCategoryService.getSubSubCategoriesBySubCategory(
            formData.build_pc_subcategory_id,
            true
          );
          setBuildPcSubSubCategories(fetched);
        } catch (error) {
          console.error("Failed to fetch build PC sub-subcategories", error);
        }
      };
      fetchSubSubCategories();
    } else {
      setBuildPcSubSubCategories([]);
    }
    if (!formData.build_pc_subcategory_id) {
      setFormData(prev => ({ ...prev, build_pc_sub_subcategory_id: '' }));
    }
  }, [formData.build_pc_subcategory_id]);

  // ==========================================
  // 3. Populate Form & Handle Memory Cleanup
  // ==========================================
  useEffect(() => {
    if (product) {
      const mergedData = { ...initialFormState };
      Object.keys(initialFormState).forEach(key => {
        if (product[key] !== undefined && product[key] !== null) mergedData[key] = product[key];
      });
      
      ['description', 'key_features', 'specifications', 'variants', 'offers'].forEach(field => {
        if (typeof mergedData[field] === 'string') {
          try { mergedData[field] = JSON.parse(mergedData[field]); } catch(e) {}
        }
        if (!Array.isArray(mergedData[field])) mergedData[field] = field === 'key_features' ? [''] : [];
      });

      setFormData(mergedData);
      
      // Load strictly main existing images
      if (product.images) {
        try {
          const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          setExistingMainImages(parsedImages);
        } catch(e) { setExistingMainImages([]); }
      }
    } else {
      setFormData(initialFormState);
      setExistingMainImages([]);
      setBuildPcSubCategories([]);
      setBuildPcSubSubCategories([]);
    }
    
    setMainImageFiles([]);
    setVideoFile(null);
    setVideoPreview('');
    setVideoRemoved(false);
  }, [product, isOpen]);

  useEffect(() => {
    const urls = mainImageFiles.map(file => URL.createObjectURL(file));
    setMainImagePreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [mainImageFiles]);

  // ==========================================
  // 4. Handlers
  // ==========================================
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // For Build PC dropdowns, we handle the cascading resets in the useEffect
    if (name === 'build_pc_category_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        build_pc_subcategory_id: '',
        build_pc_sub_subcategory_id: ''
      }));
      return;
    }
    if (name === 'build_pc_subcategory_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        build_pc_sub_subcategory_id: ''
      }));
      return;
    }
    // For standard category, reset sub_category when category changes
    if (name === 'category_id') {
      setFormData(prev => ({ ...prev, [name]: value, sub_category_id: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Product type toggle handler – now only changes the type, does not clear any fields
  const handleProductTypeChange = (type) => {
    setFormData(prev => ({ ...prev, product_type: type }));
  };

  // Main Gallery Image Handlers
  const handleMainGalleryUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setMainImageFiles(prev => [...prev, ...newFiles]);
  };

  const removeMainGalleryImage = (index) => {
    setMainImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMainImage = (index) => {
    setExistingMainImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 120 * 1024 * 1024) {
      alert('Video must be smaller than 120 MB.');
      return;
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoRemoved(false);
    setFormData(prev => ({ ...prev, video_type: 'upload', video_url: '' }));
  };

  const removeProductVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview('');
    setVideoRemoved(true);
    setFormData(prev => ({ ...prev, video_type: 'none', video_url: '' }));
  };

  // Array & Section Handlers
  const handleArrayChange = (field, index, key, value) => {
    const newArray = [...formData[field]];
    if (key === null) {
      newArray[index] = value; 
    } else {
      newArray[index] = { ...newArray[index], [key]: value }; 
    }
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field, template) => setFormData({ ...formData, [field]: [...formData[field], template] });
  
  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length || field === 'key_features' ? newArray : [] });
    if (field === 'key_features' && newArray.length === 0) setFormData(prev => ({...prev, key_features: ['']}));
  };

  // ==========================================
  // 5. Submit
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'boolean') {
          submitData.append(key, formData[key] ? 1 : 0);
        } else if (['description', 'key_features', 'specifications', 'variants', 'offers'].includes(key)) {
          
          let cleanArray = formData[key].map((item, index) => {
            if (key === 'description' && item.image instanceof File) {
              submitData.append(`description_images[${index}]`, item.image);
              return { ...item, image: 'file_attached' };
            }
            return item;
          });

          if (key === 'key_features') {
            cleanArray = cleanArray.filter(f => typeof f === 'string' && f.trim() !== '');
          }
          
          submitData.append(key, JSON.stringify(cleanArray));
        } else if (formData[key] !== '' && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      submitData.append('existing_images', JSON.stringify(existingMainImages));
      if (videoRemoved) submitData.append('remove_video', '1');
      if (videoFile) submitData.append('product_video', videoFile);

      mainImageFiles.forEach((file, index) => {
        submitData.append(`gallery_images[${index}]`, file);
      });

      if (product?.id) await productService.updateProduct(product.id, submitData);
      else await productService.createProduct(submitData);

      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error("Save failed", error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer-content ${isOpen ? 'open' : ''}`}>
        
        <div className="drawer-header">
          <h2>{product ? 'Edit Product Master' : 'Add New Product Master'}</h2>
          <button className="close-btn" onClick={onClose}><FiX size={24} /></button>
        </div>

        <div className="drawer-body">
          <form id="productForm" onSubmit={handleSubmit}>
            
            {/* --------------------------------------------------- */}
            {/* PRODUCT TYPE TOGGLE */}
            {/* --------------------------------------------------- */}
            <div className="form-section">
              <h3>Product Type</h3>
              <div className="product-type-toggle" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className={`toggle-btn ${formData.product_type === 'normal' ? 'active' : ''}`}
                  onClick={() => handleProductTypeChange('normal')}
                  style={{
                    padding: '8px 20px',
                    border: '2px solid #ccc',
                    borderRadius: '4px',
                    background: formData.product_type === 'normal' ? '#007bff' : '#fff',
                    color: formData.product_type === 'normal' ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Normal Product
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${formData.product_type === 'pc_build' ? 'active' : ''}`}
                  onClick={() => handleProductTypeChange('pc_build')}
                  style={{
                    padding: '8px 20px',
                    border: '2px solid #ccc',
                    borderRadius: '4px',
                    background: formData.product_type === 'pc_build' ? '#007bff' : '#fff',
                    color: formData.product_type === 'pc_build' ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  PC Build
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${formData.product_type === 'pc_pre_build' ? 'active' : ''}`}
                  onClick={() => handleProductTypeChange('pc_pre_build')}
                  style={{
                    padding: '8px 20px',
                    border: '2px solid #ccc',
                    borderRadius: '4px',
                    background: formData.product_type === 'pc_pre_build' ? '#007bff' : '#fff',
                    color: formData.product_type === 'pc_pre_build' ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  PC Pre‑Build
                </button>
              </div>
            </div>

            {/* --------------------------------------------------- */}
            {/* 1. BASIC INFORMATION */}
            {/* --------------------------------------------------- */}
            <div className="form-section">
              <h3>1. Basic Information</h3>
              <div className="form-row three-cols">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleNameChange} required className="form-input" />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} required className="form-input" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* ALWAYS SHOW STANDARD CATEGORY + BRAND */}
              <div className="form-row three-cols">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="form-select">
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sub Category</label>
                  <select name="sub_category_id" value={formData.sub_category_id} onChange={handleInputChange} className="form-select" disabled={!formData.category_id}>
                    <option value="">Select Sub Category</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <select name="brand_id" value={formData.brand_id} onChange={handleInputChange} className="form-select">
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ALWAYS SHOW BUILD PC DROPDOWNS */}
              <div className="form-row three-cols">
                <div className="form-group">
                  <label>Build PC Category</label>
                  <select
                    name="build_pc_category_id"
                    value={formData.build_pc_category_id}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Build PC Category</option>
                    {buildPcCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Build PC Subcategory</label>
                  <select
                    name="build_pc_subcategory_id"
                    value={formData.build_pc_subcategory_id}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={!formData.build_pc_category_id}
                  >
                    <option value="">Select Build PC Subcategory</option>
                    {buildPcSubCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Build PC Sub‑Subcategory</label>
                  <select
                    name="build_pc_sub_subcategory_id"
                    value={formData.build_pc_sub_subcategory_id}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={!formData.build_pc_subcategory_id}
                  >
                    <option value="">Select Build PC Sub‑Subcategory</option>
                    {buildPcSubSubCategories.map(subsub => (
                      <option key={subsub.id} value={subsub.id}>{subsub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} rows="2" className="form-textarea" />
              </div>
            </div>

            {/* 2. DETAILED DESCRIPTIONS */}
            <div className="form-section">
              <h3>2. Detailed Descriptions</h3>
              <div className="inner-section">
                <div className="section-header-row">
                  <h4>Content Sections</h4>
                  <button type="button" className="btn-icon" onClick={() => addArrayItem('description', { title: '', text: '', image: '' })}><FiPlus /></button>
                </div>
                {formData.description.map((desc, index) => (
                  <div key={index} className="dynamic-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px', marginBottom: '15px', padding: '15px', border: '1px dashed #ccc', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Section {index + 1}</strong>
                      <button type="button" className="btn-danger-icon" onClick={() => removeArrayItem('description', index)}><FiTrash2 /></button>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input type="text" value={desc.title} onChange={(e) => handleArrayChange('description', index, 'title', e.target.value)} placeholder="Section Title" className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <textarea value={desc.text} onChange={(e) => handleArrayChange('description', index, 'text', e.target.value)} placeholder="Section Text" className="form-textarea" rows="3" />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label 
                        htmlFor={`section-upload-${index}`} 
                        className="file-upload-label" 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px', border: '1px dashed #bbb', borderRadius: '6px', cursor: 'pointer', background: '#fafafa' }}
                      >
                        {desc.image ? (
                          <div style={{ textAlign: 'center' }}>
                            <img 
                              src={desc.image instanceof File ? URL.createObjectURL(desc.image) : getImageUrl(desc.image)} 
                              alt={`Section ${index + 1}`} 
                              style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} 
                            />
                          </div>
                        ) : (
                          <>
                            <FiUploadCloud size={28} color="#888" />
                            <span style={{ fontSize: '14px', color: '#666' }}>Upload Section Image</span>
                          </>
                        )}

                        <input 
                          id={`section-upload-${index}`}
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleArrayChange('description', index, 'image', e.target.files[0]);
                            }
                            e.target.value = null; 
                          }} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                      
                      {desc.image && (
                        <div style={{ textAlign: 'right', marginTop: '5px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleArrayChange('description', index, 'image', '')}
                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                          >
                            Remove Section Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MAIN GALLERY IMAGES */}
            <div className="form-section">
              <h3>3. Main Product Gallery Images</h3>
              {existingMainImages.length > 0 && (
                <div className="existing-images-wrapper mb-3">
                  <label>Current Gallery Images:</label>
                  <div className="image-preview-grid">
                    {existingMainImages.map((img, idx) => (
                      <div key={idx} className="preview-card existing-img" style={{ position: 'relative' }}>
                        <img
                          src={getImageUrl(img.image_path || img.path || img.url || img)}
                          alt="Gallery"
                          className="preview-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://placehold.co/160x160?text=No+Image';
                          }}
                        />
                        <button type="button" className="remove-img-btn" onClick={() => removeExistingMainImage(idx)}>
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="main-gallery-upload" className="file-upload-label">
                  <FiUploadCloud size={24} />
                  <span>Click to Upload New Gallery Images</span>
                  <input 
                    id="main-gallery-upload"
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => {
                      handleMainGalleryUpload(e);
                      e.target.value = null;
                    }} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>
              {mainImagePreviews.length > 0 && (
                <div className="new-images-preview mt-3">
                  <label>Gallery Images to be uploaded:</label>
                  <div className="image-preview-grid">
                    {mainImagePreviews.map((url, idx) => (
                      <div key={idx} className="preview-card">
                        <img src={url} alt={`Gallery upload ${idx}`} className="preview-img" />
                        <button type="button" className="remove-img-btn" onClick={() => removeMainGalleryImage(idx)}>
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT VIDEO */}
            <div className="form-section">
              <h3>Product Video</h3>
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Video Source</label>
                  <select
                    name="video_type"
                    value={formData.video_type || 'none'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, video_type: value, video_url: value === 'youtube' ? prev.video_url : '' }));
                      if (value !== 'upload') {
                        if (videoPreview) URL.revokeObjectURL(videoPreview);
                        setVideoFile(null);
                        setVideoPreview('');
                      }
                      setVideoRemoved(value === 'none');
                    }}
                    className="form-select"
                  >
                    <option value="none">No Video</option>
                    <option value="upload">Upload Video</option>
                    <option value="youtube">YouTube URL</option>
                  </select>
                </div>

                {formData.video_type === 'youtube' && (
                  <div className="form-group">
                    <label>YouTube Video URL</label>
                    <input
                      type="url"
                      name="video_url"
                      value={formData.video_url || ''}
                      onChange={(e) => {
                        setVideoRemoved(false);
                        handleInputChange(e);
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="form-input"
                    />
                  </div>
                )}
              </div>

              {formData.video_type === 'upload' && (
                <div className="form-group">
                  <label htmlFor="product-video-upload" className="file-upload-label">
                    <FiUploadCloud size={24} />
                    <span>{videoFile ? videoFile.name : 'Upload MP4, WebM, OGG or MOV (maximum 120 MB)'}</span>
                    <input
                      id="product-video-upload"
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleVideoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}

              {(videoPreview || (!videoRemoved && product?.video_url)) && formData.video_type === 'upload' && (
                <div className="product-video-admin-preview">
                  <video controls preload="metadata" src={videoPreview || getImageUrl(product.video_url)} />
                  <button type="button" className="btn-danger" onClick={removeProductVideo}>Remove Video</button>
                </div>
              )}

              {formData.video_type === 'youtube' && formData.video_url && (
                <div className="video-url-note">The YouTube video will appear in the product gallery.</div>
              )}
            </div>

            {/* 4. PRICING & TAXES */}
            <div className="form-section">
              <h3>4. Pricing & Taxes</h3>
              <div className="form-row three-cols">
                <div className="form-group"><label>Cost Price</label><input type="number" step="0.01" name="cost_price" value={formData.cost_price} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group"><label>MRP *</label><input type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleInputChange} required className="form-input" /></div>
                <div className="form-group"><label>Selling Price *</label><input type="number" step="0.01" name="selling_price" value={formData.selling_price} onChange={handleInputChange} required className="form-input" /></div>
              </div>
              <div className="form-row three-cols">
                <div className="form-group"><label>Tax Percentage (%)</label><input type="number" step="0.01" name="tax_percentage" value={formData.tax_percentage} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group">
                  <label>Tax Type</label>
                  <select name="tax_type" value={formData.tax_type} onChange={handleInputChange} className="form-select">
                    <option value="exclusive">Exclusive</option>
                    <option value="inclusive">Inclusive</option>
                    <option value="exempt">Exempt</option>
                  </select>
                </div>
                <div className="form-group"><label>Offer Price</label><input type="number" step="0.01" name="offer_price" value={formData.offer_price} onChange={handleInputChange} className="form-input" /></div>
              </div>
            </div>

            {/* 5. FEATURES, OFFERS & VARIATIONS */}
            <div className="form-section">
              <h3>5. Features & Variations</h3>
              <div className="inner-section mb-4">
                <div className="section-header-row">
                  <h4>Key Features</h4>
                  <button type="button" className="btn-icon" onClick={() => addArrayItem('key_features', '')}><FiPlus /></button>
                </div>
                {formData.key_features.map((feature, index) => (
                  <div key={index} className="dynamic-row">
                    <input type="text" value={feature} onChange={(e) => handleArrayChange('key_features', index, null, e.target.value)} placeholder="Bullet point feature" className="form-input" />
                    <button type="button" className="btn-danger-icon" onClick={() => removeArrayItem('key_features', index)}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
              <div className="inner-section mb-4">
                <div className="section-header-row">
                  <h4>Offers</h4>
                  <button type="button" className="btn-icon" onClick={() => addArrayItem('offers', { title: '', type: 'bank_offer', value: '' })}><FiPlus /></button>
                </div>
                {formData.offers.map((offer, index) => (
                  <div key={index} className="dynamic-row offer-row">
                    <input type="text" value={offer.title} onChange={(e) => handleArrayChange('offers', index, 'title', e.target.value)} placeholder="Offer Title (e.g. 10% off SBI Cards)" className="form-input" />
                    <select value={offer.type} onChange={(e) => handleArrayChange('offers', index, 'type', e.target.value)} className="form-select" style={{width: '140px'}}>
                      <option value="bank_offer">Bank Offer</option>
                      <option value="cashback">Cashback</option>
                      <option value="coupon">Coupon</option>
                      <option value="emi">No Cost EMI</option>
                    </select>
                    <input type="text" value={offer.value} onChange={(e) => handleArrayChange('offers', index, 'value', e.target.value)} placeholder="Value/Terms" className="form-input" style={{width: '120px'}} />
                    <button type="button" className="btn-danger-icon" onClick={() => removeArrayItem('offers', index)}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
              <div className="inner-section mb-4">
                <div className="section-header-row">
                  <h4>Specifications</h4>
                  <button type="button" className="btn-icon" onClick={() => addArrayItem('specifications', { group_name: '', spec_name: '', spec_value: '' })}><FiPlus /></button>
                </div>
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="dynamic-row spec-row">
                    <input type="text" value={spec.group_name} onChange={(e) => handleArrayChange('specifications', index, 'group_name', e.target.value)} placeholder="Group (e.g. Display)" className="form-input" />
                    <input type="text" value={spec.spec_name} onChange={(e) => handleArrayChange('specifications', index, 'spec_name', e.target.value)} placeholder="Name (e.g. Size)" className="form-input" />
                    <input type="text" value={spec.spec_value} onChange={(e) => handleArrayChange('specifications', index, 'spec_value', e.target.value)} placeholder="Value" className="form-input" />
                    <button type="button" className="btn-danger-icon" onClick={() => removeArrayItem('specifications', index)}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
              <div className="inner-section">
                <div className="section-header-row">
                  <h4>Variants</h4>
                  <button type="button" className="btn-icon" onClick={() => addArrayItem('variants', { sku: '', variant_name: '', price: '', stock_quantity: 0 })}><FiPlus /></button>
                </div>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="dynamic-row variant-row">
                    <input type="text" value={variant.sku} onChange={(e) => handleArrayChange('variants', index, 'sku', e.target.value)} placeholder="Variant SKU" className="form-input" />
                    <input type="text" value={variant.variant_name} onChange={(e) => handleArrayChange('variants', index, 'variant_name', e.target.value)} placeholder="Name (e.g. 8GB/Red)" className="form-input" />
                    <input type="number" value={variant.price} onChange={(e) => handleArrayChange('variants', index, 'price', e.target.value)} placeholder="Price" className="form-input" style={{width: '100px'}} />
                    <button type="button" className="btn-danger-icon" onClick={() => removeArrayItem('variants', index)}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. IDENTIFIERS & SOURCING */}
            <div className="form-section">
              <h3>6. Identifiers & Sourcing</h3>
              <div className="form-row three-cols">
                <div className="form-group"><label>SKU</label><input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group"><label>Product Code</label><input type="text" name="product_code" value={formData.product_code} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group"><label>Barcode</label><input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} className="form-input" /></div>
              </div>
              <div className="form-row three-cols">
                <div className="form-group"><label>Model Number</label><input type="text" name="model_number" value={formData.model_number} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group"><label>Manufacturer</label><input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group"><label>HSN Code</label><input type="text" name="hsn_code" value={formData.hsn_code} onChange={handleInputChange} className="form-input" /></div>
              </div>
              <div className="form-row three-cols">
    <div className="form-group">
      <label>Warranty (Default)</label>
      <input type="text" name="warranty" value={formData.warranty} onChange={handleInputChange} className="form-input" placeholder="e.g., 1 Year Manufacturer Warranty" />
    </div>
    <div className="form-group">
      <label>Extended Warranty Name</label>
      <input type="text" name="extended_warranty_name" value={formData.extended_warranty_name || ''} onChange={handleInputChange} className="form-input" placeholder="e.g., 6 Months Extended Warranty" />
    </div>
    <div className="form-group">
      <label>Extended Warranty Price (₹)</label>
      <input type="number" step="0.01" name="extended_warranty_price" value={formData.extended_warranty_price || ''} onChange={handleInputChange} className="form-input" placeholder="e.g., 5999" />
    </div>
  </div>
            </div>

            {/* 7. INVENTORY & DIMENSIONS */}
            <div className="form-section">
              <h3>7. Inventory & Dimensions</h3>
              <div className="form-row three-cols">
                <div className="form-group"><label>Stock Qty *</label><input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} required className="form-input" /></div>
                <div className="form-group"><label>Min Alert</label><input type="number" name="minimum_stock_alert" value={formData.minimum_stock_alert} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group">
                  <label>Stock Status</label>
                  <select name="stock_status" value={formData.stock_status} onChange={handleInputChange} className="form-select">
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="pre_order">Pre Order</option>
                  </select>
                </div>
              </div>
              <div className="form-row three-cols">
                <div className="form-group"><label>Weight (kg)</label><input type="number" step="0.001" name="weight" value={formData.weight} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group"><label>Height (cm)</label><input type="number" step="0.01" name="height" value={formData.height} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group"><label>Width (cm)</label><input type="number" step="0.01" name="width" value={formData.width} onChange={handleInputChange} className="form-input" /></div>
              </div>
              <div className="form-row three-cols">
                <div className="form-group"><label>Depth (cm)</label><input type="number" step="0.01" name="depth" value={formData.depth} onChange={handleInputChange} className="form-input" /></div>
                <div className="form-group"><label>Color</label><input type="text" name="color" value={formData.color} onChange={handleInputChange} className="form-input" /></div>
              </div>
            </div>

            {/* 8. FLAGS & POLICIES */}
            <div className="form-section">
              <h3>8. Product Flags & Policies</h3>
              <div className="checkbox-grid">
                <label className="checkbox-label"><input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleInputChange} /> Is New</label>
                <label className="checkbox-label"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} /> Featured</label>
                <label className="checkbox-label"><input type="checkbox" name="is_refurbished" checked={formData.is_refurbished} onChange={handleInputChange} /> Refurbished</label>
                <label className="checkbox-label"><input type="checkbox" name="is_best_seller" checked={formData.is_best_seller} onChange={handleInputChange} /> Best Seller</label>
                <label className="checkbox-label"><input type="checkbox" name="is_trending" checked={formData.is_trending} onChange={handleInputChange} /> Trending</label>
                <label className="checkbox-label"><input type="checkbox" name="is_cod_available" checked={formData.is_cod_available} onChange={handleInputChange} /> COD Available</label>
              </div>
            </div>

            {/* 9. SEO DATA */}
            <div className="form-section">
              <h3>9. Search Engine Optimization (SEO)</h3>
              <div className="form-group"><label>Meta Title</label><input type="text" name="meta_title" value={formData.meta_title} onChange={handleInputChange} className="form-input" /></div>
              <div className="form-group"><label>Meta Description</label><textarea name="meta_description" value={formData.meta_description} onChange={handleInputChange} rows="2" className="form-textarea" /></div>
            </div>

          </form>
        </div>

        <div className="drawer-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button type="submit" form="productForm" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Product Data'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductForm;
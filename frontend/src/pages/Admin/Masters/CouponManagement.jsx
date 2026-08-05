import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import couponService from '../../../services/couponService';
// Assuming you use the same CSS file for layout
import '../Masters/Masters.css'; 

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);

  const initialFormState = { 
    code: '', 
    description: '', 
    discount_type: 'percentage', 
    discount_amount: '', 
    min_purchase_amount: 0,
    max_discount_amount: '',
    valid_from: '',
    valid_until: '',
    usage_limit: '',
    status: 'active' 
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchAllCoupons();
  }, []);

  const fetchAllCoupons = async () => {
    try {
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons", error);
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_amount: coupon.discount_amount,
      min_purchase_amount: coupon.min_purchase_amount || 0,
      max_discount_amount: coupon.max_discount_amount || '',
      valid_from: formatDateForInput(coupon.valid_from),
      valid_until: formatDateForInput(coupon.valid_until),
      usage_limit: coupon.usage_limit || '',
      status: coupon.status
    });
  };

  const clearForm = () => {
    setEditingCoupon(null);
    setFormData(initialFormState);
  };

  const saveCoupon = async () => {
    if (!formData.code || !formData.discount_amount) {
      return alert('Coupon Code and Discount Amount are required.');
    }

    const payload = {
      ...formData,
      code: formData.code.toUpperCase().replace(/\s+/g, ''),
      discount_amount: parseFloat(formData.discount_amount),
      min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
    };

    try {
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, payload);
        alert('Coupon updated successfully!'); // <-- SUCCESS MESSAGE
      } else {
        await couponService.createCoupon(payload);
        alert('Coupon created successfully!'); // <-- SUCCESS MESSAGE
      }
      
      // FIXED: Added 'await' so the table only refreshes AFTER the data is safely in the database
      await fetchAllCoupons(); 
      clearForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving coupon');
    }
  };

  const deleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deleteCoupon(id);
        
        // FIXED: Added 'await'
        await fetchAllCoupons(); 
        
        if (editingCoupon?.id === id) clearForm();
        alert('Coupon deleted successfully!'); // <-- SUCCESS MESSAGE
      } catch (error) {
        alert('Failed to delete coupon');
      }
    }
  };

  const toggleActive = async (coupon) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    try {
      await couponService.updateCoupon(coupon.id, { status: newStatus });
      
      // FIXED: Added 'await'
      await fetchAllCoupons(); 
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="master-page">
      <div className="master-header">
        <div className="header-title">
          <h1>Coupons & Discounts</h1>
          <p>Manage promo codes, percentages, and fixed discounts</p>
        </div>
      </div>

      <div className="master-content-layout">
        {/* LEFT SIDE: TABLE */}
        <div className="master-table-section">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by code or description..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="search-input" 
            />
          </div>

          <table className="master-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length > 0 ? filteredCoupons.map(coupon => (
                <tr key={coupon.id}>
                  <td>
                    <span style={{ fontWeight: 'bold', background: '#eef2ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '4px', letterSpacing: '1px' }}>
                      {coupon.code}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#333' }}>
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_amount}% OFF` : `₹${coupon.discount_amount} OFF`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Min: ₹{coupon.min_purchase_amount}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      {coupon.used_count} / {coupon.usage_limit ? coupon.usage_limit : '∞'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No Expiry'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${coupon.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {coupon.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(coupon)}><FiEdit2 size={14} /></button>
                      <button className="action-btn delete-btn" onClick={() => deleteCoupon(coupon.id)}><FiTrash2 size={14} /></button>
                      <button 
                        className={`action-btn toggle-btn ${coupon.status === 'active' ? 'active' : 'inactive'}`} 
                        onClick={() => toggleActive(coupon)}
                        title={coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {coupon.status === 'active' ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No coupons found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="master-form-section">
          <div className="form-header">
            <h2>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
            {editingCoupon && <button className="btn-clear" onClick={clearForm}><FiX size={18} /></button>}
          </div>
          
          <div className="form-body">
            <div className="form-group">
              <label>Coupon Code *</label>
              <input 
                type="text" 
                name="code" 
                value={formData.code} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="e.g., SUMMER50" 
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                className="form-input" 
                placeholder="Internal note or customer facing text..."
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Discount Type *</label>
                <select name="discount_type" value={formData.discount_type} onChange={handleInputChange} className="form-input">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input 
                  type="number" 
                  name="discount_amount" 
                  value={formData.discount_amount} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder={formData.discount_type === 'percentage' ? "e.g., 15" : "e.g., 500"}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Min Purchase (₹)</label>
                <input type="number" name="min_purchase_amount" value={formData.min_purchase_amount} onChange={handleInputChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Max Discount (₹)</label>
                <input 
                  type="number" 
                  name="max_discount_amount" 
                  value={formData.max_discount_amount} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  placeholder="Cap percentage limits"
                  disabled={formData.discount_type === 'fixed'}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Valid From</label>
                <input type="datetime-local" name="valid_from" value={formData.valid_from} onChange={handleInputChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Valid Until</label>
                <input type="datetime-local" name="valid_until" value={formData.valid_until} onChange={handleInputChange} className="form-input" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Usage Limit (Total)</label>
                <input type="number" name="usage_limit" value={formData.usage_limit} onChange={handleInputChange} className="form-input" placeholder="Leave blank for unlimited" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="form-input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              {editingCoupon && <button className="btn-secondary" onClick={clearForm}>Cancel</button>}
              <button className="btn-primary" onClick={saveCoupon}>
                {editingCoupon ? 'Update Coupon' : 'Save Coupon'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;
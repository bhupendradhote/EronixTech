import React, { useState, useEffect } from 'react';
import quickButtonService from '../../../services/quickButtonService';
import './QuickButtons.css';

const QuickButtons = () => {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    price: 0,
    is_active: true,
  });

  // Refetch function
  const refetchButtons = async () => {
    try {
      setLoading(true);
      const data = await quickButtonService.getAllButtons();
      const parsedButtons = (data.buttons || []).map((b) => ({
        ...b,
        price: parseFloat(b.price) || 0,
      }));
      setButtons(parsedButtons);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load quick buttons');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    let isMounted = true;
    const fetchButtons = async () => {
      try {
        setLoading(true);
        const data = await quickButtonService.getAllButtons();
        if (isMounted) {
          const parsedButtons = (data.buttons || []).map((b) => ({
            ...b,
            price: parseFloat(b.price) || 0,
          }));
          setButtons(parsedButtons);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load quick buttons');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchButtons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Open modal for create / edit
  const openModal = (button) => {
    if (button) {
      setEditingId(button.id);
      setFormData({
        title: button.title,
        description: button.description || '',
        type: button.type,
        price: button.price || 0,
        is_active: button.is_active !== undefined ? button.is_active : true,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        type: '',
        price: 0,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await quickButtonService.updateButton(editingId, formData);
      } else {
        await quickButtonService.createButton(formData);
      }
      closeModal();
      await refetchButtons();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this quick button?')) return;
    try {
      await quickButtonService.deleteButton(id);
      await refetchButtons();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleActive = async (id, currentActive) => {
    const button = buttons.find((b) => b.id === id);
    if (!button) return;
    try {
      await quickButtonService.updateButton(id, { ...button, is_active: !currentActive });
      await refetchButtons();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-10">Loading quick buttons...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="quick-buttons-container">
      <div className="quick-buttons-header">
        <h1 className="quick-buttons-title">Manage Quick Buttons</h1>
        <button onClick={() => openModal()} className="btn-primary">
          + Add New
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buttons.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No quick buttons found
                </td>
              </tr>
            ) : (
              buttons.map((button) => {
                const priceNum = typeof button.price === 'number' ? button.price : parseFloat(String(button.price)) || 0;
                return (
                  <tr key={button.id}>
                    <td>{button.id}</td>
                    <td>{button.title}</td>
                    <td>{button.type}</td>
                    <td>${priceNum.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${button.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {button.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => openModal(button)} className="btn-warning">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(button.id)} className="btn-danger">
                        Delete
                      </button>
                      <button
                        onClick={() => toggleActive(button.id, !!button.is_active)}
                        className={button.is_active ? 'btn-gray' : 'btn-green'}
                      >
                        {button.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingId ? 'Edit Quick Button' : 'Add New Quick Button'}</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="title">Title *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="type">Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Snacks/Drinks">Snacks/Drinks</option>
                  <option value="Combos">Combos</option>
                  <option value="Gaming in bill">Gaming in bill</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="price">Price ($)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-gray">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickButtons;
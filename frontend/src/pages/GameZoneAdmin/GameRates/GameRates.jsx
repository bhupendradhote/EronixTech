import React, { useState, useEffect } from 'react';
import gameRateService from '../../../services/gameRateService';
import './GameRates.css';

const GameRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    is_active: true,
  });

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await gameRateService.getAllRates();
      const parsed = (data.rates || []).map((r) => ({
        ...r,
        price: parseFloat(r.price) || 0,
      }));
      setRates(parsed);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await gameRateService.getAllRates();
        if (mounted) {
          const parsed = (data.rates || []).map((r) => ({
            ...r,
            price: parseFloat(r.price) || 0,
          }));
          setRates(parsed);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load rates');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const openModal = (rate) => {
    if (rate) {
      setEditingId(rate.id);
      setFormData({
        name: rate.name,
        price: rate.price || 0,
        is_active: rate.is_active !== undefined ? rate.is_active : true,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: 0, is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await gameRateService.updateRate(editingId, formData);
      } else {
        await gameRateService.createRate(formData);
      }
      closeModal();
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this rate?')) return;
    try {
      await gameRateService.deleteRate(id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleActive = async (id, current) => {
    const rate = rates.find((r) => r.id === id);
    if (!rate) return;
    try {
      await gameRateService.updateRate(id, { ...rate, is_active: !current });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-10">Loading rates...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="game-rates-container">
      <div className="game-rates-header">
        <h1 className="game-rates-title">Game Rates</h1>
        <button onClick={() => openModal()} className="btn-primary">
          + Add Rate
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">No rates found</td></tr>
            ) : (
              rates.map((rate) => {
                const priceNum = typeof rate.price === 'number' ? rate.price : parseFloat(String(rate.price)) || 0;
                return (
                  <tr key={rate.id}>
                    <td>{rate.id}</td>
                    <td>{rate.name}</td>
                    <td>${priceNum.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${rate.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {rate.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => openModal(rate)} className="btn-warning">Edit</button>
                      <button onClick={() => handleDelete(rate.id)} className="btn-danger">Delete</button>
                      <button
                        onClick={() => toggleActive(rate.id, !!rate.is_active)}
                        className={rate.is_active ? 'btn-gray' : 'btn-green'}
                      >
                        {rate.is_active ? 'Deactivate' : 'Activate'}
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
            <h2 className="modal-title">{editingId ? 'Edit Rate' : 'Add Rate'}</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="name">Name *</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="price">Price ($)</label>
                <input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleChange} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ marginRight: '0.5rem' }} />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-gray">Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRates;
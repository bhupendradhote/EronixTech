import React, { useState, useEffect } from 'react';
import gameDeviceService from '../../../services/gameDeviceService';
import './GameDevices.css';

const GameDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
  });

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await gameDeviceService.getAllDevices();
      setDevices(data.devices || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await gameDeviceService.getAllDevices();
        if (mounted) {
          setDevices(data.devices || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load devices');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const openModal = (device) => {
    if (device) {
      setEditingId(device.id);
      setFormData({
        name: device.name,
        is_active: device.is_active !== undefined ? device.is_active : true,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', is_active: true });
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
        await gameDeviceService.updateDevice(editingId, formData);
      } else {
        await gameDeviceService.createDevice(formData);
      }
      closeModal();
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this device?')) return;
    try {
      await gameDeviceService.deleteDevice(id);
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleActive = async (id, current) => {
    const device = devices.find((d) => d.id === id);
    if (!device) return;
    try {
      await gameDeviceService.updateDevice(id, { ...device, is_active: !current });
      await refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-10">Loading devices...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="game-devices-container">
      <div className="game-devices-header">
        <h1 className="game-devices-title">Game Devices</h1>
        <button onClick={() => openModal()} className="btn-primary">
          + Add Device
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-4">No devices found</td></tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id}>
                  <td>{device.id}</td>
                  <td>{device.name}</td>
                  <td>
                    <span className={`badge ${device.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {device.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => openModal(device)} className="btn-warning">Edit</button>
                    <button onClick={() => handleDelete(device.id)} className="btn-danger">Delete</button>
                    <button
                      onClick={() => toggleActive(device.id, !!device.is_active)}
                      className={device.is_active ? 'btn-gray' : 'btn-green'}
                    >
                      {device.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingId ? 'Edit Device' : 'Add Device'}</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="name">Name *</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
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

export default GameDevices;
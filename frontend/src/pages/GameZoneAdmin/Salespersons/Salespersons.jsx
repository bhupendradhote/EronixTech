import React, { useState, useEffect } from 'react';
import salespersonService from '../../../services/salespersonService';
import './Salespersons.css';

/**
 * @typedef {import('../../../services/salespersonService').Salesperson} Salesperson
 * @typedef {import('../../../services/salespersonService').CreateSalespersonData} CreateSalespersonData
 * @typedef {import('../../../services/salespersonService').UpdateSalespersonData} UpdateSalespersonData
 */

const Salespersons = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        profile_image: '',
        is_active: true,
    });

    const refetch = async () => {
        try {
            setLoading(true);
            const data = await salespersonService.getAll();
            setItems(data.salespersons || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await salespersonService.getAll();
                if (mounted) {
                    setItems(data.salespersons || []);
                    setError(null);
                }
            } catch (err) {
                if (mounted) setError(err.message || 'Failed to load');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => {
            mounted = false;
        };
    }, []);

    const openModal = (item) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                name: item.name,
                email: item.email,
                phone: item.phone || '',
                address: item.address || '',
                profile_image: item.profile_image || '',
                is_active: item.is_active,
                password: '', // password is never returned from the API
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                address: '',
                profile_image: '',
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
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(formData.email || '')) {
            alert('Please enter a valid email address.');
            return;
        }

        // For create, password is required and must be at least 6 characters
        if (!editingId) {
            if (!formData.password || formData.password.length < 6) {
                alert('Password must be at least 6 characters.');
                return;
            }
        } else {
            // For update, if password is provided, validate length
            if (formData.password && formData.password.length < 6) {
                alert('Password must be at least 6 characters.');
                return;
            }
        }

        try {
            if (editingId) {
                // For update, remove password if empty
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await salespersonService.update(editingId, updateData);
            } else {
                await salespersonService.create(formData);
            }
            closeModal();
            await refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deactivate this salesperson?')) return;
        try {
            await salespersonService.delete(id);
            await refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleActive = async (id, current) => {
        const item = items.find((i) => i.id === id);
        if (!item) return;
        try {
            await salespersonService.update(id, { ...item, is_active: !current });
            await refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

    return (
        <div className="salespersons-container">
            <div className="salespersons-header">
                <h1 className="salespersons-title">Salespersons</h1>
                <button onClick={() => openModal()} className="btn-primary">
                    + Add
                </button>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No salespersons found
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phone || '-'}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                item.is_active ? 'badge-active' : 'badge-inactive'
                                            }`}
                                        >
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => openModal(item)} className="btn-warning">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="btn-danger">
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => toggleActive(item.id, !!item.is_active)}
                                            className={item.is_active ? 'btn-gray' : 'btn-green'}
                                        >
                                            {item.is_active ? 'Deactivate' : 'Activate'}
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
                        <h2 className="modal-title">
                            {editingId ? 'Edit' : 'Add'} Salesperson
                        </h2>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name *</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    Password {editingId ? '(leave blank to keep current)' : '*'}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    required={!editingId}
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={2}
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="profile_image">Profile Image URL</label>
                                <input
                                    id="profile_image"
                                    name="profile_image"
                                    type="text"
                                    placeholder="e.g. /uploads/photo.jpg"
                                    value={formData.profile_image || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={!!formData.is_active}
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

export default Salespersons;
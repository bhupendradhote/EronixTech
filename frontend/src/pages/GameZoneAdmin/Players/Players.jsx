import React, { useState, useEffect } from 'react';
import playersService from '../../../services/playersService';
import './Players.css';

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const [filters, setFilters] = useState({
        search: '',
        is_active: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    const fetchPlayers = async (page = 1) => {
        try {
            setLoading(true);
            const data = await playersService.getPlayers({
                ...filters,
                page,
                limit: 20
            });
            setPlayers(data.data || []);
            setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load players');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchPlayers(1);
    };

    const resetFilters = () => {
        setFilters({ search: '', is_active: '' });
        setTimeout(() => fetchPlayers(1), 100);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchPlayers(newPage);
        }
    };

    const toggleStatus = async (id) => {
        try {
            await playersService.togglePlayerStatus(id);
            fetchPlayers(pagination.page);
        } catch (err) {
            alert('Error toggling status: ' + err.message);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && players.length === 0) {
        return <div className="players-container"><div className="loading-text">Loading players...</div></div>;
    }

    return (
        <div className="players-container">
            <div className="players-header">
                <h1 className="players-title">Players Management</h1>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowFilters(!showFilters)}>
                        <i className="fas fa-filter"></i> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                    <button className="btn-primary" onClick={() => fetchPlayers(pagination.page)}>
                        <i className="fas fa-sync"></i> Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-row">
                        <div>
                            <label className="lbl">Search</label>
                            <input type="text" name="search" placeholder="Name, Username, Email, Phone" value={filters.search} onChange={handleFilterChange} className="finp" />
                        </div>
                        <div>
                            <label className="lbl">Status</label>
                            <select name="is_active" value={filters.is_active} onChange={handleFilterChange} className="finp">
                                <option value="">All</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                            <button className="btn-primary" onClick={applyFilters}>Apply</button>
                            <button className="btn-gray" onClick={resetFilters}>Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            {/* <th>Level</th>
                            <th>Coins</th> */}
                            <th>Status</th>
                            <th>Last Login</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-4">No players found</td>
                            </tr>
                        ) : (
                            players.map((player) => (
                                <tr key={player.id}>
                                    <td>{player.id}</td>
                                    <td><strong>{player.username}</strong></td>
                                    <td>{player.full_name}</td>
                                    <td>{player.email || '-'}</td>
                                    <td>{player.phone_number || '-'}</td>
                                    {/* <td style={{ textAlign: 'center' }}>{player.level || 1}</td> */}
                                    {/* <td style={{ textAlign: 'center' }}>{player.coins || 0}</td> */}
                                    <td>
                                        <span className={`badge ${player.is_active ? 'badge-success' : 'badge-danger'}`}>
                                            {player.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{formatDate(player.last_login)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-warning" onClick={() => alert('Edit functionality coming soon')}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className={`${player.is_active ? 'btn-danger' : 'btn-success'}`}
                                            onClick={() => toggleStatus(player.id)}
                                            style={{ marginLeft: '4px' }}
                                            title={player.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            <i className={`fas ${player.is_active ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="pagination-info">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
                    </span>
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Players;
import React, { useState, useEffect } from 'react';
import gameBookingService from '../../../services/gameBookingService';
import tvSyncService from '../../../services/tvSyncService';
import './GameBookingsHistory.css';

const GameBookingsHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    const [filters, setFilters] = useState({
        start_date: '', end_date: '', status: '', payment_mode: '', booking_source: '', search: ''
    });

    const [showFilters, setShowFilters] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');

    // TV / Big Screen View Modal State
    const [showTvModal, setShowTvModal] = useState(false);
    const [tvSession, setTvSession] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const fetchBookings = async (page = 1) => {
        try {
            setLoading(true);
            const cleanFilters = { ...filters };
            if (!cleanFilters.status || cleanFilters.status.trim() === '') {
                delete cleanFilters.status;
            }

            const data = await gameBookingService.getAdminBookings({ ...cleanFilters, page, limit: 20 });
            const bookingsList = data.data || [];
            setBookings(bookingsList);
            setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
            setError(null);

            // Sync active "playing" booking sessions to TV Display Service
            const activePlaying = bookingsList
                .filter(b => b.status === 'playing')
                .map(b => {
                    const startTimeMs = new Date(b.start_time).getTime();
                    const durationMs = (b.duration_minutes || 60) * 60000;
                    const endTimeMs = startTimeMs + durationMs;
                    
                    return {
                        id: 'booking_' + b.id,
                        type: 'booking',
                        device: b.device_name || `Station #${b.device_id}`,
                        customer: b.customer_name || 'Gamer',
                        game: b.game_name || 'Gaming Session',
                        label: `Booking #${b.id} (${b.duration_minutes || 60}m)`,
                        startedAt: startTimeMs,
                        endTime: endTimeMs,
                        amountVal: b.total_price || 0,
                        statusText: 'Playing (Booking)'
                    };
                });

            // Merge with any existing POS sessions so both are visible on TV View
            const existingPosSessions = tvSyncService.getSessions().filter(s => s.type !== 'booking');
            tvSyncService.updateSessions([...existingPosSessions, ...activePlaying]);

        } catch (err) {
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await gameBookingService.getAdminStats({
                start_date: filters.start_date,
                end_date: filters.end_date
            });
            setStats(data.stats || null);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, []);

    // Fixed TV Modal Countdown Timer Effect
    useEffect(() => {
        let timer;
        if (showTvModal && tvSession) {
            const calculateTimeLeft = () => {
                const startTimeMs = new Date(tvSession.start_time).getTime();
                const durationMs = (tvSession.duration_minutes || 60) * 60000;
                const endTime = startTimeMs + durationMs;
                const now = new Date().getTime();
                const diff = Math.floor((endTime - now) / 1000);
                return diff > 0 ? diff : 0;
            };

            setTimeLeft(calculateTimeLeft());
            timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showTvModal, tvSession]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => { fetchBookings(1); fetchStats(); };

    const resetFilters = () => {
        setFilters({ start_date: '', end_date: '', status: '', payment_mode: '', booking_source: '', search: '' });
        setTimeout(() => { fetchBookings(1); fetchStats(); }, 100);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) fetchBookings(newPage);
    };

    const formatCurrency = (amount) => '₹' + (parseFloat(amount) || 0).toFixed(2);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
               d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatTimer = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getStatusBadge = (status) => {
        const classes = {
            'playing': 'badge badge-primary', 'confirmed': 'badge badge-success',
            'completed': 'badge badge-secondary', 'held': 'badge badge-warning',
            'cancelled': 'badge badge-danger', 'no_show': 'badge badge-dark', 'pending': 'badge badge-warning'
        };
        return classes[status] || 'badge badge-secondary';
    };

    const changeStatus = async (id, newStatus) => {
        if (!window.confirm(`Mark this booking as ${newStatus.toUpperCase()}?`)) return;
        try {
            const res = await gameBookingService.updateStatus(id, newStatus);
            fetchBookings(pagination.page);
            fetchStats();
            if (newStatus === 'playing' && res.booking) {
                openTvView(res.booking);
            }
        } catch (err) {
            alert('Error updating status: ' + (err.message || err));
        }
    };

    const openTvView = (booking) => {
        setTvSession(booking);
        setShowTvModal(true);
    };

    const openPaymentModal = (booking) => {
        setSelectedBooking(booking);
        setPaymentAmount(booking.due_amount ? booking.due_amount.toString() : '');
        setPaymentMode('cash');
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedBooking) return;
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) return alert('Please enter a valid amount');
        try {
            const result = await gameBookingService.receivePayment(selectedBooking.id, { amount, payment_mode: paymentMode });
            if (result.success) {
                alert(`Payment received successfully!`);
                setShowPaymentModal(false);
                fetchBookings(pagination.page);
                fetchStats();
            }
        } catch (err) {
            alert(err.message || 'Payment failed');
        }
    };

    if (loading && bookings.length === 0) {
        return <div className="game-bookings-container"><div className="loading-text">Loading bookings...</div></div>;
    }

    return (
        <div className="game-bookings-container">
            <div className="game-bookings-header">
                <h1 className="game-bookings-title"><i className="fas fa-gamepad"></i> Game Bookings</h1>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowFilters(!showFilters)}>
                        <i className="fas fa-filter"></i> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                    <button className="btn-primary" onClick={() => tvSyncService.openTvDisplay()} style={{ background: '#8b5cf6' }}>
                        <i className="fas fa-tv"></i> Open Unified TV View
                    </button>
                    <button className="btn-primary" onClick={() => { fetchBookings(); fetchStats(); }}>
                        <i className="fas fa-sync"></i> Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#a855f7' }}><i className="fas fa-ticket-alt"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Total Bookings</span>
                            <span className="stat-value">{stats.total_bookings || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#3b82f6' }}><i className="fas fa-play-circle"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Active (Playing)</span>
                            <span className="stat-value">{stats.active_playing || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#22c55e' }}><i className="fas fa-rupee-sign"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Total Revenue</span>
                            <span className="stat-value">{formatCurrency(stats.total_revenue)}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#ef4444' }}><i className="fas fa-exclamation-circle"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Total Due</span>
                            <span className="stat-value">{formatCurrency(stats.total_due)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-row">
                        <div>
                            <label className="lbl">Start Date</label>
                            <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="finp" />
                        </div>
                        <div>
                            <label className="lbl">End Date</label>
                            <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="finp" />
                        </div>
                        <div>
                            <label className="lbl">Search</label>
                            <input type="text" name="search" placeholder="ID, Customer, Mobile" value={filters.search} onChange={handleFilterChange} className="finp" />
                        </div>
                    </div>
                    <div className="filters-row">
                        <div>
                            <label className="lbl">Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="finp">
                                <option value="">All Statuses</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="playing">Playing</option>
                                <option value="pending">Pending</option>
                                <option value="held">Held</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="lbl">Source</label>
                            <select name="booking_source" value={filters.booking_source} onChange={handleFilterChange} className="finp">
                                <option value="">All Sources</option>
                                <option value="online">Online</option>
                                <option value="walk_in">Walk-in</option>
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
                            <th>ID</th><th>Time / Duration</th><th>Customer</th><th>Device</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr><td colSpan="9" className="text-center py-4">No bookings found</td></tr>
                        ) : (
                            bookings.map((b) => (
                                <tr key={b.id}>
                                    <td><strong>#{b.id}</strong><br/><small style={{color:'#94a3b8'}}>{b.booking_source}</small></td>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{formatDateTime(b.start_time)}</div>
                                        <div style={{ fontSize: '11px', color: '#a855f7' }}>{b.duration_minutes} Mins</div>
                                    </td>
                                    <td>
                                        <div>{b.customer_name || 'Walk-in'}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.customer_phone || ''}</div>
                                    </td>
                                    <td>
                                        <div>{b.device_name || `ID: ${b.device_id}`}</div>
                                        {b.game_name && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.game_name}</div>}
                                    </td>
                                    <td><strong>{formatCurrency(b.total_price)}</strong></td>
                                    <td>{formatCurrency(b.paid_amount)}</td>
                                    <td style={{ color: b.due_amount > 0 ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>{formatCurrency(b.due_amount)}</td>
                                    <td><span className={getStatusBadge(b.status)}>{b.status ? b.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                            {b.due_amount > 0 && (
                                                <button className="btn-success" onClick={() => openPaymentModal(b)} title="Receive Payment">
                                                    <i className="fas fa-hand-holding-usd"></i>
                                                </button>
                                            )}
                                            {b.status === 'playing' && (
                                                <>
                                                    <button className="btn-primary" onClick={() => openTvView(b)} title="TV Big Screen View" style={{ background: '#8b5cf6' }}>
                                                        <i className="fas fa-tv"></i>
                                                    </button>
                                                    <button className="btn-gray" onClick={() => changeStatus(b.id, 'completed')} title="Mark Completed">
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                </>
                                            )}
                                            {(b.status === 'confirmed' || b.status === 'held' || b.status === 'pending') && (
                                                <button className="btn-primary" onClick={() => changeStatus(b.id, 'playing')} title="Start Session">
                                                    <i className="fas fa-play"></i>
                                                </button>
                                            )}
                                            {b.status !== 'cancelled' && b.status !== 'completed' && (
                                                <button className="btn-danger" onClick={() => changeStatus(b.id, 'cancelled')} title="Cancel">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                        </div>
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
                    <button className="pagination-btn" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="pagination-info">Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)</span>
                    <button className="pagination-btn" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedBooking && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '420px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Receive Payment</h2>
                            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="payment-info">
                                <div><strong>Booking ID:</strong> #{selectedBooking.id}</div>
                                <div><strong>Customer:</strong> {selectedBooking.customer_name || 'Walk-in'}</div>
                                <div><strong>Total Amount:</strong> {formatCurrency(selectedBooking.total_price)}</div>
                                <div><strong>Paid:</strong> {formatCurrency(selectedBooking.paid_amount)}</div>
                                <div><strong>Due Amount:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatCurrency(selectedBooking.due_amount)}</span></div>
                            </div>
                            <div className="form-group">
                                <label className="lbl">Payment Amount</label>
                                <input type="number" className="finp" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter amount" step="0.01" min="0.01" max={selectedBooking.due_amount} />
                            </div>
                            <div className="form-group">
                                <label className="lbl">Payment Mode</label>
                                <select className="finp" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                    <option value="credit">Credit</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-gray" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handlePaymentSubmit}>Confirm Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* TV Big Screen Timer Modal */}
            {showTvModal && tvSession && (
                <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.95)' }}>
                    <div style={{ textAlign: 'center', color: '#fff', width: '100%', maxWidth: '800px', padding: '40px' }}>
                        <div style={{ fontSize: '1.5rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            🎮 {tvSession.device_name || `Station #${tvSession.device_id}`}
                        </div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>{tvSession.customer_name || 'Gamer'}</h1>
                        {tvSession.game_name && <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '30px' }}>Playing: {tvSession.game_name}</p>}

                        <div style={{ 
                            fontSize: '7rem', 
                            fontWeight: '800', 
                            fontFamily: 'monospace', 
                            color: timeLeft < 300 ? '#ef4444' : '#22c55e',
                            background: '#1e293b',
                            padding: '30px',
                            borderRadius: '20px',
                            border: '4px solid #334155',
                            boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                            marginBottom: '40px'
                        }}>
                            {formatTimer(timeLeft)}
                        </div>

                        {timeLeft === 0 && (
                            <div style={{ fontSize: '2rem', color: '#ef4444', fontWeight: 'bold', marginBottom: '30px', animation: 'pulse 1s infinite' }}>
                                ⚠️ TIME IS UP!
                            </div>
                        )}

                        <button 
                            className="btn-primary" 
                            style={{ fontSize: '1.2rem', padding: '15px 40px', background: '#ef4444', border: 'none' }}
                            onClick={() => setShowTvModal(false)}
                        >
                            Close TV View
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameBookingsHistory;
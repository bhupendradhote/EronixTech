import React, { useState, useEffect } from 'react';
import salesService from '../../../services/salesService';
import './SalesHistory.css';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        customer_id: '',
        salesperson_id: '',
        payment_mode: '',
        status: '',
        search: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    // Payment Modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');

    const fetchSales = async (page = 1) => {
        try {
            setLoading(true);
            const data = await salesService.getSalesList({
                ...filters,
                page,
                limit: 20
            });
            setSales(data.data || []);
            setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load sales');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await salesService.getSalesStats({
                start_date: filters.start_date,
                end_date: filters.end_date
            });
            setStats(data.stats || null);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchSales();
        fetchStats();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchSales(1);
        fetchStats();
    };

    const resetFilters = () => {
        setFilters({
            start_date: '',
            end_date: '',
            customer_id: '',
            salesperson_id: '',
            payment_mode: '',
            status: '',
            search: ''
        });
        setTimeout(() => {
            fetchSales(1);
            fetchStats();
        }, 100);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchSales(newPage);
        }
    };

    const formatCurrency = (amount) => {
        return '₹' + (parseFloat(amount) || 0).toFixed(2);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const classes = {
            'completed': 'badge badge-success',
            'partial': 'badge badge-warning',
            'pending': 'badge badge-danger'
        };
        return classes[status] || 'badge badge-secondary';
    };

    const getPaymentBadge = (mode) => {
        const colors = {
            'cash': '#22c55e',
            'card': '#3b82f6',
            'upi': '#a855f7',
            'credit': '#f59e0b',
            'wallet': '#ec4899'
        };
        return colors[mode] || '#94a3b8';
    };

    // ========== Print Invoice ==========
    const printInvoice = (sale) => {
        const win = window.open('', '_blank', 'width=800,height=600');
        if (!win) {
            alert('Please allow popups for this site');
            return;
        }

        const items = sale.items || [];
        const itemRows = items.map((item, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${item.product_name || item.name}</td>
                <td>${item.size || '-'}</td>
                <td>${item.color || '-'}</td>
                <td>${item.qty}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${item.discount_percent || 0}%</td>
                <td>${formatCurrency(item.total)}</td>
            </tr>
        `).join('');

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${sale.invoice_no}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #fff; color: #333; }
                .invoice-box { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; }
                .header .right { text-align: right; }
                .details { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .details table { width: 100%; }
                .details td { padding: 4px 8px; }
                .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .items-table th { background: #f0f0f0; padding: 8px; text-align: left; border-bottom: 1px solid #ccc; }
                .items-table td { padding: 8px; border-bottom: 1px solid #eee; }
                .totals { text-align: right; margin-top: 20px; }
                .totals table { display: inline-block; }
                .totals td { padding: 4px 12px; }
                .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; text-align: center; font-size: 12px; color: #888; }
                .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                .status-completed { background: #d4edda; color: #155724; }
                .status-partial { background: #fff3cd; color: #856404; }
                .status-pending { background: #f8d7da; color: #721c24; }
                .terms { margin-top: 20px; padding: 10px; background: #f9f9f9; border-radius: 4px; font-size: 12px; white-space: pre-line; }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <div class="header">
                    <div>
                        <h1>ERONIX TECH</h1>
                        <div>Premium Gaming Zone</div>
                        <div>Invoice</div>
                    </div>
                    <div class="right">
                        <div><strong>Invoice #:</strong> ${sale.invoice_no}</div>
                        <div><strong>Date:</strong> ${formatDate(sale.sale_date)}</div>
                        <div><strong>Status:</strong> <span class="status-badge status-${sale.status}">${sale.status}</span></div>
                    </div>
                </div>

                <div class="details">
                    <table>
                        <tr><td><strong>Customer:</strong></td><td>${sale.customer_name || 'Walk-in'}</td></tr>
                        <tr><td><strong>Mobile:</strong></td><td>${sale.customer_mobile || '-'}</td></tr>
                        <tr><td><strong>Salesperson:</strong></td><td>${sale.salesperson_name || '-'}</td></tr>
                    </table>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Item</th>
                            <th>Size</th>
                            <th>Color</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Disc%</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                    </tbody>
                </table>

                <div class="totals">
                    <table>
                        <tr><td>Subtotal:</td><td>${formatCurrency(sale.subtotal)}</td></tr>
                        <tr><td>Discount:</td><td>-${formatCurrency(sale.discount_amount)}</td></tr>
                        <tr><td>Tax:</td><td>${formatCurrency(sale.tax_amount)}</td></tr>
                        <tr><td>Round Off:</td><td>${formatCurrency(sale.round_off)}</td></tr>
                        <tr><td><strong>Total:</strong></td><td><strong>${formatCurrency(sale.total_amount)}</strong></td></tr>
                        <tr><td>Paid:</td><td>${formatCurrency(sale.paid_amount)}</td></tr>
                        <tr><td><strong>Due:</strong></td><td><strong>${formatCurrency(sale.due_amount)}</strong></td></tr>
                    </table>
                </div>

                ${sale.terms ? `<div class="terms"><strong>Terms & Conditions:</strong><br>${sale.terms}</div>` : ''}

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>This is a computer-generated invoice.</p>
                </div>
            </div>
            <script>
                window.onload = function() { window.print(); }
            <\/script>
        </body>
        </html>
        `;

        win.document.write(html);
        win.document.close();
    };

    // ========== Receive Payment ==========
    const openPaymentModal = (sale) => {
        setSelectedSale(sale);
        setPaymentAmount(sale.due_amount ? sale.due_amount.toString() : '');
        setPaymentMode('cash');
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedSale) return;
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (amount > parseFloat(selectedSale.due_amount)) {
            alert('Amount cannot exceed due amount');
            return;
        }
        try {
            const result = await salesService.receivePayment(selectedSale.id, {
                amount,
                payment_mode: paymentMode
            });
            if (result.success) {
                alert(`Payment of ${formatCurrency(amount)} received successfully!`);
                setShowPaymentModal(false);
                fetchSales(pagination.page);
                fetchStats();
            }
        } catch (err) {
            alert(err.message || 'Payment failed');
        }
    };

    if (loading && sales.length === 0) {
        return <div className="sales-history-container"><div className="loading-text">Loading sales...</div></div>;
    }

    return (
        <div className="sales-history-container">
            <div className="sales-history-header">
                <h1 className="sales-history-title">Sales History</h1>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowFilters(!showFilters)}>
                        <i className="fas fa-filter"></i> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                    <button className="btn-primary" onClick={() => { fetchSales(); fetchStats(); }}>
                        <i className="fas fa-sync"></i> Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#a855f7' }}><i className="fas fa-shopping-cart"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Total Orders</span>
                            <span className="stat-value">{stats.total_orders || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#22c55e' }}><i className="fas fa-rupee-sign"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Revenue</span>
                            <span className="stat-value">{formatCurrency(stats.total_revenue)}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#3b82f6' }}><i className="fas fa-check-circle"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Paid</span>
                            <span className="stat-value">{formatCurrency(stats.total_paid)}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#ef4444' }}><i className="fas fa-exclamation-circle"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Due</span>
                            <span className="stat-value">{formatCurrency(stats.total_due)}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#f59e0b' }}><i className="fas fa-users"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Unique Customers</span>
                            <span className="stat-value">{stats.unique_customers || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#ec4899' }}><i className="fas fa-user-tie"></i></div>
                        <div className="stat-info">
                            <span className="stat-label">Active Salespersons</span>
                            <span className="stat-value">{stats.active_salespersons || 0}</span>
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
                            <input type="text" name="search" placeholder="Invoice #, Customer, Mobile" value={filters.search} onChange={handleFilterChange} className="finp" />
                        </div>
                    </div>
                    <div className="filters-row">
                        <div>
                            <label className="lbl">Payment Mode</label>
                            <select name="payment_mode" value={filters.payment_mode} onChange={handleFilterChange} className="finp">
                                <option value="">All</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="upi">UPI</option>
                                <option value="credit">Credit</option>
                                <option value="wallet">Wallet</option>
                            </select>
                        </div>
                        <div>
                            <label className="lbl">Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="finp">
                                <option value="">All</option>
                                <option value="completed">Completed</option>
                                <option value="partial">Partial</option>
                                <option value="pending">Pending</option>
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
                            <th>Invoice</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Salesperson</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Due</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="text-center py-4">No sales found</td>
                            </tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.id}>
                                    <td><strong>{sale.invoice_no}</strong></td>
                                    <td>{formatDate(sale.sale_date)}</td>
                                    <td>
                                        <div>{sale.customer_name || 'Walk-in'}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{sale.customer_mobile || ''}</div>
                                    </td>
                                    <td>{sale.salesperson_name || '—'}</td>
                                    <td style={{ textAlign: 'center' }}>{sale.item_count || 0}</td>
                                    <td><strong>{formatCurrency(sale.total_amount)}</strong></td>
                                    <td>{formatCurrency(sale.paid_amount)}</td>
                                    <td style={{ color: sale.due_amount > 0 ? '#ef4444' : '#22c55e' }}>
                                        {formatCurrency(sale.due_amount)}
                                    </td>
                                    <td>
                                        <span className="badge badge-payment" style={{ 
                                            borderColor: getPaymentBadge(sale.payment_mode) + '44',
                                            color: getPaymentBadge(sale.payment_mode)
                                        }}>
                                            {sale.payment_mode ? sale.payment_mode.toUpperCase() : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={getStatusBadge(sale.status)}>
                                            {sale.status || '—'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-warning" onClick={() => window.location.href = `/admin/game-zone/sales/${sale.id}`} title="View Details">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button className="btn-primary" onClick={() => printInvoice(sale)} style={{ marginLeft: '4px' }} title="Print Invoice">
                                            <i className="fas fa-print"></i>
                                        </button>
                                        {sale.due_amount > 0 && (
                                            <button className="btn-success" onClick={() => openPaymentModal(sale)} style={{ marginLeft: '4px' }} title="Receive Payment">
                                                <i className="fas fa-hand-holding-usd"></i>
                                            </button>
                                        )}
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

            {/* Payment Modal */}
            {showPaymentModal && selectedSale && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '420px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Receive Payment</h2>
                            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="payment-info">
                                <div><strong>Invoice:</strong> {selectedSale.invoice_no}</div>
                                <div><strong>Customer:</strong> {selectedSale.customer_name || 'Walk-in'}</div>
                                <div><strong>Total Amount:</strong> {formatCurrency(selectedSale.total_amount)}</div>
                                <div><strong>Paid:</strong> {formatCurrency(selectedSale.paid_amount)}</div>
                                <div><strong>Due Amount:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatCurrency(selectedSale.due_amount)}</span></div>
                            </div>
                            <div className="form-group">
                                <label className="lbl">Payment Amount</label>
                                <input type="number" className="finp" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter amount" step="0.01" min="0.01" max={selectedSale.due_amount} />
                            </div>
                            <div className="form-group">
                                <label className="lbl">Payment Mode</label>
                                <select className="finp" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                    <option value="credit">Credit</option>
                                    <option value="wallet">Wallet</option>
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
        </div>
    );
};

export default SalesHistory;
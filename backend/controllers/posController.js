const POSModel = require('../models/posModel');
const db = require('../config/db');

// Helper: generate invoice number
function generateInvoiceNo() {
    const now = new Date();
    const prefix = 'INV' + now.getFullYear().toString().slice(-2) +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    return prefix + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
}

// ========== Customers ==========
exports.getCustomers = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const customers = await POSModel.getCustomers(tenantId);
        res.json({ success: true, customers });
    } catch (error) {
        console.error('Get Customers Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const { full_name, phone_number, email, username } = req.body;
        if (!full_name) return res.status(400).json({ message: 'Full name required' });
        const id = await POSModel.addCustomer({ username, email, full_name, phone_number });
        const [customer] = await db.execute(
            'SELECT id, full_name AS name, phone_number AS mobile FROM game_users WHERE id = ?',
            [id]
        );
        res.json({ success: true, customer: customer[0] });
    } catch (error) {
        console.error('Add Customer Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Salespersons ==========
exports.getSalespersons = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const list = await POSModel.getSalespersons(tenantId);
        res.json({ success: true, salespersons: list });
    } catch (error) {
        console.error('Get Salespersons Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Quick Buttons ==========
exports.getQuickButtons = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const buttons = await POSModel.getQuickButtons(tenantId);
        res.json({ success: true, buttons });
    } catch (error) {
        console.error('Get Quick Buttons Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Save Invoice ==========
exports.saveInvoice = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const createdBy = req.user?.id || null;
        const data = req.body;

        if (!data.items || !data.items.length) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        // Recalculate totals
        let subtotal = 0, taxTotal = 0;
        for (const item of data.items) {
            const line = item.qty * item.price * (1 - item.discount / 100);
            subtotal += line;
            taxTotal += line * (item.gst || 0) / (100 + (item.gst || 0));
        }
        const discPct = parseFloat(data.discount_percent) || 0;
        const discAmt = subtotal * discPct / 100;
        const afterDisc = subtotal - discAmt;
        const roundOff = Math.round(afterDisc) - afterDisc;
        const total = Math.round(afterDisc);

        const paidAmount = parseFloat(data.paid_amount) || 0;
        const dueAmount = Math.max(0, total - paidAmount);
        const status = dueAmount > 0 ? 'partial' : 'completed';
        const invoiceNo = generateInvoiceNo();

        // Prepare items
        const itemsToSave = data.items.map(item => {
            const line = item.qty * item.price * (1 - item.discount / 100);
            const gst = item.gst || 0;
            const taxAmt = gst > 0 ? (line * gst / (100 + gst)) : 0;
            return {
                ...item,
                tax_amount: taxAmt,
                total: line
            };
        });

        // Get customer & salesperson names from request
        const customerName = data.customer_name?.trim() || 'Walk-in Customer';
        const customerMobile = data.customer_mobile?.trim() || '';
        const salespersonName = data.salesperson_name?.trim() || null;

        const saleData = {
            tenantId,
            customerId: data.customer_id || null,
            customerName,
            customerMobile,
            salespersonId: data.salesperson_id || null,
            salespersonName,
            saleDate: new Date().toISOString().slice(0, 10),
            items: itemsToSave,
            discountPercent: discPct,
            discountAmount: discAmt,
            taxAmount: taxTotal,
            roundOff: roundOff,
            totalAmount: total,
            paidAmount: paidAmount,
            dueAmount: dueAmount,
            paymentMode: data.payment_mode || 'cash',
            status: status,
            notes: data.notes || '',
            terms: data.terms || '',
            createdBy: createdBy,
            invoiceNo: invoiceNo,
            subtotal: subtotal,
        };

        const saleId = await POSModel.saveInvoice(saleData);

        res.json({
            success: true,
            message: 'Invoice saved',
            invoiceNo,
            saleId
        });
    } catch (error) {
        console.error('Save Invoice Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Held Bills ==========
exports.getHeldBills = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const bills = await POSModel.getHeldBills(tenantId);
        res.json({ success: true, bills });
    } catch (error) {
        console.error('Get Held Bills Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.holdBill = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const createdBy = req.user?.id || null;
        const { label, bill_data } = req.body;
        if (!label || !bill_data) {
            return res.status(400).json({ message: 'Label and bill data required' });
        }
        await POSModel.holdBill(tenantId, label, bill_data, createdBy);
        res.json({ success: true, message: 'Bill held' });
    } catch (error) {
        console.error('Hold Bill Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.recallBill = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const id = req.params.id;
        const data = await POSModel.recallBill(id, tenantId);
        if (data) {
            res.json({ success: true, data });
        } else {
            res.status(404).json({ success: false, message: 'Bill not found' });
        }
    } catch (error) {
        console.error('Recall Bill Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Sales History ==========

// @desc    Get sales list with pagination and filters
// @route   GET /api/pos/sales/list
// @access  Admin
exports.getSalesList = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const {
            start_date, end_date, customer_id, salesperson_id,
            payment_mode, status, search, page = 1, limit = 20
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let sql = `SELECT 
            s.id, s.invoice_no, s.sale_date, s.customer_name, s.customer_mobile, 
            s.salesperson_name, s.total_amount, s.paid_amount, s.due_amount, 
            s.payment_mode, s.status, s.created_at,
            (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
            FROM sales s 
            WHERE s.tenant_id = ?`;
        const params = [tenantId];

        if (start_date) {
            sql += ' AND s.sale_date >= ?';
            params.push(start_date);
        }
        if (end_date) {
            sql += ' AND s.sale_date <= ?';
            params.push(end_date);
        }
        if (customer_id) {
            sql += ' AND s.customer_id = ?';
            params.push(customer_id);
        }
        if (salesperson_id) {
            sql += ' AND s.salesperson_id = ?';
            params.push(salesperson_id);
        }
        if (payment_mode) {
            sql += ' AND s.payment_mode = ?';
            params.push(payment_mode);
        }
        if (status) {
            sql += ' AND s.status = ?';
            params.push(status);
        }
        if (search) {
            sql += ' AND (s.invoice_no LIKE ? OR s.customer_name LIKE ? OR s.customer_mobile LIKE ?)';
            const like = `%${search}%`;
            params.push(like, like, like);
        }

        // Count total
        const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
        const [countRows] = await db.execute(countSql, params);
        const total = countRows[0]?.total || 0;

        sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [rows] = await db.execute(sql, params);

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get Sales List Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get sales statistics
// @route   GET /api/pos/sales/stats
// @access  Admin
exports.getSalesStats = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { start_date, end_date } = req.query;

        let sql = `SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(SUM(paid_amount), 0) as total_paid,
            COALESCE(SUM(due_amount), 0) as total_due,
            COUNT(DISTINCT customer_id) as unique_customers,
            COUNT(DISTINCT salesperson_id) as active_salespersons
            FROM sales 
            WHERE tenant_id = ?`;
        const params = [tenantId];

        if (start_date) {
            sql += ' AND sale_date >= ?';
            params.push(start_date);
        }
        if (end_date) {
            sql += ' AND sale_date <= ?';
            params.push(end_date);
        }

        const [rows] = await db.execute(sql, params);
        res.json({
            success: true,
            stats: rows[0] || {}
        });
    } catch (error) {
        console.error('Get Sales Stats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single sale with items (for detail view)
// @route   GET /api/pos/sales/:id
// @access  Admin
exports.getSaleById = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { id } = req.params;

        // Get sale details
        const [saleRows] = await db.execute(
            `SELECT * FROM sales WHERE id = ? AND tenant_id = ?`,
            [id, tenantId]
        );
        if (!saleRows.length) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Get sale items
        const [itemRows] = await db.execute(
            `SELECT * FROM sale_items WHERE sale_id = ?`,
            [id]
        );

        res.json({
            success: true,
            sale: {
                ...saleRows[0],
                items: itemRows
            }
        });
    } catch (error) {
        console.error('Get Sale By ID Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Receive Payment ==========
// @desc    Receive payment for a sale
// @route   POST /api/pos/sales/:id/payment
// @access  Admin
exports.receivePayment = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { id } = req.params;
        const { amount, payment_mode } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const [saleRows] = await db.execute(
            'SELECT * FROM sales WHERE id = ? AND tenant_id = ?',
            [id, tenantId]
        );
        if (!saleRows.length) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        const sale = saleRows[0];

        if (parseFloat(sale.due_amount) <= 0) {
            return res.status(400).json({ message: 'No due amount to pay' });
        }

        const paidAmount = parseFloat(amount);
        if (paidAmount > parseFloat(sale.due_amount)) {
            return res.status(400).json({ message: 'Amount exceeds due amount' });
        }

        const newPaid = parseFloat(sale.paid_amount) + paidAmount;
        const newDue = parseFloat(sale.total_amount) - newPaid;
        const newStatus = newDue <= 0 ? 'completed' : 'partial';

        await db.execute(
            `UPDATE sales 
             SET paid_amount = ?, due_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [newPaid, newDue, newStatus, id]
        );

        res.json({
            success: true,
            message: 'Payment received',
            newPaid,
            newDue,
            newStatus
        });
    } catch (error) {
        console.error('Receive Payment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
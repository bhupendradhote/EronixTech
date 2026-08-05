const db = require('../config/db');

// Get sales list with filters and pagination
exports.getSalesList = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { 
            start_date, 
            end_date, 
            customer_id, 
            salesperson_id, 
            payment_mode,
            status,
            page = 1,
            limit = 20,
            search = ''
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClauses = ['s.tenant_id = ?'];
        let params = [tenantId];

        if (start_date) {
            whereClauses.push('DATE(s.sale_date) >= ?');
            params.push(start_date);
        }
        if (end_date) {
            whereClauses.push('DATE(s.sale_date) <= ?');
            params.push(end_date);
        }
        if (customer_id) {
            whereClauses.push('s.customer_id = ?');
            params.push(customer_id);
        }
        if (salesperson_id) {
            whereClauses.push('s.salesperson_id = ?');
            params.push(salesperson_id);
        }
        if (payment_mode) {
            whereClauses.push('s.payment_mode = ?');
            params.push(payment_mode);
        }
        if (status) {
            whereClauses.push('s.status = ?');
            params.push(status);
        }
        if (search) {
            whereClauses.push('(s.invoice_no LIKE ? OR s.customer_name LIKE ? OR s.customer_mobile LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        // Count total
        const countSql = `SELECT COUNT(*) as total FROM sales s ${whereClause}`;
        const [countRows] = await db.execute(countSql, params);
        const totalItems = countRows[0].total;

        // Get data
        const sql = `
            SELECT 
                s.id,
                s.invoice_no,
                s.customer_id,
                s.customer_name,
                s.customer_mobile,
                s.salesperson_id,
                s.salesperson_name,
                s.sale_date,
                s.subtotal,
                s.discount_percent,
                s.discount_amount,
                s.tax_amount,
                s.round_off,
                s.total_amount,
                s.paid_amount,
                s.due_amount,
                s.payment_mode,
                s.status,
                s.notes,
                s.created_at,
                (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
            FROM sales s
            ${whereClause}
            ORDER BY s.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const dataParams = [...params, parseInt(limit), offset];
        const [rows] = await db.execute(sql, dataParams);

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalItems,
                totalPages: Math.ceil(totalItems / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get Sales List Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single sale with items
exports.getSaleById = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { id } = req.params;

        // Get sale
        const [saleRows] = await db.execute(
            'SELECT * FROM sales WHERE id = ? AND tenant_id = ?',
            [id, tenantId]
        );

        if (saleRows.length === 0) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Get items
        const [items] = await db.execute(
            'SELECT * FROM sale_items WHERE sale_id = ?',
            [id]
        );

        res.json({
            success: true,
            sale: saleRows[0],
            items
        });
    } catch (error) {
        console.error('Get Sale By ID Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get sales stats (summary)
exports.getSalesStats = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { start_date, end_date } = req.query;

        let whereClauses = ['tenant_id = ?'];
        let params = [tenantId];

        if (start_date) {
            whereClauses.push('DATE(sale_date) >= ?');
            params.push(start_date);
        }
        if (end_date) {
            whereClauses.push('DATE(sale_date) <= ?');
            params.push(end_date);
        }

        const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        const sql = `
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_amount) as total_revenue,
                SUM(paid_amount) as total_paid,
                SUM(due_amount) as total_due,
                AVG(total_amount) as avg_order_value,
                COUNT(DISTINCT customer_id) as unique_customers,
                COUNT(DISTINCT salesperson_id) as active_salespersons
            FROM sales
            ${whereClause}
        `;
        const [rows] = await db.execute(sql, params);

        res.json({
            success: true,
            stats: rows[0] || {
                total_orders: 0,
                total_revenue: 0,
                total_paid: 0,
                total_due: 0,
                avg_order_value: 0,
                unique_customers: 0,
                active_salespersons: 0
            }
        });
    } catch (error) {
        console.error('Get Sales Stats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const db = require('../config/db');

class POSModel {
    // ---- Customers (from game_users) ----
    static async getCustomers(tenantId) {
        const [rows] = await db.execute(
            `SELECT id, full_name AS name, phone_number AS mobile, email, username 
             FROM game_users 
             WHERE is_active = 1 
             ORDER BY full_name LIMIT 300`,
            [tenantId] // tenant_id not in game_users, but we can ignore or add if needed
        );
        return rows;
    }

    static async addCustomer(data) {
        const { username, email, full_name, phone_number } = data;
        const finalUsername = username || full_name.toLowerCase().replace(/\s/g, '') + Date.now();
        const [result] = await db.execute(
            `INSERT INTO game_users (username, email, full_name, phone_number, is_active, password_hash) 
             VALUES (?, ?, ?, ?, 1, '')`,
            [finalUsername, email || null, full_name, phone_number || null]
        );
        return result.insertId;
    }

    // ---- Salespersons ----
    static async getSalespersons(tenantId) {
        const [rows] = await db.execute(
            'SELECT id, name FROM salespersons WHERE tenant_id = ? AND is_active = 1 ORDER BY name',
            [tenantId]
        );
        return rows;
    }

    // ---- Quick Buttons (products) ----
    static async getQuickButtons(tenantId) {
        const [rows] = await db.execute(
            'SELECT id, title AS name, type, price, description FROM quick_buttons WHERE is_active = 1 ORDER BY type, title'
        );
        return rows;
    }

    // ---- Save Invoice ----
    static async saveInvoice(data) {
        const {
            tenantId,
            customerId,
            customerName,
            customerMobile,
            salespersonId,
            salespersonName,
            saleDate,
            items,
            discountPercent,
            discountAmount,
            taxAmount,
            roundOff,
            totalAmount,
            paidAmount,
            dueAmount,
            paymentMode,
            status,
            notes,
            terms,
            createdBy,
            invoiceNo,
            subtotal,
        } = data;

        // Insert sale
        const [saleResult] = await db.execute(
            `INSERT INTO sales 
            (tenant_id, invoice_no, customer_id, customer_name, customer_mobile, salesperson_id, salesperson_name,
             sale_date, subtotal, discount_percent, discount_amount, tax_amount, round_off, total_amount,
             paid_amount, due_amount, payment_mode, status, notes, terms, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tenantId, invoiceNo, customerId || null, customerName, customerMobile || null,
                salespersonId || null, salespersonName,
                saleDate, subtotal, discountPercent || 0, discountAmount || 0, taxAmount || 0, roundOff || 0,
                totalAmount, paidAmount || 0, dueAmount || 0, paymentMode || 'cash',
                status || 'completed', notes || null, terms || null, createdBy || null
            ]
        );
        const saleId = saleResult.insertId;

        // Insert sale items
        for (const item of items) {
            await db.execute(
                `INSERT INTO sale_items 
                (sale_id, product_id, product_name, hsn_code, size, color, qty, unit, mrp, unit_price, discount_percent, tax_percent, tax_amount, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    saleId,
                    item.product_id || null,
                    item.name,
                    item.hsn_code || null,
                    item.size || null,
                    item.color || null,
                    item.qty || 1,
                    item.unit || 'pcs',
                    item.mrp || 0,
                    item.price || 0,
                    item.discount || 0,
                    item.gst || 0,
                    item.tax_amount || 0,
                    item.total || 0
                ]
            );
        }

        return saleId;
    }

    // ---- Held Bills ----
    static async getHeldBills(tenantId) {
        const [rows] = await db.execute(
            'SELECT id, label, created_at FROM held_bills WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 10',
            [tenantId]
        );
        return rows;
    }

    static async holdBill(tenantId, label, billData, createdBy) {
        const [result] = await db.execute(
            'INSERT INTO held_bills (tenant_id, label, bill_data, created_by) VALUES (?, ?, ?, ?)',
            [tenantId, label, billData, createdBy || null]
        );
        return result.insertId;
    }

    static async recallBill(id, tenantId) {
        const [rows] = await db.execute(
            'SELECT bill_data FROM held_bills WHERE id = ? AND tenant_id = ?',
            [id, tenantId]
        );
        if (rows.length) {
            await db.execute('DELETE FROM held_bills WHERE id = ?', [id]);
            return rows[0].bill_data;
        }
        return null;
    }
}

module.exports = POSModel;
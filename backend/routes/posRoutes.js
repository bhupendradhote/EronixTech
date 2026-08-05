const express = require('express');
const router = express.Router();
const {
    getCustomers,
    addCustomer,
    getSalespersons,
    getQuickButtons,
    saveInvoice,
    getHeldBills,
    holdBill,
    recallBill,
    getSalesList,
    getSalesStats,
    getSaleById,
    receivePayment  // ✅ Added missing import
} = require('../controllers/posController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Customers
router.get('/customers', getCustomers);
router.post('/customers', addCustomer);

// Salespersons
router.get('/salespersons', getSalespersons);

// Quick buttons (products)
router.get('/quick-buttons', getQuickButtons);

// Invoices
router.post('/invoices', saveInvoice);

// Held bills
router.get('/held-bills', getHeldBills);
router.post('/held-bills', holdBill);
router.delete('/held-bills/:id', recallBill);

// Sales History
router.get('/sales/list', getSalesList);
router.get('/sales/stats', getSalesStats);
router.get('/sales/:id', getSaleById);
router.post('/sales/:id/payment', receivePayment); 

module.exports = router;
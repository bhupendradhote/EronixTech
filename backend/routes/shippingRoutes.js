const express = require('express');
const { checkDelivery } = require('../controllers/shippingController');

const router = express.Router();
router.post('/check-delivery', checkDelivery);

module.exports = router;

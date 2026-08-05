const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Route: GET /api/search?q=your-query
router.get('/', searchController.search);

module.exports = router;
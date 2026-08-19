require("dotenv").config();
const path = require('path');
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

// Import your routes here
const authRoutes = require("./routes/authRoutes");
// ADDED: Import Admin Auth Routes
const adminAuthRoutes = require('./routes/adminAuthRoutes');

const testRoutes = require("./routes/testRoutes"); 
const addressRoutes = require('./routes/userAddressRoutes');
const userRoutes = require('./routes/userRoutes'); 

const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import Product Routes
const productRoutes = require('./routes/productRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const searchRoutes = require('./routes/searchRoutes');

// order routes
const orderRoutes = require('./routes/orderRoutes');
const shippingRoutes = require('./routes/shippingRoutes');

const couponRoutes = require('./routes/couponRoutes');
const buildPcCategoryRoutes = require('./routes/buildPcCategoryRoutes');
const buildPcSubCategoryRoutes = require('./routes/buildPcSubCategoryRoutes');
const buildPcSubSubCategoryRoutes = require('./routes/buildPcSubSubCategoryRoutes');
const compareRoutes = require('./routes/compareRoutes');


const gameAuthRoutes = require('./routes/gameZoneAuthRoutes');
const availableGameRoutes = require('./routes/availableGameRoutes');
const quickButtonRoutes = require('./routes/quickButtonRoutes');
const gameRateRoutes = require('./routes/gameRateRoutes');
const gameDeviceRoutes = require('./routes/gameDeviceRoutes');
const gameBookingRoutes = require('./routes/gameBookingRoutes');
const posRoutes = require('./routes/posRoutes');
const salespersonRoutes = require('./routes/salespersonRoutes');
const salesRoutes = require('./routes/salesRoutes');
const playerRoutes = require('./routes/playerRoutes');
const warrantyRoutes = require('./routes/warrantyRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully"
  });
});

// Database Connection Test Route
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS test");

    res.json({
      success: true,
      message: "Database connected successfully",
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// --- API Routes ---

// Test routes
app.use("/api/test", testRoutes);

// User Authentication routes
app.use("/api/auth", authRoutes);

// ADDED: Admin Authentication routes
app.use('/api/admin/auth', adminAuthRoutes);

// Addresses routes
app.use('/api/addresses', addressRoutes);

// User Profile routes
app.use('/api/users', userRoutes); 

// Categories & Sub-Categories
app.use('/api/categories', categoryRoutes);
app.use('/api/sub-categories', subCategoryRoutes);

// Brand routes
app.use('/api/brands', brandRoutes);

// Banner routes
app.use('/api/banners', bannerRoutes);

// Product routes
app.use('/api/products', productRoutes);

app.use('/api/payment', paymentRoutes);

app.use('/api/wishlist', wishlistRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/search', searchRoutes);

app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);

app.use('/api/coupons', couponRoutes);
app.use('/api/build-pc-categories', buildPcCategoryRoutes);
app.use('/api/build-pc-subcategories', buildPcSubCategoryRoutes);
app.use('/api/build-pc-sub-subcategories', buildPcSubSubCategoryRoutes);

app.use('/api/game/auth', gameAuthRoutes);
app.use('/api/available-games', availableGameRoutes);
app.use('/api/quick-buttons', quickButtonRoutes);

app.use('/api/game-rates', gameRateRoutes);
app.use('/api/game-devices', gameDeviceRoutes);
app.use('/api/game-bookings', gameBookingRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/salespersons', salespersonRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/warranty', warrantyRoutes);



// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
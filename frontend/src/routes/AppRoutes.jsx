import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Auth Services
import adminAuthService from "../services/adminAuthService";
import gameAuthService from "../services/gameAuthService"; // if needed

/* =========================
   USER PAGES
========================= */
const Home = lazy(() => import("../pages/User/Home/Home"));
const Login = lazy(() => import("../pages/User/Auth/Login"));
const Cart = lazy(() => import("../pages/User/Cart/Cart"));
const Wishlist = lazy(() => import("../pages/User/Wishlist/Wishlist"));
const Profile = lazy(() => import("../pages/User/Profile/Profile"));
const UserOrders = lazy(() => import("../pages/User/Orders/Orders"));
const ProductDetails = lazy(() => import("../pages/User/Product/ProductDetails"));
const About = lazy(() => import("../pages/User/About/About"));
const Contact = lazy(() => import("../pages/User/Contact/Contact"));
const Faq = lazy(() => import("../pages/User/Faq/Faq"));
const TermsOfUse = lazy(() => import("../pages/User/Legal/TermsOfUse"));
const Copyright = lazy(() => import("../pages/User/Legal/Copyright"));
const ReturnPolicy = lazy(() => import("../pages/User/Legal/ReturnPolicy"));
const WarrantyPolicy = lazy(() => import("../pages/User/Legal/WarrantyPolicy"));
const ShippingPolicy = lazy(() => import("../pages/User/Legal/ShippingPolicy"));
const PrivacyPolicy = lazy(() => import("../pages/User/Legal/PrivacyPolicy"));
const Category = lazy(() => import("../pages/User/Category/Category"));
const Checkout = lazy(() => import("../pages/User/Checkout/Checkout"));
const Search = lazy(() => import("../pages/User/Search/Search"));
const OrderSuccess = lazy(() => import("../pages/User/Checkout/OrderSuccess"));

// PC Build Pages
const PcBuild = lazy(() => import("../pages/User/PcBuild/PcBuild"));
const PcPreBuild = lazy(() => import("../pages/User/PcPreBuild/PcPreBuild"));

/* =========================
   COMPARE PAGE (NEW)
========================= */
const Compare = lazy(() => import("../pages/User/Compare/Compare"));

/* =========================
   GAMING ZONE (PUBLIC) PAGES
========================= */
const GamingZone = lazy(() => import("../pages/GameZone/Home/GamingZone"));
const Tournament = lazy(() => import("../pages/GameZone/Tournaments/Tournaments"));
const GameStore = lazy(() => import("../pages/GameZone/GameStore/GameStore"));
const GameContact = lazy(() => import("../pages/GameZone/Contact/Contact"));

/* =========================
   GAMING ZONE AUTH PAGES
========================= */
const GameLogin = lazy(() => import("../pages/GameZone/GameLogin/GameLogin"));
const GameRegister = lazy(() => import("../pages/GameZone/GameLogin/GameRegister"));
const GameProfile = lazy(() => import("../pages/GameZone/Profile/GameProfile"));

/* =========================
   GAME ZONE ADMIN PAGES
========================= */
const AvailableGames = lazy(() => import("../pages/GameZoneAdmin/AvailableGames/AvailableGames"));
const QuickButtons = lazy(() => import("../pages/GameZoneAdmin/QuickButtons/QuickButtons"));
const GameRates = lazy(() => import("../pages/GameZoneAdmin/GameRates/GameRates"));
const GameDevices = lazy(() => import("../pages/GameZoneAdmin/GameDevices/GameDevices"));
const POS = lazy(() => import("../pages/GameZoneAdmin/POS/POS"));
const Salespersons = lazy(() => import("../pages/GameZoneAdmin/Salespersons/Salespersons")); 
const SalesHistory = lazy(() => import("../pages/GameZoneAdmin/SalesHistory/SalesHistory"));
const Players = lazy(() => import("../pages/GameZoneAdmin/Players/Players"));

// Coming Soon
const ComingSoon = lazy(() => import("../pages/User/ComingSoon/ComingSoon"));

/* =========================
   ADMIN PAGES (MAIN LAYOUT)
========================= */
const AdminLogin = lazy(() => import("../pages/Admin/AdminLogin/AdminLogin"));
const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));
const Dashboard = lazy(() => import("../pages/Admin/Dashboard/AdminDashboard"));
const AdminOrders = lazy(() => import("../pages/Admin/Orders/Orders"));
const Products = lazy(() => import("../pages/Admin/Products/Products"));
const Customers = lazy(() => import("../pages/Admin/Customers/Customers"));
const BannerManagement = lazy(() => import("../pages/Admin/Banners/BannerManagement"));
const ReviewManagement = lazy(() => import("../pages/Admin/reviews/ReviewManagement"));

/* =========================
   GAME ZONE ADMIN LAYOUT & DASHBOARD
========================= */
import AdminGameZoneLayout from "../components/layout/AdminGameZoneLayout";
const AdminGameZone = lazy(() => import("../pages/GameZoneAdmin/GameZoneDashboard"));

/* =========================
   MASTER PAGES
========================= */
const CategoryManagement = lazy(() =>
  import("../pages/Admin/Masters/CategoryManagement")
);
const SubCategoryManagement = lazy(() =>
  import("../pages/Admin/Masters/SubCategoryManagement")
);
const BuildPcCategoryManagement = lazy(() =>
  import("../pages/Admin/Masters/BuildPcCategoryManagement")
);
const BuildPcSubCategoryManagement = lazy(() =>
  import("../pages/Admin/Masters/BuildPcSubCategoryManagement")
);
const BuildPcSubSubCategoryManagement = lazy(() =>
  import("../pages/Admin/Masters/BuildPcSubSubCategoryManagement")
);
const BuildPcItemManagement = lazy(() =>
  import("../pages/Admin/Masters/BuildPcItemManagement")
);
const BrandManagement = lazy(() =>
  import("../pages/Admin/Masters/BrandManagement")
);
const CouponManagement = lazy(() =>
  import("../pages/Admin/Masters/CouponManagement")
);

/* =========================
   ADMIN PROTECTED ROUTE
========================= */
const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = adminAuthService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

/* =========================
   ADMIN PUBLIC ROUTE
========================= */
const AdminPublicRoute = ({ children }) => {
  const isAuthenticated = adminAuthService.isAuthenticated();
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

/* =========================
   GAME USER PROTECTED ROUTE
========================= */
const GameProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("gameToken");
  if (!token) {
    return <Navigate to="/game/login" replace />;
  }
  return children;
};

/* =========================
   SCROLL TO TOP HELper (FIXES GLITCH)
========================= */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/* =========================
   LOADER
========================= */
const PageLoader = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: "500",
    }}
  >
    EronixTech Loading...
  </div>
);

/* =========================
   ROUTES
========================= */
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        {/* ================= USER ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/copyright" element={<Copyright />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/warranty-policy" element={<WarrantyPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/:categorySlug" element={<Category />} />
        <Route
          path="/category"
          element={<Navigate to="/category/default" replace />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/pc-build" element={<PcBuild />} />
        <Route path="/pc-pre-build" element={<PcPreBuild />} />
        <Route path="/coming-soon" element={<ComingSoon />} />

        {/* ===== NEW COMPARE ROUTE ===== */}
        <Route path="/compare" element={<Compare />} />

        {/* ================= GAMING ZONE (PUBLIC) ================= */}
        <Route path="/gaming-zone" element={<GamingZone />} />
        <Route path="/tournament" element={<Tournament />} />
        <Route path="/game-store" element={<GameStore />} />
        <Route path="/game-contact" element={<GameContact />} />

        {/* ================= GAMING ZONE AUTH ================= */}
        <Route path="/game/login" element={<GameLogin />} />
        <Route path="/game/register" element={<GameRegister />} />
        <Route
          path="/game/profile"
          element={
            <GameProtectedRoute>
              <GameProfile />
            </GameProtectedRoute>
          }
        />

        {/* ================= ADMIN LOGIN ================= */}
        <Route
          path="/admin/login"
          element={
            <AdminPublicRoute>
              <AdminLogin />
            </AdminPublicRoute>
          }
        />

        {/* ================= GAME ZONE ADMIN (NESTED) ================= */}
        <Route
          path="/admin/game-zone"
          element={
            <AdminProtectedRoute>
              <AdminGameZoneLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminGameZone />} />
          <Route path="games" element={<AvailableGames />} />
          <Route path="quick-buttons" element={<QuickButtons />} />
          <Route path="game-rates" element={<GameRates />} />
          <Route path="game-devices" element={<GameDevices />} />
          <Route path="pos" element={<POS />} />
          <Route path="salespersons" element={<Salespersons />} />
          <Route path="sales-history" element={<SalesHistory />} />
          <Route path="players" element={<Players />} />
        </Route>

        {/* ================= MAIN ADMIN PANEL ================= */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="sub-categories" element={<SubCategoryManagement />} />
          <Route path="build-pc-categories" element={<BuildPcCategoryManagement />} />
          <Route path="build-pc-sub-categories" element={<BuildPcSubCategoryManagement />} />
          <Route path="build-pc-sub-sub-categories" element={<BuildPcSubSubCategoryManagement />} />
          <Route path="build-pc-items" element={<BuildPcItemManagement />} />
          <Route path="brands" element={<BrandManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
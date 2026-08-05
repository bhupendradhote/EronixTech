// frontend/src/pages/Admin/Dashboard/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiMoreHorizontal,
  FiChevronRight,
  FiUserPlus,
} from 'react-icons/fi';
import userService from '../../../services/userService';
import orderService from '../../../services/orderService';
import addressService from '../../../services/addressService';
import categoryService from '../../../services/categoryService';
import productService from '../../../services/productService';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// ----- HELPERS -----
const extractArray = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') {
    const possibleKeys = ['data', 'orders', 'items', 'users', 'results', 'customers', 'addresses'];
    for (const key of possibleKeys) {
      if (Array.isArray(response[key])) return response[key];
    }
    const values = Object.values(response);
    if (values.length === 1 && Array.isArray(values[0])) return values[0];
  }
  console.warn('Could not extract array from response:', response);
  return [];
};

const getLastNDays = (n, endDate = new Date()) => {
  const dates = [];
  const end = new Date(endDate);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const getDailyRevenue = (orders, days) => {
  const deliveredStatuses = ['delivered', 'completed'];
  const today = new Date();
  const dateRange = getLastNDays(days, today);
  const map = {};
  dateRange.forEach(date => { map[date] = 0; });

  orders.forEach(order => {
    const status = (order.order_status || '').toLowerCase();
    if (!deliveredStatuses.includes(status)) return;
    const orderDate = new Date(order.created_at);
    const dateKey = orderDate.toISOString().split('T')[0];
    if (map.hasOwnProperty(dateKey)) {
      map[dateKey] += (order.total_amount || 0);
    }
  });

  const labels = dateRange.map(d => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short' });
  });
  const data = dateRange.map(d => map[d] || 0);
  return { labels, data };
};

const getMonthlyRevenue = (orders) => {
  const deliveredStatuses = ['delivered', 'completed'];
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const map = {};
  months.forEach(m => { map[m] = 0; });

  orders.forEach(order => {
    const status = (order.order_status || '').toLowerCase();
    if (!deliveredStatuses.includes(status)) return;
    const orderDate = new Date(order.created_at);
    if (orderDate.getFullYear() !== currentYear) return;
    const month = orderDate.getMonth() + 1;
    if (map.hasOwnProperty(month)) {
      map[month] += (order.total_amount || 0);
    }
  });

  const labels = months.map(m => new Date(currentYear, m - 1).toLocaleString('default', { month: 'short' }));
  const data = months.map(m => map[m] || 0);
  return { labels, data };
};

const getThisMonthRevenue = (orders) => {
  const deliveredStatuses = ['delivered', 'completed'];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dayToday = today.getDate();
  const dateRange = [];
  for (let d = 1; d <= dayToday; d++) {
    const dt = new Date(year, month, d);
    dateRange.push(dt.toISOString().split('T')[0]);
  }
  const map = {};
  dateRange.forEach(date => { map[date] = 0; });

  orders.forEach(order => {
    const status = (order.order_status || '').toLowerCase();
    if (!deliveredStatuses.includes(status)) return;
    const orderDate = new Date(order.created_at);
    if (orderDate.getFullYear() !== year || orderDate.getMonth() !== month) return;
    const dateKey = orderDate.toISOString().split('T')[0];
    if (map.hasOwnProperty(dateKey)) {
      map[dateKey] += (order.total_amount || 0);
    }
  });

  const labels = dateRange.map(d => {
    const dt = new Date(d + 'T00:00:00');
    return dt.getDate().toString();
  });
  const data = dateRange.map(d => map[d] || 0);
  return { labels, data };
};

// Compute category totals for ALL categories (no limit)
const computeAllCategoryTotals = (categories, products) => {
  const map = {};
  categories.forEach(cat => {
    map[cat.id] = {
      id: cat.id,
      name: cat.name,
      totalValue: 0,
      productCount: 0,
    };
  });

  products.forEach(product => {
    const catId = product.category_id;
    if (catId && map[catId]) {
      const price = parseFloat(product.selling_price) || 0;
      map[catId].totalValue += price;
      map[catId].productCount += 1;
    }
  });

  return Object.values(map).sort((a, b) => b.totalValue - a.totalValue);
};

// Compute payment method distribution
const computePaymentStats = (orders) => {
  const stats = { cod: 0, prepaid: 0, other: 0 };
  orders.forEach(order => {
    const method = (order.payment_method || '').toLowerCase();
    if (method === 'cod') {
      stats.cod++;
    } else if (['prepaid', 'online', 'card', 'upi', 'wallet', 'netbanking'].includes(method)) {
      stats.prepaid++;
    } else if (method) {
      stats.other++;
    }
  });
  return stats;
};

// ----- MAIN COMPONENT -----
const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  const [cityDistribution, setCityDistribution] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);

  // All categories with their totals
  const [allCategoryTotals, setAllCategoryTotals] = useState([]);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Payment stats
  const [paymentStats, setPaymentStats] = useState({ cod: 0, prepaid: 0, other: 0 });

  const [revenuePeriod, setRevenuePeriod] = useState('7days');
  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    datasets: [
      {
        fill: true,
        data: [],
        borderColor: '#f97316',
        borderWidth: 1,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');
          return gradient;
        },
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  });

  const [monthlySalesData, setMonthlySalesData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: '#f97316',
        borderRadius: 8,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        hoverBackgroundColor: '#ea580c',
      },
    ],
  });

  // Doughnut chart data – only top 5 categories for readability
  const [categoryChartData, setCategoryChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  });

  // ----- FETCH DATA -----
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          ordersResponse,
          customersResponse,
          categoriesResponse,
          productsResponse,
        ] = await Promise.all([
          orderService.getAllOrders(),
          userService.getAllCustomers(),
          categoryService.getAllCategoriesAdmin(),
          productService.getAllProducts({ activeOnly: false }),
        ]);

        const ordersArray = extractArray(ordersResponse);
        let customersArray = extractArray(customersResponse);
        if (!Array.isArray(customersArray)) customersArray = [];
        const categoriesArray = extractArray(categoriesResponse);
        const productsArray = extractArray(productsResponse);

        setOrders(ordersArray);
        setCustomers(customersArray);
        setTotalUsers(customersArray.length);

        // Compute total orders and revenue
        setTotalOrders(ordersArray.length);
        const deliveredStatuses = ['delivered', 'completed'];
        const deliveredOrders = ordersArray.filter(order =>
          deliveredStatuses.includes((order.order_status || '').toLowerCase())
        );
        const revenue = deliveredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        setTotalRevenue(revenue);

        // Recent orders
        const sorted = [...ordersArray].sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        const recent = sorted.slice(0, 6).map(order => ({
          id: order.id || order.order_number || `ORD-${Math.random()}`,
          customer: order.user?.full_name || order.customer_name || 'Guest',
          product: order.product_name || order.product || 'Product',
          date: order.created_at ? new Date(order.created_at).toISOString().slice(0, 10) : '',
          amount: order.total_amount || 0,
          status: order.order_status || 'Pending',
        }));
        setRecentOrders(recent);

        // ----- Category totals (ALL) -----
        setCategoriesLoading(true);
        const allTotals = computeAllCategoryTotals(categoriesArray, productsArray);
        setAllCategoryTotals(allTotals);

        const totalInv = productsArray.reduce((sum, p) => sum + (parseFloat(p.selling_price) || 0), 0);
        setTotalInventoryValue(totalInv);

        const top5 = allTotals.slice(0, 5);
        const labels = top5.map(item => item.name);
        const data = top5.map(item => item.totalValue);
        const colors = ['#f97316', '#fdba74', '#fcd34d', '#fb923c', '#f59e0b'];
        const bgColors = top5.map((_, i) => colors[i % colors.length]);
        setCategoryChartData({
          labels,
          datasets: [
            {
              data,
              backgroundColor: bgColors,
              borderWidth: 0,
              hoverOffset: 8,
            },
          ],
        });
        setCategoriesLoading(false);

        // ----- Payment stats -----
        const stats = computePaymentStats(ordersArray);
        setPaymentStats(stats);

        // ----- City distribution (existing) -----
        setCityLoading(true);
        const addressPromises = customersArray.map(async (customer) => {
          const userId = customer.user_id || customer.id || customer.customer_id;
          if (!userId) return { userId: null, city: null };
          try {
            const addresses = await addressService.getAdminUserAddresses(userId);
            const addrArray = extractArray(addresses);
            const defaultAddr = addrArray.find(addr => addr.is_default_shipping) || addrArray[0];
            const city = defaultAddr?.city || null;
            return { userId, city };
          } catch (err) {
            console.error(`Failed to fetch addresses for user ${userId}:`, err);
            return { userId, city: customer.city || null };
          }
        });

        const addressResults = await Promise.all(addressPromises);
        const validResults = addressResults.filter(item => item.userId !== null && item.city !== null);
        if (validResults.length === 0) {
          const fallbackUsers = customersArray
            .filter(c => c.city)
            .map(c => ({ userId: c.user_id || c.id || c.customer_id, city: c.city }));
          if (fallbackUsers.length > 0) {
            const distribution = computeCityDistribution(fallbackUsers);
            setCityDistribution(distribution);
          } else {
            setCityDistribution([]);
          }
        } else {
          const distribution = computeCityDistribution(validResults);
          setCityDistribution(distribution);
        }
        setCityLoading(false);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Unable to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const computeCityDistribution = (data) => {
    const cityCount = {};
    data.forEach(item => {
      const city = item.city?.trim() || 'Unknown';
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const sorted = Object.entries(cityCount).sort((a, b) => b[1] - a[1]);
    const total = data.length;
    return sorted.map(([city, count]) => ({
      city,
      count,
      percentage: total ? ((count / total) * 100).toFixed(1) : 0,
    }));
  };

  // ----- UPDATE CHARTS (revenue, monthly sales) -----
  useEffect(() => {
    if (orders.length === 0) return;

    if (revenuePeriod === '7days') {
      const { labels, data } = getDailyRevenue(orders, 7);
      setRevenueChartData(prev => ({
        ...prev,
        labels,
        datasets: [{ ...prev.datasets[0], data }],
      }));
    } else if (revenuePeriod === 'month') {
      const { labels, data } = getThisMonthRevenue(orders);
      setRevenueChartData(prev => ({
        ...prev,
        labels,
        datasets: [{ ...prev.datasets[0], data }],
      }));
    } else if (revenuePeriod === 'year') {
      const { labels, data } = getMonthlyRevenue(orders);
      setRevenueChartData(prev => ({
        ...prev,
        labels,
        datasets: [{ ...prev.datasets[0], data }],
      }));
    }

    const { labels: monthLabels, data: monthData } = getMonthlyRevenue(orders);
    setMonthlySalesData({
      labels: monthLabels,
      datasets: [
        {
          data: monthData,
          backgroundColor: '#f97316',
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          hoverBackgroundColor: '#ea580c',
        },
      ],
    });
  }, [orders, revenuePeriod]);

  // ----- HELPERS -----
  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
      case 'delivered':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'pending':
        return 'status-pending';
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'vip':
        return 'status-vip';
      case 'new':
        return 'status-new';
      default:
        return 'status-default';
    }
  };

  const getActiveStatus = (isActive) => {
    const active = isActive === true || isActive === 1 || isActive === '1';
    return active ? 'Active' : 'Inactive';
  };

  // ----- RENDER -----
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  const showCityPlaceholder = cityLoading || cityDistribution.length === 0;
  const showCategoryPlaceholder = categoriesLoading || allCategoryTotals.length === 0;
  const nonZeroCategories = allCategoryTotals.filter(cat => cat.totalValue > 0);
  const hasData = nonZeroCategories.length > 0;

  // Payment chart data – filter out zero values
  const paymentLabels = [];
  const paymentData = [];
  const paymentColors = [];
  if (paymentStats.cod > 0) {
    paymentLabels.push('COD');
    paymentData.push(paymentStats.cod);
    paymentColors.push('#f97316');
  }
  if (paymentStats.prepaid > 0) {
    paymentLabels.push('Prepaid');
    paymentData.push(paymentStats.prepaid);
    paymentColors.push('#3b82f6');
  }
  if (paymentStats.other > 0) {
    paymentLabels.push('Other');
    paymentData.push(paymentStats.other);
    paymentColors.push('#8b5cf6');
  }
  const paymentChartData = {
    labels: paymentLabels,
    datasets: [
      {
        data: paymentData,
        backgroundColor: paymentColors,
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const totalWithPayment = paymentStats.cod + paymentStats.prepaid + paymentStats.other;
  const codPercent = totalWithPayment ? ((paymentStats.cod / totalWithPayment) * 100).toFixed(1) : 0;
  const prepaidPercent = totalWithPayment ? ((paymentStats.prepaid / totalWithPayment) * 100).toFixed(1) : 0;
  const otherPercent = totalWithPayment ? ((paymentStats.other / totalWithPayment) * 100).toFixed(1) : 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-title-section">
          <h1 className="dashboard-title">Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back! Here's your store performance overview
          </p>
        </div>
        <div className="header-actions">
          <button className="date-picker-btn">
            <FiCalendar size={16} />
            <span>
              {revenuePeriod === '7days' && 'Last 7 Days'}
              {revenuePeriod === 'month' && 'This Month'}
              {revenuePeriod === 'year' && 'This Year'}
            </span>
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="dash-grid">
        {/* STAT CARDS */}
        <div className="dash-card card-sales highlight-bg">
          <div className="card-header-flex">
            <span className="card-title">Total Sales</span>
            <div className="icon-circle orange-light">
              <FiDollarSign size={20} />
            </div>
          </div>
          <div className="card-metric-row">
            <h2>₹{totalRevenue.toLocaleString()}</h2>
            <span className="trend positive">+3.34%</span>
          </div>
        </div>

        <div className="dash-card card-orders">
          <div className="card-header-flex">
            <span className="card-title">Total Orders</span>
            <div className="icon-circle gray-light">
              <FiShoppingCart size={20} />
            </div>
          </div>
          <div className="card-metric-row">
            <h2>{totalOrders.toLocaleString()}</h2>
            <span className="trend negative">-2.89%</span>
          </div>
        </div>

        <div className="dash-card card-visitors">
          <div className="card-header-flex">
            <span className="card-title">Total Customers</span>
            <div className="icon-circle gray-light">
              <FiUsers size={20} />
            </div>
          </div>
          <div className="card-metric-row">
            <h2>{totalUsers.toLocaleString()}</h2>
            <span className="trend positive">+8.02%</span>
          </div>
        </div>

        {/* TOP CATEGORIES */}
        <div className="dash-card card-categories">
          <div className="card-header-flex">
            <h3 className="card-heading">Top Categories</h3>
            <span className="see-all">
              {hasData ? `All (${nonZeroCategories.length})` : 'See All'}
            </span>
          </div>
          <div className="chart-container" style={{ height: '240px', position: 'relative' }}>
            {showCategoryPlaceholder || !hasData ? (
              <div className="empty-state">No category data</div>
            ) : (
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '72%',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.label}: ₹${ctx.raw?.toLocaleString()}`,
                      },
                    },
                  },
                }}
              />
            )}
            <div className="donut-center">
              <span className="donut-label">Total Products Value</span>
              <span className="donut-value">₹{totalInventoryValue.toLocaleString()}</span>
            </div>
          </div>
          <div className="category-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {showCategoryPlaceholder ? (
              <div className="empty-state">Loading categories...</div>
            ) : !hasData ? (
              <div className="empty-state">No products found in any category</div>
            ) : (
              nonZeroCategories.map((item, index) => {
                const colors = ['#f97316', '#fdba74', '#fcd34d', '#fb923c', '#f59e0b'];
                return (
                  <div className="cat-item" key={item.id}>
                    <span className="dot" style={{ backgroundColor: colors[index % colors.length] }}></span>
                    <span className="cat-name">{item.name}</span>
                    <span className="cat-val">₹{item.totalValue.toLocaleString()}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* REVENUE CHART */}
        <div className="dash-card card-revenue">
          <div className="card-header-flex">
            <h3 className="card-heading">Revenue Analytics</h3>
            <select
              className="dropdown-btn"
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="chart-container" style={{ height: '250px', marginTop: '10px' }}>
            <Line
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                      label: (context) => ` Revenue: ₹${context.raw?.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 12, weight: '500' } },
                  },
                  y: {
                    border: { display: false },
                    grid: {
                      color: '#e2e8f0',
                      drawBorder: false,
                      borderDash: [3, 3],
                    },
                    ticks: {
                      color: '#64748b',
                      callback: (value) => `₹${Number(value) / 1000}k`,
                    },
                  },
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false },
              }}
            />
          </div>
        </div>

        {/* PAYMENT METHODS CARD (replaces Monthly Target) */}
        <div className="dash-card card-target">
          <div className="card-header-flex">
            <h3 className="card-heading">Payment Summary</h3>
            <span className="see-all" style={{ fontSize: '13px', fontWeight: '500' }}>
              {totalWithPayment} orders
            </span>
          </div>
          <div className="chart-container" style={{ height: '180px', position: 'relative' }}>
            {totalWithPayment === 0 ? (
              <div className="empty-state">No payment data</div>
            ) : (
              <Doughnut
                data={paymentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '70%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 12, weight: '500' },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = total ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                          return ` ${ctx.label}: ${ctx.raw} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
          {/* Detailed breakdown (optional, but we keep it for clarity) */}
          {totalWithPayment > 0 && (
            <div className="payment-breakdown" style={{ marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <div className="payment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', fontSize: '14px' }}>
                <span style={{ color: '#475569' }}>COD</span>
                <span style={{ fontWeight: '500' }}>{paymentStats.cod} ({codPercent}%)</span>
              </div>
              <div className="payment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', fontSize: '14px' }}>
                <span style={{ color: '#475569' }}>Prepaid</span>
                <span style={{ fontWeight: '500' }}>{paymentStats.Prepaid} ({prepaidPercent}%)</span>
              </div>
              {paymentStats.other > 0 && (
                <div className="payment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', fontSize: '14px' }}>
                  <span style={{ color: '#475569' }}>Other</span>
                  <span style={{ fontWeight: '500' }}>{paymentStats.other} ({otherPercent}%)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTIVE USERS (City Distribution) */}
        <div className="dash-card card-users">
          <div className="card-header-flex">
            <h3 className="card-heading">Active Users by City</h3>
            <FiTrendingUp size={18} color="#10b981" />
          </div>
          <h2 className="big-metric">
            {totalUsers.toLocaleString()}{' '}
            <span className="trend-badge positive">+8.02%</span>
          </h2>
          <div className="progress-list mt-4">
            {showCityPlaceholder ? (
              <div className="empty-state">
                {cityLoading ? 'Loading city data...' : 'No city data available'}
              </div>
            ) : (
              cityDistribution.map((item, index) => (
                <div className="prog-item" key={item.city}>
                  <div className="prog-label">
                    <span>{item.city}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="prog-bar">
                    <div
                      className="prog-fill"
                      style={{
                        width: `${item.percentage}%`,
                        background: ['#f97316', '#fdba74', '#fcd34d', '#fb923c', '#f59e0b'][index % 5],
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MONTHLY SALES */}
        <div className="dash-card card-conversion">
          <div className="card-header-flex">
            <h3 className="card-heading">Monthly Sales</h3>
            <button className="dropdown-btn outline">This Year</button>
          </div>
          <div className="chart-container" style={{ height: '200px' }}>
            <Bar
              data={monthlySalesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#1e293b',
                    callbacks: {
                      label: (context) => ` Sales: ₹${context.raw?.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { weight: '500' } },
                  },
                  y: {
                    border: { display: false },
                    grid: { color: '#e2e8f0', borderDash: [3, 3] },
                    ticks: {
                      color: '#64748b',
                      callback: (value) => `₹${Number(value) / 1000}k`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="dash-card card-recent-orders">
          <div className="card-header-flex">
            <h3 className="card-heading">Recent Orders</h3>
            <span className="see-all">View All Orders</span>
          </div>
          <div className="table-wrapper">
            {recentOrders.length === 0 ? (
              <div className="empty-state">No recent orders found.</div>
            ) : (
              <table className="data-table orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>{order.date}</td>
                      <td className="order-amount">₹{order.amount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="dash-card card-customers">
          <div className="card-header-flex">
            <h3 className="card-heading">Customer Directory</h3>
            <div className="header-actions-small">
              <button className="icon-btn">
                <FiUserPlus size={16} />
              </button>
              <span className="see-all">Manage Customers</span>
            </div>
          </div>
          <div className="table-wrapper">
            {customers.length === 0 ? (
              <div className="empty-state">No customers found.</div>
            ) : (
              <table className="data-table customers-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Join Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const status = getActiveStatus(customer.is_active);
                    return (
                      <tr key={customer.user_id || customer.id}>
                        <td className="customer-id">{customer.user_id || customer.id}</td>
                        <td className="customer-name">{customer.full_name}</td>
                        <td className="customer-email">{customer.email}</td>
                        <td>{customer.phone_number || '—'}</td>
                        <td>
                          {customer.created_at
                            ? new Date(customer.created_at).toISOString().slice(0, 10)
                            : '—'}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
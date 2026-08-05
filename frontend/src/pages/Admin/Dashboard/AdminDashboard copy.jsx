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
  FiChevronRight,
  FiUserPlus,
  FiPackage,
} from 'react-icons/fi';
import './Dashboard.css';
import adminService from '../../../services/adminDashboardService';

// Register ChartJS components
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

const Dashboard = () => {
  // --- State for API data ---
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);

  // --- Fetch data on mount ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel with error handling per request
        const results = await Promise.allSettled([
          adminService.getOverview(),
          adminService.getSalesStats('weekly'),
          adminService.getUserStats('monthly'),
          adminService.getRecentOrders(6),
          adminService.getTopProducts(5),
          adminService.getAllCustomers(),
        ]);

        // Extract data or fallback to empty/default
        const [
          overviewResult,
          salesResult,
          userResult,
          ordersResult,
          topProductsResult,
          customersResult,
        ] = results;

        if (overviewResult.status === 'fulfilled') {
          setOverview(overviewResult.value);
        } else {
          console.warn('Overview fetch failed:', overviewResult.reason);
        }

        if (salesResult.status === 'fulfilled') {
          setSalesStats(salesResult.value);
        } else {
          console.warn('Sales stats fetch failed:', salesResult.reason);
        }

        if (userResult.status === 'fulfilled') {
          setUserStats(userResult.value);
        } else {
          console.warn('User stats fetch failed:', userResult.reason);
        }

        if (ordersResult.status === 'fulfilled') {
          setRecentOrders(ordersResult.value);
        } else {
          console.warn('Recent orders fetch failed:', ordersResult.reason);
        }

        if (topProductsResult.status === 'fulfilled') {
          setTopProducts(topProductsResult.value);
        } else {
          console.warn('Top products fetch failed:', topProductsResult.reason);
        }

        if (customersResult.status === 'fulfilled') {
          setCustomers(customersResult.value);
        } else {
          console.warn('Customers fetch failed:', customersResult.reason);
        }

        // If all failed, set a general error
        if (results.every(r => r.status === 'rejected')) {
          setError('Failed to load dashboard data. Please try again.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Prepare chart data ---

  // Revenue chart (line)
  const revenueChartData = salesStats
    ? {
        labels: salesStats.data.map((point) => {
          const date = new Date(point.date);
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        }),
        datasets: [
          {
            fill: true,
            data: salesStats.data.map((point) => point.revenue),
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
      }
    : null;

  // Top products Doughnut
  const topProductsChartData = topProducts.length
    ? {
        labels: topProducts.map((p) => p.name),
        datasets: [
          {
            data: topProducts.map((p) => p.revenue),
            backgroundColor: ['#f97316', '#fdba74', '#ffedd5', '#fcd34d', '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 8,
          },
        ],
      }
    : null;

  // User growth line chart
  const userGrowthChartData = userStats
    ? {
        labels: userStats.data.map((point) => {
          const date = new Date(point.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
          {
            label: 'Active Users',
            data: userStats.data.map((point) => point.activeUsers),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      }
    : null;

  // New users bar chart (from userStats)
  const newUsersChartData = userStats
    ? {
        labels: userStats.data.map((point) => {
          const date = new Date(point.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
          {
            label: 'New Users',
            data: userStats.data.map((point) => point.newUsers),
            backgroundColor: '#f97316',
            borderRadius: 8,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            hoverBackgroundColor: '#ea580c',
          },
        ],
      }
    : null;

  // --- Helpers ---
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'pending':
        return 'status-pending';
      case 'active':
        return 'status-active';
      case 'vip':
        return 'status-vip';
      case 'new':
        return 'status-new';
      default:
        return 'status-default';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <div className="error-message" style={{ color: '#ef4444', fontSize: '1.2rem' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
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
            <span>Jun 1 - Jun 7, 2024</span>
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
            <h2>{formatCurrency(overview?.totalRevenue || 0)}</h2>
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
            <h2>{(overview?.totalOrders || 0).toLocaleString()}</h2>
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
            <h2>{(overview?.totalUsers || 0).toLocaleString()}</h2>
            <span className="trend positive">+8.02%</span>
          </div>
        </div>

        {/* TOP PRODUCTS (Doughnut) */}
        <div className="dash-card card-categories">
          <div className="card-header-flex">
            <h3 className="card-heading">Top Products</h3>
            <span className="see-all">See All</span>
          </div>
          {topProductsChartData ? (
            <>
              <div className="chart-container" style={{ height: '240px', position: 'relative' }}>
                <Doughnut
                  data={topProductsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '72%',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const label = ctx.label || '';
                            const value = ctx.raw || 0;
                            return ` ${label}: ${formatCurrency(value)}`;
                          },
                        },
                      },
                    },
                  }}
                />
                <div className="donut-center">
                  <span className="donut-label">Top Revenue</span>
                  <span className="donut-value">
                    {formatCurrency(topProducts.reduce((sum, p) => sum + p.revenue, 0))}
                  </span>
                </div>
              </div>
              <div className="category-list">
                {topProducts.slice(0, 3).map((product, index) => (
                  <div className="cat-item" key={product.id}>
                    <span
                      className="dot"
                      style={{
                        backgroundColor: ['#f97316', '#fdba74', '#ffedd5'][index] || '#f59e0b',
                      }}
                    ></span>
                    <span className="cat-name">{product.name}</span>
                    <span className="cat-val">{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-data">No product data available</div>
          )}
        </div>

        {/* REVENUE CHART */}
        <div className="dash-card card-revenue">
          <div className="card-header-flex">
            <h3 className="card-heading">Revenue Analytics</h3>
            <button className="dropdown-btn">Last 7 Days</button>
          </div>
          {revenueChartData ? (
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
                        label: (context) => ` Revenue: ${formatCurrency(context.raw)}`,
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
                        callback: (value) => `$${Number(value) / 1000}k`,
                      },
                    },
                  },
                  interaction: { mode: 'nearest', axis: 'x', intersect: false },
                }}
              />
            </div>
          ) : (
            <div className="no-data">No revenue data available</div>
          )}
        </div>

        {/* USER GROWTH CHART (replaces target gauge) */}
        <div className="dash-card card-target" style={{ gridColumn: 'span 1' }}>
          <div className="card-header-flex">
            <h3 className="card-heading">User Growth</h3>
            <FiTrendingUp size={18} color="#10b981" />
          </div>
          {userGrowthChartData ? (
            <div className="chart-container" style={{ height: '140px' }}>
              <Line
                data={userGrowthChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: '#1e293b',
                      callbacks: {
                        label: (context) => ` Active: ${context.raw}`,
                      },
                    },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { display: false } },
                    y: { grid: { display: false }, ticks: { display: false } },
                  },
                  interaction: { mode: 'nearest', axis: 'x', intersect: false },
                }}
              />
            </div>
          ) : (
            <div className="no-data">No user growth data</div>
          )}
          <div className="target-text" style={{ marginTop: '10px' }}>
            <strong>
              {userStats?.activeUsers?.toLocaleString() || 0} Active Users
            </strong>
            <p>+{userStats?.data?.length ? Math.round((userStats.activeUsers - userStats.data[0]?.activeUsers) / userStats.data[0]?.activeUsers * 100) : 0}% growth this month</p>
          </div>
        </div>

        {/* ACTIVE USERS STATS (with geography) */}
        <div className="dash-card card-users">
          <div className="card-header-flex">
            <h3 className="card-heading">Active Users</h3>
            <FiTrendingUp size={18} color="#10b981" />
          </div>
          <h2 className="big-metric">
            {userStats?.activeUsers?.toLocaleString() || 0}
            <span className="trend-badge positive">+8.02%</span>
          </h2>
          <div className="progress-list mt-4">
            <div className="prog-item">
              <div className="prog-label">
                <span>United States</span>
                <span>36%</span>
              </div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: '36%', background: '#f97316' }}></div>
              </div>
            </div>
            <div className="prog-item">
              <div className="prog-label">
                <span>United Kingdom</span>
                <span>24%</span>
              </div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: '24%', background: '#fdba74' }}></div>
              </div>
            </div>
            <div className="prog-item">
              <div className="prog-label">
                <span>Indonesia</span>
                <span>17.5%</span>
              </div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: '17.5%', background: '#fcd34d' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW USERS BAR CHART (replaces conversion) */}
        <div className="dash-card card-conversion">
          <div className="card-header-flex">
            <h3 className="card-heading">New Users</h3>
            <button className="dropdown-btn outline">This Month</button>
          </div>
          {newUsersChartData ? (
            <div className="chart-container" style={{ height: '200px' }}>
              <Bar
                data={newUsersChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      callbacks: {
                        label: (context) => ` New Users: ${context.raw}`,
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
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="no-data">No new user data</div>
          )}
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="dash-card card-recent-orders">
          <div className="card-header-flex">
            <h3 className="card-heading">Recent Orders</h3>
            <span className="see-all">View All Orders</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">{order.order_number}</td>
                      <td>{order.customer_name}</td>
                      <td>{new Date(order.created_at).toISOString().slice(0, 10)}</td>
                      <td className="order-amount">{formatCurrency(order.total_amount)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOMER DIRECTORY TABLE */}
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
            <table className="data-table customers-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.slice(0, 6).map((customer) => (
                    <tr key={customer.user_id}>
                      <td className="customer-id">#{customer.user_id}</td>
                      <td className="customer-name">{customer.full_name}</td>
                      <td className="customer-email">{customer.email}</td>
                      <td>{new Date(customer.created_at).toISOString().slice(0, 10)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(customer.is_active ? 'Active' : 'Inactive')}`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No customers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
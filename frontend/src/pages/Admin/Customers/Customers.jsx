import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHome,
  FiBriefcase,
  FiMap
} from 'react-icons/fi';
import userService from '../../../services/userService';
import addressService from '../../../services/addressService';
import './Customers.css';

const statusOptions = ['All', 'Active', 'Inactive'];

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Drawer State ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerFullAddresses, setCustomerFullAddresses] = useState([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    is_active: 'Active',
  });

  // --- 1. Fetch Users ---
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllCustomers();
      const customersList = Array.isArray(data) ? data : [];

      const parseStatus = (isActiveVal) => {
        if (isActiveVal === null || isActiveVal === undefined) return 'Inactive';
        if (typeof isActiveVal === 'boolean') return isActiveVal ? 'Active' : 'Inactive';
        if (typeof isActiveVal === 'number') return isActiveVal === 1 ? 'Active' : 'Inactive';
        if (typeof isActiveVal === 'string') return (isActiveVal === '1' || isActiveVal.toLowerCase() === 'true') ? 'Active' : 'Inactive';
        if (typeof isActiveVal === 'object' && Array.isArray(isActiveVal.data)) {
          return isActiveVal.data[0] === 1 ? 'Active' : 'Inactive';
        }
        return 'Inactive';
      };

      const formattedCustomers = customersList.map((user) => {
        return {
          dbId: user.id || user.user_id, 
          displayId: `CUST-${String(user.id || user.user_id).padStart(3, '0')}`,
          name: user.full_name || 'Unknown',
          email: user.email || '',
          phone: user.phone_number || 'N/A',
          status: parseStatus(user.is_active), 
          joinDate: user.created_at ? new Date(user.created_at).toISOString().slice(0, 10) : 'N/A',
          totalSpent: 0,
          orders: 0    
        };
      });

      setCustomers(formattedCustomers);
      setError(null);
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Filter & Pagination ---
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.displayId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const visibleIds = paginatedCustomers.map(c => c.dbId).join(',');

  // --- 3. Lazy Load Addresses ---
  useEffect(() => {
    const loadVisibleAddresses = async () => {
      if (!visibleIds) return;

      const idsToProcess = visibleIds.split(',');
      const unfetchedIds = idsToProcess.filter(id => !addresses[id] && addresses[id] !== 'Loading...');

      if (unfetchedIds.length === 0) return;

      const tempLoadingState = {};
      unfetchedIds.forEach(id => tempLoadingState[id] = 'Loading...');
      setAddresses(prev => ({ ...prev, ...tempLoadingState }));

      const newAddresses = {};
      
      await Promise.all(unfetchedIds.map(async (id) => {
        try {
            const rawResponse = await addressService.getAdminUserAddresses(id);
            const userAddresses = Array.isArray(rawResponse) ? rawResponse : (rawResponse?.data || []);
          
          const defaultAddress = userAddresses.find(a => 
            a.is_default_shipping === 1 || 
            a.is_default_shipping === true || 
            String(a.is_default_shipping) === '1'
          ) || userAddresses[0]; 
          
          if (defaultAddress) {
            const locationString = [defaultAddress.city, defaultAddress.state].filter(Boolean).join(', ');
            newAddresses[id] = locationString || 'Address incomplete';
          } else {
            newAddresses[id] = 'No address provided';
          }
        } catch (error) {
          newAddresses[id] = 'Unavailable';
        }
      }));

      setAddresses(prev => ({ ...prev, ...newAddresses }));
    };

    loadVisibleAddresses();
  }, [visibleIds]);

  // --- 4. Clean Action Handlers (Matches Products.jsx) ---
  const handleAddNew = () => {
    setSelectedCustomer(null);
    setFormData({ full_name: '', email: '', phone_number: '', is_active: 'Active' });
    setCustomerFullAddresses([]);
    setIsDrawerOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      full_name: customer.name,
      email: customer.email,
      phone_number: customer.phone !== 'N/A' ? customer.phone : '',
      is_active: customer.status,
    });
    setCustomerFullAddresses([]);
    setIsFetchingDetails(true);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Fetch full details when opened
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!isDrawerOpen || !selectedCustomer) return;

      try {
        const rawResponse = await addressService.getAdminUserAddresses(selectedCustomer.dbId);
        const userAddresses = Array.isArray(rawResponse) ? rawResponse : (rawResponse?.data || []);
        setCustomerFullAddresses(userAddresses);
      } catch (error) {
        console.error(`Failed to fetch full addresses:`, error);
        setCustomerFullAddresses([]);
      } finally {
        setIsFetchingDetails(false);
      }
    };

    fetchCustomerDetails();
  }, [isDrawerOpen, selectedCustomer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Active' ? 'status-active' : 'status-inactive';
  };

  const getAddressIcon = (type) => {
    if (type === 'home') return <FiHome />;
    if (type === 'work') return <FiBriefcase />;
    return <FiMap />;
  };

  return (
    <div className="customers-page">
      <div className="customers-header">
        <div className="header-title">
          <h1>Customers Management</h1>
          <p>View and manage your customer base</p>
        </div>
        <button className="btn-primary" onClick={handleAddNew}>
          <FiPlus size={16} /> Add New Customer
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="filters-bar">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="search-input"
          />
        </div>
        <div className="filter-wrapper">
          <FiFilter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading customers...</td>
              </tr>
            ) : paginatedCustomers.length > 0 ? (
              paginatedCustomers.map(customer => (
                <tr key={customer.dbId}>
                  <td className="customer-cell">
                    <div className="customer-avatar">
                      {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="customer-info">
                      <span className="customer-name">{customer.name}</span>
                      <span className="customer-id">{customer.displayId}</span>
                    </div>
                  </td>
                  <td className="contact-cell">
                    <div className="contact-detail"><FiMail size={12} /> <span>{customer.email}</span></div>
                    <div className="contact-detail"><FiPhone size={12} /> <span>{customer.phone}</span></div>
                  </td>
                  <td className="location-cell">
                    <FiMapPin size={12} /> <span>{addresses[customer.dbId] || 'Loading...'}</span>
                  </td>
                  <td className="orders-cell">{customer.orders}</td>
                  <td className="date-cell">{customer.joinDate}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="action-btn edit-btn" onClick={() => handleEdit(customer)} title="View Profile">
                      <FiEdit2 size={16} />
                    </button>
                    <button className="action-btn delete-btn" title="Delete Customer" onClick={() => alert('Delete API required.')}>
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="page-btn">
            <FiChevronLeft size={16} /> Prev
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="page-btn">
            Next <FiChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Strict inline drawer rendering with forced high z-index to block CSS collisions */}
      {isDrawerOpen && (
        <div 
          className="cust-drawer-overlay" 
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="cust-drawer-content" 
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="cust-drawer-header">
              <h2>{selectedCustomer ? 'Customer Profile' : 'Add New Customer'}</h2>
              <button className="cust-close-btn" onClick={() => setIsDrawerOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className="cust-drawer-body">
              <div className="cust-drawer-section">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" disabled={!!selectedCustomer} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="is_active" value={formData.is_active} onChange={handleInputChange} className="form-select">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button className="btn-primary w-full mt-3" onClick={() => alert("Implement API Update")}>
                  Save Basic Info
                </button>
              </div>

              {selectedCustomer && (
                <div className="cust-drawer-section">
                  <div className="section-header-flex">
                    <h3>Saved Addresses</h3>
                  </div>
                  
                  {isFetchingDetails ? (
                    <div className="loading-state">Fetching address details...</div>
                  ) : customerFullAddresses.length > 0 ? (
                    <div className="address-list">
                      {customerFullAddresses.map((addr) => (
                        <div key={addr.id} className="address-card">
                          <div className="address-card-header">
                            <span className="address-type">
                              {getAddressIcon(addr.address_type)} 
                              {String(addr.address_type).toUpperCase()}
                            </span>
                            <div className="address-badges">
                              {(addr.is_default_shipping === 1 || addr.is_default_shipping === true) && <span className="badge shipping">Default Shipping</span>}
                              {(addr.is_default_billing === 1 || addr.is_default_billing === true) && <span className="badge billing">Default Billing</span>}
                            </div>
                          </div>
                          
                          <div className="address-body">
                            <p className="street">{addr.address_line_1}</p>
                            {addr.address_line_2 && <p className="street">{addr.address_line_2}</p>}
                            <p className="city-state">
                              {addr.city}, {addr.state} {addr.postal_code}
                            </p>
                            <p className="country">{addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">No addresses saved for this customer.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
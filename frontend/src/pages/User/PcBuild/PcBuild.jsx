import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiTrash2,
  FiShoppingCart,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import Layout from '../../../components/layout/Layout';
import cartService from '../../../services/cartService';
import buildPcCategoryService from '../../../services/buildPcCategoryService';
import buildPcSubCategoryService from '../../../services/buildPcSubCategoryService';
import buildPcSubSubCategoryService from '../../../services/buildPcSubSubCategoryService';
import productService from '../../../services/productService';
import AuthModal from '../Auth/AuthModal';
import './PcBuild.css';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
};

const PcBuild = () => {
  const navigate = useNavigate();

  // Auth & UI state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // PC Builder Core State
  const [categories, setCategories] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Right Sidebar Nested State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sidebarData, setSidebarData] = useState([]);
  
  // Accordion State
  const [expandedSubSubId, setExpandedSubSubId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch initial base categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const categoriesData = await buildPcCategoryService.getAllCategories(true, false);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError(err.response?.data?.message || 'Failed to load PC Builder.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ---- Sidebar Nested Fetch Logic ----
  const openRightSidebar = async (category) => {
    setActiveCategory(category);
    setIsSidebarOpen(true);
    setSidebarLoading(true);
    setExpandedSubSubId(null);
    setSidebarData([]);

    try {
      const subs = await buildPcSubCategoryService.getSubCategoriesByCategory(category.id, true);
      
      // Fetch all products for this Build PC category (type = pc_build)
      const response = await productService.getAllProducts({
        activeOnly: true,
        productType: 'pc_build',
        buildPcCategoryId: category.id
      });

      // Extract the product array from the paginated response
      const allProducts = response.data || [];

      const nestedData = await Promise.all(subs.map(async (sub) => {
        const subSubs = await buildPcSubSubCategoryService.getSubSubCategoriesBySubCategory(sub.id, true);
        
        const subSubsWithProducts = subSubs.map(ss => {
          const products = allProducts.filter(p => p.build_pc_sub_subcategory_id === ss.id);
          return {
            ...ss,
            items: products.map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.selling_price,
              discount_price: p.offer_price || 0,
              icon_url: p.images && p.images.length > 0 ? p.images[0].image_path : null,
              stock_quantity: p.stock_quantity,
            }))
          };
        });

        return { ...sub, subSubs: subSubsWithProducts };
      }));

      setSidebarData(nestedData);
    } catch (err) {
      console.error(err);
      showToast('Failed to load components', 'error');
    } finally {
      setSidebarLoading(false);
    }
  };

  const closeRightSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      setActiveCategory(null);
      setSidebarData([]);
      setExpandedSubSubId(null);
    }, 300);
  };

  // ---- Accordion Logic ----
  const handleExpandSubSub = (subSubId) => {
    setExpandedSubSubId(prev => (prev === subSubId ? null : subSubId));
  };

  const handleConfirmItem = (item) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [activeCategory.id]: item,
    }));
    closeRightSidebar();
    showToast(`${item.name} added to build!`);
  };

  const handleRemoveComponent = (categoryId) => {
    setSelectedComponents((prev) => {
      const newState = { ...prev };
      delete newState[categoryId];
      return newState;
    });
  };

  // ---- Math & Cart Logic ----
  const calculateTotals = () => {
    let totalBase = 0;
    let totalFinal = 0;

    Object.values(selectedComponents).forEach((item) => {
      const basePrice = parseFloat(item.price || 0);
      const discountPrice = parseFloat(item.discount_price || 0);
      totalBase += basePrice;
      totalFinal += discountPrice > 0 ? discountPrice : basePrice;
    });

    return { totalBase, totalFinal, savings: totalBase - totalFinal };
  };

  const { totalBase, totalFinal, savings } = calculateTotals();

  // ---- Handle "Add All to Cart" ----
  const handleAddAllToCart = async () => {
    const itemsToAdd = Object.values(selectedComponents);
    if (itemsToAdd.length === 0) {
      return showToast('Please select at least one component', 'error');
    }

    setIsAddingToCart(true);
    try {
      for (const item of itemsToAdd) {
        await cartService.addToCart(item.id, 1);
      }
      showToast('Build successfully added to cart! 🛒');
      navigate('/cart');
    } catch (err) {
      console.error('Cart addition error:', err);
      let errorMsg = 'Error adding build to cart.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      if (err.response?.status === 401) {
        setIsAuthModalOpen(true);
        errorMsg = 'Please log in to add items to cart.';
      }
      showToast(errorMsg, 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Layout>
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          authType={authType}
          setAuthType={setAuthType}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="pc-build-main-container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; <span>Custom PC Builder</span>
        </div>

        <div className="pc-build-header-wrap">
          <h1 className="dashboard-header">Custom PC Builder</h1>
          <p className="dashboard-subtitle">Select compatible components to build your perfect rig.</p>
        </div>

        {loading ? (
          <div className="builder-loader"><p>Loading components...</p></div>
        ) : error ? (
          <div className="builder-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
          </div>
        ) : (
          <div className="pc-build-layout">
            
            {/* BUILD LIST (Left Side) */}
            <div className="build-list-section">
              {categories.map((category) => {
                const selectedItem = selectedComponents[category.id];
                const hasSelection = !!selectedItem;

                return (
                  <div key={category.id} className={`build-row ${hasSelection ? 'has-selection' : ''}`}>
                    <div className="build-row-icon">
                      {category.icon_url ? (
                        <img src={category.icon_url} alt={category.name} />
                      ) : (
                        <div className="icon-placeholder">PC</div>
                      )}
                    </div>

                    <div className="build-row-details">
                      <div className="category-title">{category.name}</div>
                      {hasSelection ? (
                        <Link to={`/product/${selectedItem.slug}`} className="selected-item-link">
                          <div className="selected-item-info">
                            {selectedItem.icon_url && (
                              <img src={selectedItem.icon_url} alt={selectedItem.name} className="mini-item-img" />
                            )}
                            <div>
                              <div className="item-name">{selectedItem.name}</div>
                              <div className="item-price">
                                {selectedItem.discount_price > 0 ? (
                                  <>
                                    <span className="final-price">₹{parseFloat(selectedItem.discount_price).toLocaleString()}</span>
                                    <span className="base-price">₹{parseFloat(selectedItem.price).toLocaleString()}</span>
                                  </>
                                ) : (
                                  <span className="final-price">₹{parseFloat(selectedItem.price).toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="empty-selection-text">No component selected</div>
                      )}
                    </div>

                    <div className="build-row-actions">
                      {hasSelection ? (
                        <>
                          <button className="btn-action btn-change" onClick={() => openRightSidebar(category)}>
                            Change
                          </button>
                          <button className="btn-action btn-remove" onClick={() => handleRemoveComponent(category.id)} title="Remove">
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <button className="btn-action btn-add" onClick={() => openRightSidebar(category)}>
                          <FiPlus size={16} /> Choose
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY (Right Side) */}
            <div className="build-summary-section">
              <div className="summary-card">
                <h3>Build Summary</h3>
                <div className="summary-row">
                  <span>Base Price:</span>
                  <span>₹{totalBase.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="summary-row discount">
                    <span>Total Savings:</span>
                    <span>-₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-divider" />
                <div className="summary-row total">
                  <span>Final Price:</span>
                  <span>₹{totalFinal.toLocaleString()}</span>
                </div>

                <button
                  className="btn-start-shopping w-100"
                  onClick={handleAddAllToCart}
                  disabled={totalFinal === 0 || isAddingToCart}
                >
                  <FiShoppingCart size={18} /> {isAddingToCart ? 'Adding...' : 'Add Build To Cart'}
                </button>
                {totalFinal === 0 && <p className="summary-hint">Select components to build your PC.</p>}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RIGHT SIDEBAR - NESTED SELECTION */}
      <div className={`right-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeRightSidebar} />
      
      <div className={`right-sidebar-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-panel-header">
          <h3>Choose {activeCategory?.name}</h3>
          <button className="btn-panel-close" onClick={closeRightSidebar}>
            <FiX size={24} />
          </button>
        </div>

        <div className="sidebar-panel-body">
          {sidebarLoading ? (
            <div className="sidebar-loader">Fetching components...</div>
          ) : sidebarData.length === 0 ? (
            <div className="empty-message">No components available.</div>
          ) : (
            <div className="sidebar-nested-list">
              {sidebarData.map(subCat => (
                <div key={subCat.id} className="sidebar-subcat-group">
                  
                  <h4 className="subcat-heading">{subCat.name}</h4>
                  
                  <div className="subsubcat-list">
                    {subCat.subSubs.length > 0 ? subCat.subSubs.map(subSub => {
                      const isExpanded = expandedSubSubId === subSub.id;
                      const itemCount = subSub.items.length;

                      return (
                        <div key={subSub.id} className={`subsub-accordion ${isExpanded ? 'expanded' : ''}`}>
                          
                          <div className="subsub-header" onClick={() => handleExpandSubSub(subSub.id)}>
                            <div className="subsub-header-left">
                              <span className="subsub-name">{subSub.name}</span>
                              <span className="item-count-badge">{itemCount} items</span>
                            </div>
                            <div className="subsub-header-right">
                              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="subsub-body">
                              {itemCount > 0 ? (
                                <div className="sidebar-items-list">
                                  {subSub.items.map((item) => {
                                    const isSelected = selectedComponents[activeCategory?.id]?.id === item.id;
                                    
                                    return (
                                      <div key={item.id} className="sidebar-item-card-wrapper">
                                        {/* Link to product details – wraps everything except the action button */}
                                        <Link to={`/product/${item.slug}`} className="sidebar-item-link">
                                          <div className="sidebar-item-card">
                                            <div className="item-card-image">
                                              {item.icon_url ? <img src={item.icon_url} alt={item.name} /> : <div className="placeholder-box">No IMG</div>}
                                            </div>
                                            <div className="item-card-details">
                                              <h5>{item.name}</h5>
                                              <div className="price-section">
                                                {item.discount_price > 0 ? (
                                                  <>
                                                    <span className="discount-price">₹{parseFloat(item.discount_price).toLocaleString()}</span>
                                                    <span className="original-price">₹{parseFloat(item.price).toLocaleString()}</span>
                                                  </>
                                                ) : (
                                                  <span className="discount-price">₹{parseFloat(item.price).toLocaleString()}</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </Link>
                                        
                                        <div className="item-card-action">
                                          <button 
                                            className={`btn-select-item ${isSelected ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleConfirmItem(item); }}
                                          >
                                            {isSelected ? <><FiCheckCircle size={16} /> Selected</> : <><FiPlus size={16} /> Add</>}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="empty-message-small">No items in this specification.</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }) : (
                      <div className="empty-message-small">No options found under {subCat.name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PcBuild;
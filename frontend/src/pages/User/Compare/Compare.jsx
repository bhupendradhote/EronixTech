import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../../context/CompareContext';
import productService from '../../../services/productService';
import Layout from '../../../components/layout/Layout';
import './Compare.css';

const Compare = () => {
  const { compareProducts, removeFromCompare, clearCompare, loading } = useCompare();
  const [fullProducts, setFullProducts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ---------- Ultra‑flexible spec extractor ----------
  const extractSpecs = (product) => {
    let rawSpecs = product.specifications || product.specs || product.attributes || [];

    if (typeof rawSpecs === 'string') {
      try {
        rawSpecs = JSON.parse(rawSpecs);
      } catch (e) {
        console.warn(`Product ${product.id} – failed to parse specs JSON:`, e);
        rawSpecs = [];
      }
    }

    if (rawSpecs && typeof rawSpecs === 'object' && !Array.isArray(rawSpecs)) {
      rawSpecs = Object.entries(rawSpecs).map(([key, value]) => ({
        group_name: 'General',
        spec_name: key,
        spec_value: value,
      }));
    }

    let normalized = (rawSpecs || []).map((spec) => ({
      group_name: spec.group_name || spec.group || 'General',
      spec_name: spec.spec_name || spec.name || spec.key || 'Unknown',
      spec_value: spec.spec_value ?? spec.value ?? spec.val ?? '—',
    }));

    if (normalized.length === 0 && product.key_features && Array.isArray(product.key_features)) {
      normalized = product.key_features.map((feature) => ({
        group_name: 'Key Features',
        spec_name: 'Feature',
        spec_value: feature,
      }));
    }

    return normalized;
  };

  // ---------- Fetch full details only if needed ----------
  useEffect(() => {
    const fetchFullDetails = async () => {
      if (!compareProducts.length) {
        setFullProducts([]);
        return;
      }

      const hasSpecs = (p) => {
        const s = p.specifications || p.specs || p.attributes;
        if (Array.isArray(s) && s.length > 0) return true;
        if (typeof s === 'string' && s.trim().length > 0) return true;
        if (s && typeof s === 'object' && Object.keys(s).length > 0) return true;
        return false;
      };

      const needFetch = compareProducts.some((p) => !hasSpecs(p));

      if (!needFetch) {
        setFullProducts(compareProducts);
        return;
      }

      setFetching(true);
      try {
        const productPromises = compareProducts.map(async (product) => {
          if (hasSpecs(product)) return product;
          try {
            const full = await productService.getProductById(product.id);
            return hasSpecs(full) ? full : product;
          } catch (err) {
            console.error(`Failed to fetch product ${product.id}:`, err);
            return product;
          }
        });

        const results = await Promise.all(productPromises);
        setFullProducts(results);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setFullProducts(compareProducts);
      } finally {
        setFetching(false);
      }
    };

    fetchFullDetails();
  }, [compareProducts]);

  // ---------- Build spec table ----------
  const specTableData = useMemo(() => {
    if (!fullProducts.length) return { groupedSpecs: {}, allSpecs: [] };

    const specMap = {};

    fullProducts.forEach((product, idx) => {
      const specs = extractSpecs(product);
      specs.forEach((spec) => {
        const key = `${spec.group_name}||${spec.spec_name}`;
        if (!specMap[key]) {
          specMap[key] = {
            group: spec.group_name,
            name: spec.spec_name,
            values: new Array(fullProducts.length).fill(null),
          };
        }
        specMap[key].values[idx] = spec.spec_value;
      });
    });

    Object.values(specMap).forEach((spec) => {
      while (spec.values.length < fullProducts.length) {
        spec.values.push(null);
      }
    });

    const allSpecs = Object.values(specMap);
    const groupedSpecs = allSpecs.reduce((acc, spec) => {
      if (!acc[spec.group]) acc[spec.group] = [];
      acc[spec.group].push(spec);
      return acc;
    }, {});

    return { groupedSpecs, allSpecs };
  }, [fullProducts]);

  const { groupedSpecs, allSpecs } = specTableData;

  // ---------- Improved difference detection ----------
  const isSpecDifferent = (values) => {
    const normalised = values.map(v => 
      (v === null || v === undefined || v === '' || v === '—') ? null : String(v).trim()
    );
    const present = normalised.filter(v => v !== null);
    if (present.length < 2) return false;
    const first = present[0];
    return !present.every(v => v.toLowerCase() === first.toLowerCase());
  };

  // ---------- Handlers ----------
  const handleClear = () => {
    if (showClearConfirm) {
      clearCompare();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const isLoading = loading || fetching;

  if (isLoading) {
    return (
      <Layout>
        <div className="compare-loading">Loading comparison…</div>
      </Layout>
    );
  }

  if (!fullProducts.length) {
    return (
      <Layout>
        <div className="compare-empty">
          <div className="empty-icon">🔍</div>
          <h2>No products to compare</h2>
          <p>Add products from the shop to start comparing.</p>
          <Link to="/" className="btn-primary">Browse Products</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="compare-container">
        <div className="compare-header">
          <h1>Compare Products</h1>
          <div className="compare-actions">
            <label className="diff-toggle">
              <input
                type="checkbox"
                checked={showDifferencesOnly}
                onChange={() => setShowDifferencesOnly(!showDifferencesOnly)}
              />
              <span>Show Differences Only</span>
            </label>
            <button
              className={`btn-clear ${showClearConfirm ? 'confirm' : ''}`}
              onClick={handleClear}
            >
              {showClearConfirm ? 'Confirm Clear All' : 'Clear All'}
            </button>
          </div>
        </div>

        {/* Product Cards */}
        <div className="compare-products">
          {fullProducts.map((product) => (
            <div className="compare-product-card" key={product.id}>
              <button
                className="remove-product"
                onClick={() => removeFromCompare(product.id)}
                aria-label="Remove product"
              >
                ×
              </button>
              <Link to={`/product/${product.slug}`}>
                <div className="product-image">
                  <img
                    src={product.images?.[0]?.image_path || '/default-product.png'}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>
                <h3>{product.name}</h3>
                <div className="compare-price">
                  <span className="selling">
                    ₹{product.selling_price?.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > product.selling_price && (
                    <del className="mrp">₹{product.mrp?.toLocaleString('en-IN')}</del>
                  )}
                </div>
                <div className="compare-rating">
                  <span className="stars">★</span>
                  <span className="rating-value">{product.average_rating || 0}</span>
                  <span className="reviews">({product.review_count || 0})</span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Specification Table */}
        <div className="compare-specs">
          {allSpecs.length === 0 ? (
            <div className="no-specs-message">
              <p>⚠️ No specifications available for these products.</p>
              <p style={{ fontSize: '14px', color: '#999' }}>
                Please check the browser console (F12) for detailed logs.
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  {fullProducts.map((p, idx) => (
                    <th key={p.id}>Product {idx + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedSpecs).map(([group, specList]) => (
                  <React.Fragment key={group}>
                    <tr className="group-header">
                      <td colSpan={fullProducts.length + 1}>{group}</td>
                    </tr>
                    {specList.map((spec) => {
                      const different = isSpecDifferent(spec.values);
                      const hide = showDifferencesOnly && !different;
                      if (hide) return null;
                      return (
                        <tr key={`${group}-${spec.name}`} className={different ? 'diff-row' : ''}>
                          <td className="spec-name">{spec.name}</td>
                          {spec.values.map((value, i) => {
                            const isDiff = different && value !== null && value !== '—';
                            return (
                              <td key={i} className={`spec-value ${isDiff ? 'highlight-diff' : ''}`}>
                                {value || '—'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Compare;
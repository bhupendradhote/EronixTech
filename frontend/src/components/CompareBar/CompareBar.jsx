import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import './CompareBar.css';

const CompareBar = () => {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();

  if (compareProducts.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="compare-bar-content">
        <div className="compare-items">
          {compareProducts.map((product) => (
            <div className="compare-item" key={product.id}>
              <Link to={`/product/${product.slug}`} className="compare-item-link">
                <img
                  src={product.images?.[0]?.image_path || '/default-product.png'}
                  alt={product.name}
                  className="compare-item-image"
                />
                <div className="compare-item-info">
                  <span className="item-name">{product.name}</span>
                  <span className="item-price">₹{product.selling_price?.toLocaleString('en-IN')}</span>
                </div>
              </Link>
              <button
                className="remove-item"
                onClick={() => removeFromCompare(product.id)}
                aria-label="Remove product"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="compare-actions">
          <Link to="/compare" className="compare-btn">
            Compare ({compareProducts.length})
          </Link>
          <button className="clear-btn" onClick={clearCompare}>
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
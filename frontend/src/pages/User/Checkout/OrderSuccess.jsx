import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};

  // If accessed directly without an order ID, redirect to home
  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconContainer}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={styles.checkIcon}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          
          <h1 style={styles.heading}>Order Placed Successfully!</h1>
          <p style={styles.text}>
            Thank you for shopping with us. Your order has been successfully processed. 
            We have sent a confirmation email with your order details.
          </p>

          <div style={styles.orderBox}>
            <span style={styles.orderLabel}>Order Reference ID:</span>
            <span style={styles.orderValue}>{orderId}</span>
          </div>

          <div style={styles.buttonGroup}>
            <Link to="/orders" style={styles.primaryButton}>
              View My Orders
            </Link>
            <Link to="/" style={styles.secondaryButton}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 20px',
    backgroundColor: '#f9fafb',
    minHeight: '60vh'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid #e5e7eb'
  },
  iconContainer: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#d1fae5',
    color: '#059669',
    marginBottom: '24px'
  },
  checkIcon: {
    width: '32px',
    height: '32px'
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  text: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.5',
    marginBottom: '24px'
  },
  orderBox: {
    backgroundColor: '#f3f4f6',
    padding: '16px',
    borderRadius: '6px',
    marginBottom: '32px',
    border: '1px dashed #d1d5db'
  },
  orderLabel: {
    display: 'block',
    fontSize: '13px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px'
  },
  orderValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  primaryButton: {
    display: 'block',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease'
  },
  secondaryButton: {
    display: 'block',
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    color: '#374151',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    border: '1px solid #d1d5db',
    transition: 'background-color 0.2s ease'
  }
};

export default OrderSuccess;
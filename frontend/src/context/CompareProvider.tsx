/* eslint-disable react-hooks/set-state-in-effect */
// src/context/CompareProvider.tsx
import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';          // type‑only import fixes TS error
import { CompareContext } from './CompareContext';
import { useAuth } from './AuthContext';
import compareService from '../services/compareService';
import type { CompareProduct } from '../types/compare';

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [compareProducts, setCompareProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCompare = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      setCompareProducts([]);
      return;
    }
    setLoading(true);
    try {
      const products: CompareProduct[] = await compareService.getCompare();
      setCompareProducts(products);
    } catch (error) {
      console.error('Failed to fetch compare list', error);
      setCompareProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCompare();
  }, [fetchCompare]);

  const addToCompare = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    await compareService.addToCompare(productId);
    await fetchCompare();
  };

  const removeFromCompare = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    await compareService.removeFromCompare(productId);
    await fetchCompare();
  };

  const clearCompare = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    await compareService.clearCompare();
    setCompareProducts([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareProducts,
        loading,
        addToCompare,
        removeFromCompare,
        clearCompare,
        fetchCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/CompareContext.tsx
import { createContext, useContext } from 'react';

export const CompareContext = createContext<any>(null);

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
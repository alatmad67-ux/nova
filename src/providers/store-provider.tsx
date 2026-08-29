
'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface StoreContextType {
  storeId: string;
  storeName: string;
  isMerchant: boolean;
  isSuperAdmin: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ 
  children, 
  value 
}: { 
  children: ReactNode; 
  value: StoreContextType 
}) {
  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

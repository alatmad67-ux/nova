'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * Client-side Firebase Provider.
 * Ensures initialization happens once and the provider is always present 
 * to prevent context errors during SSR or initial hydration.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider value={services}>
      {children}
    </FirebaseProvider>
  );
}

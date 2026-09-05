'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  /**
   * Use useMemo to ensure initialization happens exactly once for the duration 
   * of the provider's existence, and before the first render completes.
   * This prevents re-initialization during navigation or re-renders.
   */
  const services = useMemo(() => initializeFirebase(), []);

  // Return early if services couldn't be initialized (SSR safety)
  if (!services.app) return <>{children}</>;

  return (
    <FirebaseProvider value={services}>
      {children}
    </FirebaseProvider>
  );
}

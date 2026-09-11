'use client';

/**
 * NOVA FIREBASE - ABSOLUTE SINGLETON ARCHITECTURE (v88)
 * Optimized for both SSR and Client-side stability in proxy environments.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

interface FirebaseServices {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
}

// Persistent global storage to survive HMR and navigation
const g = globalThis as any;

export function initializeFirebase(): FirebaseServices {
  // Check cached services first
  if (g.__NOVA_SERVICES__) {
    return g.__NOVA_SERVICES__;
  }

  // 1. Initialize App exactly once
  const existingApps = getApps();
  const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);

  // 2. Initialize Firestore with locked settings for proxy compatibility
  let db: Firestore;
  try {
    // We only use experimentalForceLongPolling on the client (browser)
    const isBrowser = typeof window !== 'undefined';
    
    db = initializeFirestore(app, {
      experimentalForceLongPolling: isBrowser, 
      ignoreUndefinedProperties: true
    });
  } catch (e) {
    // If already initialized (e.g. implicitly), get existing instance
    db = getFirestore(app);
  }

  // 3. Initialize Auth
  const auth = getAuth(app);

  const services: FirebaseServices = { app, db, auth };
  
  // Cache everything in global memory if in browser
  if (typeof window !== 'undefined') {
    g.__NOVA_SERVICES__ = services;
  }

  return services;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
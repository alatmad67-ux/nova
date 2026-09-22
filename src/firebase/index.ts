'use client';

/**
 * NOVA FIREBASE - ABSOLUTE SINGLETON ARCHITECTURE (v89)
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

// Persistent global storage to survive HMR and navigation in development
const g = globalThis as any;

export function initializeFirebase(): FirebaseServices {
  // 1. Check cached services first (Works on both Server and Client)
  if (g.__NOVA_SERVICES__) {
    return g.__NOVA_SERVICES__;
  }

  // 2. Initialize App exactly once
  const existingApps = getApps();
  const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);

  // 3. Initialize Firestore with forced long polling for proxy compatibility (CRITICAL for Studio SSR)
  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true, // Force Long Polling for stability everywhere
      ignoreUndefinedProperties: true
    });
  } catch (e) {
    // If already initialized, get existing instance
    db = getFirestore(app);
  }

  // 4. Initialize Auth
  const auth = getAuth(app);

  const services: FirebaseServices = { app, db, auth };
  
  // Cache everything in global memory
  g.__NOVA_SERVICES__ = services;

  return services;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

'use client';

/**
 * NOVA FIREBASE CORE - FINAL STABLE INITIALIZATION (v60)
 * 
 * Fixes the "INTERNAL ASSERTION FAILED" by strictly managing the Firestore singleton
 * and ensuring only one configuration call is made per session.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

interface NovaFirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

// Global cache to prevent multiple initializations across HMR and page loads
let cachedServices: NovaFirebaseServices | null = null;

export function initializeFirebase(): NovaFirebaseServices {
  if (typeof window === 'undefined') {
    return null as any;
  }

  // Check if we already have the services in memory
  const win = window as any;
  if (win.__NOVA_FIREBASE__) {
    return win.__NOVA_FIREBASE__;
  }

  // 1. Initialize Firebase App
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // 2. Initialize Firestore (Only once with experimental settings)
  let db: Firestore;
  try {
    // Attempt initialization with forced long polling for proxy stability
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false
    });
  } catch (e: any) {
    // If already initialized, just get the existing instance
    db = getFirestore(app);
  }

  // 3. Initialize Auth
  const auth = getAuth(app);

  const services = { app, auth, db };
  
  // Save to global window object to survive Hot Module Replacement (HMR)
  win.__NOVA_FIREBASE__ = services;
  cachedServices = services;

  return services;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

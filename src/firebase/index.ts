
'use client';

/**
 * NOVA FIREBASE CORE - ULTRA STABLE (v75)
 * Uses a module-level singleton to prevent "Assertion Failed: Unexpected state (ID: ca9)".
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

// Persistent reference to survive HMR in dev environment
let cachedServices: NovaFirebaseServices | null = null;

export function initializeFirebase(): NovaFirebaseServices {
  if (typeof window === 'undefined') {
    return null as any;
  }

  // If services are already initialized, return them immediately
  if (cachedServices) {
    return cachedServices;
  }

  // Check if app exists or initialize it
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let db: Firestore;
  try {
    /**
     * We only call initializeFirestore ONCE. 
     * This is critical to avoid "INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9)".
     */
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    // If already initialized (common during Hot Module Replacement), get the existing instance
    db = getFirestore(app);
  }

  const auth = getAuth(app);

  cachedServices = { app, auth, db };

  // Global backup for debugging
  (window as any).__NOVA_FIREBASE__ = cachedServices;

  return cachedServices;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

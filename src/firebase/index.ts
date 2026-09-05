'use client';

/**
 * NOVA FIREBASE - ABSOLUTE SINGLETON ARCHITECTURE (v87)
 * Strictly prevents "INTERNAL ASSERTION FAILED (ID: ca9)"
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

export function initializeFirebase(): FirebaseServices | { app: null; db: null; auth: null } {
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }

  // 1. Return cached services if already initialized
  if (g.__NOVA_SERVICES__) {
    return g.__NOVA_SERVICES__;
  }

  // 2. Initialize App exactly once
  const existingApps = getApps();
  const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);

  // 3. Initialize Firestore exactly once with locked settings
  // Using initializeFirestore ONLY if not already implicitly initialized
  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true, // Required for proxy environments like Firebase Studio
    });
  } catch (e) {
    // If already initialized, get the existing instance
    db = getFirestore(app);
  }

  // 4. Initialize Auth
  const auth = getAuth(app);

  // 5. Cache everything in global memory
  const services: FirebaseServices = { app, db, auth };
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
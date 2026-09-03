
'use client';

/**
 * NOVA FIREBASE CORE - ULTRA STABLE (v80)
 * Fixed Assertion Failed (ID: ca9) using global singleton pattern.
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

// Global variable to persist through HMR and avoid ID: ca9
declare global {
  var __NOVA_INSTANCE__: NovaFirebaseServices | undefined;
}

export function initializeFirebase(): NovaFirebaseServices {
  if (typeof window === 'undefined') {
    return {} as any;
  }

  // If already initialized globally, return it immediately to prevent assertion errors
  if (globalThis.__NOVA_INSTANCE__) {
    return globalThis.__NOVA_INSTANCE__;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let db: Firestore;
  
  // Strict check to avoid re-initializing Firestore with conflicting settings
  try {
    const existingDb = getFirestore(app);
    if (existingDb) {
      db = existingDb;
    } else {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    }
  } catch (e) {
    // If initializeFirestore fails because it's already initialized, fallback to getFirestore
    db = getFirestore(app);
  }

  const auth = getAuth(app);

  const services = { app, auth, db };
  
  // Store in global and module level
  globalThis.__NOVA_INSTANCE__ = services;

  return services;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

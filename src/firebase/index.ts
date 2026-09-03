
'use client';

/**
 * NOVA FIREBASE CORE - ULTRA STABLE (v81)
 * FIXED: Assertion Failed (ID: ca9) using a strictly guarded global instance pattern.
 * This pattern ensures that Firebase is only initialized once per browser session,
 * even across Hot Module Replacements (HMR).
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

/**
 * Strictly guarded singleton initialization.
 * Using 'window' as a persistent storage across HMR events.
 */
function getNovaServices(): NovaFirebaseServices {
  if (typeof window === 'undefined') {
    return {} as any;
  }

  // Use a unique key on the window object to store the instances
  const GLOBAL_KEY = '__NOVA_FIREBASE_SERVICES__';
  const anyWindow = window as any;

  if (anyWindow[GLOBAL_KEY]) {
    return anyWindow[GLOBAL_KEY];
  }

  // 1. Initialize Firebase App
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // 2. Initialize Firestore with Long Polling (Required for Cloud Workstations)
  let db: Firestore;
  try {
    // initializeFirestore can only be called ONCE per app instance.
    // In HMR, the app might persist while the module is re-evaluated.
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    // Fallback if already initialized (common in development)
    db = getFirestore(app);
  }

  // 3. Initialize Auth
  const auth = getAuth(app);

  const services = { app, auth, db };
  
  // Seal the services in the global object
  anyWindow[GLOBAL_KEY] = services;

  return services;
}

export function initializeFirebase(): NovaFirebaseServices {
  return getNovaServices();
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

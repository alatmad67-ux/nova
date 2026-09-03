
'use client';

/**
 * NOVA FIREBASE CORE - ATOMIC STABLE (v82)
 * FIXED: Assertion Failed (ID: ca9) using globalThis singleton pattern.
 * This ensures that Firestore is only initialized ONCE per session.
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

const GLOBAL_KEY = '__NOVA_FIREBASE_GLOBAL_INSTANCE__';

/**
 * Robust singleton initialization for Next.js / HMR environments.
 */
function getNovaServices(): NovaFirebaseServices {
  // SSR Safety
  if (typeof window === 'undefined') {
    return {} as any;
  }

  const anyGlobal = (globalThis as any);

  // Return existing instance if available to prevent re-initialization crashes (ID: ca9)
  if (anyGlobal[GLOBAL_KEY]) {
    return anyGlobal[GLOBAL_KEY];
  }

  // 1. Initialize Firebase App
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // 2. Initialize Firestore with required Long Polling for Cloud Workstations
  let db: Firestore;
  try {
    // initializeFirestore can only be called once. 
    // If it fails, we fall back to getFirestore which returns the already initialized instance.
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    db = getFirestore(app);
  }

  // 3. Initialize Auth
  const auth = getAuth(app);

  const services = { app, auth, db };
  
  // Store in globalThis to survive Hot Module Replacement (HMR)
  anyGlobal[GLOBAL_KEY] = services;

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

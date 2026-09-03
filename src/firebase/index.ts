'use client';

/**
 * NOVA FIREBASE CORE - ATOMIC INITIALIZATION
 * 
 * Version: 2026.03.04.v48 (ULTRA_STABLE_SINGLETON)
 * Targeted Fix: Firestore 11.9.0 Internal Assertion Failed (ID: ca9 / ID: b815)
 * This fix ensures that Firestore settings are applied exactly once and 
 * survive HMR/Fast Refresh cycles in development environments like Cloud Workstations.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  // Guard against server-side execution
  if (typeof window === 'undefined') {
    return null as any;
  }

  // Persist services on the window object to survive HMR/Fast Refresh during development
  const win = window as any;

  if (!win._novaFirebase) {
    // 1. Initialize App (Idempotent)
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // 2. Initialize Auth
    const auth = getAuth(app);
    
    // 3. Initialize Firestore with settings
    // Version 11.9.0 Assertion Failed fix: 
    // Ensure initializeFirestore is called exactly once and handles already-initialized apps gracefully.
    let db: Firestore;
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true, // Required for Cloud Workstations stability
      });
    } catch (e) {
      // Fallback to existing instance if initializeFirestore has already been called
      db = getFirestore(app);
    }

    win._novaFirebase = { app, auth, db };
  }

  return win._novaFirebase;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

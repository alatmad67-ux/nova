'use client';

/**
 * NOVA FIREBASE CORE - ATOMIC INITIALIZATION
 * 
 * Targeted Fix: Firestore 11.9.0 Internal Assertion Failed (ID: ca9 / ID: b815)
 * Ensures singleton pattern for Firebase services to survive HMR and concurrent calls.
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

export function initializeFirebase(): NovaFirebaseServices {
  if (typeof window === 'undefined') {
    return null as any;
  }

  const win = window as any;

  // Global Singleton Pattern to prevent "Internal Assertion Failed"
  if (!win._novaFirebase) {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    let db: Firestore;
    try {
      // Use initializeFirestore exactly once for specialized settings
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      // If already initialized, get the existing instance
      db = getFirestore(app);
    }

    const auth = getAuth(app);
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

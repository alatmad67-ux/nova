
'use client';

/**
 * NOVA FIREBASE CORE - STABLE INITIALIZATION
 * 
 * Version: 2026.03.04.v47 (STABLE_SINGLETON_ARCHITECTURE)
 * Handles: Firestore 11.9.0 Assertion Failed fix.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Singleton to persist across hot reloads and component re-renders
let firebaseServices: {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} | null = null;

export function initializeFirebase() {
  // Guard against server-side execution
  if (typeof window === 'undefined') {
    return null as any;
  }

  // Return existing services if already initialized
  if (firebaseServices) {
    return firebaseServices;
  }

  // 1. Initialize App (Idempotent)
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // 2. Initialize Auth
  const auth = getAuth(app);
  
  // 3. Initialize Firestore with settings
  // Note: initializeFirestore can only be called ONCE per app.
  // We use a try-catch to fallback to getFirestore if the instance already exists.
  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true, // Required for Cloud Workstations stability
    });
  } catch (e) {
    // If initializeFirestore throws (usually because an instance already exists),
    // we retrieve the existing instance using getFirestore.
    db = getFirestore(app);
  }

  firebaseServices = { app, auth, db };
  return firebaseServices;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

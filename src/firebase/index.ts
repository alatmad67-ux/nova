
'use client';

/**
 * NOVA FIREBASE CORE & SECURITY SYNC
 * 
 * Target Project: studio-9674030533-5f5ae
 * Admin Identity: 07858833838@novafashion.iq
 * Security Policy: Admin-Only Full Write / Public Read (Idempotent Architecture)
 * Rules Sync Trigger: 2026.03.04.v45 (UNIFIED_DATA_LAYER_ENABLED)
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} {
  // Initialize Firebase App
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // Initialize Auth
  const auth = getAuth(app);
  
  /**
   * Initialize Firestore with Long Polling.
   * This is CRITICAL for the Firebase Studio environment to prevent 
   * "Could not reach Cloud Firestore backend" errors.
   */
  let db: Firestore;
  try {
    // Attempt to initialize with specific settings
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: true,
    });
  } catch (e) {
    // If already initialized, fallback to getting the existing instance
    db = getFirestore(app);
  }

  return { app, auth, db };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

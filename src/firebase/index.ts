'use client';

/**
 * NOVA FIREBASE CORE - STRICT SINGLETON ARCHITECTURE
 * Eliminates "INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9)"
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Use globalThis to persist instances across HMR and page transitions
const g = globalThis as any;

export function initializeFirebase() {
  // Ensure this only runs on the client
  if (typeof window === 'undefined') {
    return { app: null as any, db: null as any, auth: null as any };
  }

  // 1. Initialize App exactly once
  if (!g._NOVA_APP) {
    const apps = getApps();
    g._NOVA_APP = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  }
  const app = g._NOVA_APP;

  // 2. Initialize Firestore exactly once
  // This is the CRITICAL part: call initializeFirestore ONLY if we haven't already.
  // Using experimentalForceLongPolling because Firebase Studio/Cloud Workstations often require it for stable streams.
  if (!g._NOVA_DB) {
    g._NOVA_DB = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
  const db = g._NOVA_DB;

  // 3. Initialize Auth exactly once
  if (!g._NOVA_AUTH) {
    g._NOVA_AUTH = getAuth(app);
  }
  const auth = g._NOVA_AUTH;

  return { app, db, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';


'use client';

/**
 * NOVA FIREBASE CORE & SECURITY SYNC
 * 
 * Target Project: studio-9674030533-5f5ae
 * Admin Identity: 07858833838@novafashion.iq
 * Security Policy: Explicit Admin-Only Full Write / Public Read (get and list)
 * Rules Sync Trigger: 2026.03.02.v32 (STRICT_ADMIN_VALIDATION_ENABLED)
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
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  const db = getApps().length > 0 
    ? getFirestore(app) 
    : initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });

  return { app, auth, db };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

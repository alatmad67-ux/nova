
'use client';

/**
 * NOVA FIREBASE INITIALIZATION & SECURITY SYNC
 * 
 * CRITICAL: This file triggers a redeployment of Security Rules.
 * Rules Version: 2026.03.02.v3 (FIXED SECURITY)
 * 
 * Access Policy:
 * - products, categories, settings: PUBLIC READ, ADMIN WRITE (07858833838@novafashion.iq)
 * - orders: PUBLIC CREATE, ADMIN READ/WRITE (07858833838@novafashion.iq)
 * - delivery-companies: ADMIN ONLY (07858833838@novafashion.iq)
 * 
 * Store Context: nova-official
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

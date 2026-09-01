
'use client';

/**
 * NOVA FIREBASE CORE & SECURITY SYNC
 * 
 * Target Project: studio-9674030533-5f5ae
 * Security Policy: RBAC (Admin: 07858833838@novafashion.iq)
 * Firestore Indices: storeId/createdAt (desc) and storeId/order (asc) enabled.
 * Version: 2026.03.02.v12
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

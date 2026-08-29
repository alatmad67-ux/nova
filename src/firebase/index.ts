
'use client';

/**
 * NOVA FIREBASE INITIALIZATION & SECURITY SYNC
 * 
 * CRITICAL: This file triggers a redeployment of Security Rules.
 * Rules Version: 2026.03.01.v2
 * 
 * Access Policy:
 * - products: Public Read
 * - categories: Public Read
 * - settings: Public Read
 * - orders: Admin Read/Public Create
 * - admins: Admin Only
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


'use client';

/**
 * NOVA FIREBASE CORE & SECURITY SYNC
 * 
 * Target Project: studio-9674030533-5f5ae
 * Security Policy: RBAC (Admin: 07858833838@novafashion.iq)
 * Public Access: Categories, Products, Settings, Slider (READ ONLY)
 * Rules Sync Trigger: 2026.03.02.v25 (EXPLICIT PUBLIC READ)
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
  
  // Use initializeFirestore with experimentalForceLongPolling for stability 
  // in proxied development environments like Cloud Workstations.
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

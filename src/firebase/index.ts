
'use client';

/**
 * NOVA FIREBASE CORE - ATOMIC STABLE (v83)
 * FIXED: Assertion Failed (ID: ca9) by ensuring initializeFirestore is NEVER 
 * called twice and callbacks are handled synchronously.
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

/**
 * Robust singleton initialization using module-level variable and global persistence.
 */
let cachedServices: NovaFirebaseServices | null = null;

function getNovaServices(): NovaFirebaseServices {
  // SSR Safety
  if (typeof window === 'undefined') {
    return {} as any;
  }

  // Use globalThis as a persistent store to survive HMR in development
  const anyGlobal = (globalThis as any);
  if (anyGlobal.__NOVA_FIREBASE_SERVICES__) {
    return anyGlobal.__NOVA_FIREBASE_SERVICES__;
  }

  if (cachedServices) return cachedServices;

  // 1. Initialize Firebase App
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // 2. Initialize Firestore
  // We must handle the case where it might already be initialized.
  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e: any) {
    // If already initialized, initializeFirestore throws. 
    // In that case, getFirestore returns the existing instance.
    db = getFirestore(app);
  }

  // 3. Initialize Auth
  const auth = getAuth(app);

  cachedServices = { app, auth, db };
  anyGlobal.__NOVA_FIREBASE_SERVICES__ = cachedServices;

  return cachedServices;
}

export function initializeFirebase(): NovaFirebaseServices {
  return getNovaServices();
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';


'use client';

/**
 * NOVA FIREBASE CORE - ULTRA STABLE (v70)
 * Uses a single verified instance shared across the app to prevent Assertion Errors.
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
  
  // Return existing services if already initialized in this session
  if (win.__NOVA_SERVICES__) {
    return win.__NOVA_SERVICES__;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let db: Firestore;
  try {
    // Try to initialize with settings first
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    // Fallback to getFirestore if already initialized
    db = getFirestore(app);
  }

  const auth = getAuth(app);

  const services = { app, auth, db };
  win.__NOVA_SERVICES__ = services;

  return services;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

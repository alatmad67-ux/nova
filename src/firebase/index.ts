'use client';

/**
 * NOVA FIREBASE CORE - ATOMIC INITIALIZATION (FIX V2)
 * 
 * Targeted Fix: Firestore 11.9.0 Internal Assertion Failed (ID: ca9 / ID: b815)
 * This error occurs when initializeFirestore or onSnapshot calls collide during HMR.
 * We implement a strict double-layered singleton to ensure one and only one instance.
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

// Layer 1: Module-level cache
let cachedServices: NovaFirebaseServices | null = null;

export function initializeFirebase(): NovaFirebaseServices {
  if (typeof window === 'undefined') {
    return null as any;
  }

  // Check module cache first
  if (cachedServices) return cachedServices;

  // Layer 2: Window-level cache to survive Hot Module Replacement (HMR)
  const win = window as any;
  if (win._novaFirebase) {
    cachedServices = win._novaFirebase;
    return win._novaFirebase;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let db: Firestore;
  try {
    /**
     * We attempt to initialize Firestore with specific settings exactly once.
     * experimentalForceLongPolling is required for Google Cloud Workstations proxies.
     */
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false
    });
  } catch (e) {
    // If already initialized, fetch the existing instance without re-applying settings
    db = getFirestore(app);
  }

  const auth = getAuth(app);
  const services = { app, auth, db };
  
  // Persist in both caches
  win._novaFirebase = services;
  cachedServices = services;

  return services;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

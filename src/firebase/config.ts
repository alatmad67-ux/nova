/**
 * NOVA FIREBASE - ROBUST SINGLETON CONFIGURATION
 * Optimized for Next.js 15, Turbopack, and SSR stability.
 */

import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyC9GYAJT1j1JLqP2OXAK0czHJC5NdUqUHk",
  authDomain: "studio-9674030533-5f5ae.firebaseapp.com",
  projectId: "studio-9674030533-5f5ae",
  storageBucket: "studio-9674030533-5f5ae.firebasestorage.app",
  messagingSenderId: "1041938611868",
  appId: "1:1041938611868:web:b5cf7cf22b7a0a10937759"
};

// Global services cache
let firebaseApp: FirebaseApp;
let firestoreDb: Firestore;
let firebaseAuth: Auth;

/**
 * Robust initialization function that ensures single instances 
 * across HMR and different rendering phases.
 */
export function initializeFirebase() {
  const existingApps = getApps();
  
  if (existingApps.length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    
    // Environment-specific Firestore initialization
    if (typeof window !== 'undefined') {
      firestoreDb = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
      });
    } else {
      firestoreDb = getFirestore(firebaseApp);
    }
    firebaseAuth = getAuth(firebaseApp);
  } else {
    firebaseApp = existingApps[0];
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
  }

  return {
    app: firebaseApp,
    db: firestoreDb,
    auth: firebaseAuth
  };
}

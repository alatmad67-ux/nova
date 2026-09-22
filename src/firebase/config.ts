/**
 * NOVA FIREBASE - ABSOLUTE SINGLETON ARCHITECTURE (v91)
 * Optimized for both SSR and Client-side stability.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore, getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyC9GYAJT1j1JLqP2OXAK0czHJC5NdUqUHk",
  authDomain: "studio-9674030533-5f5ae.firebaseapp.com",
  projectId: "studio-9674030533-5f5ae",
  storageBucket: "studio-9674030533-5f5ae.firebasestorage.app",
  messagingSenderId: "1041938611868",
  appId: "1:1041938611868:web:b5cf7cf22b7a0a10937759"
};

interface FirebaseServices {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
}

// Persistent global storage to survive HMR and navigation
const g = globalThis as any;

/**
 * Initializes Firebase services or returns existing ones from cache.
 * Safe for both Server (SSR) and Client environments.
 */
export function initializeFirebase(): FirebaseServices {
  // 1. Check cached services first (Absolute Singleton)
  if (g.__NOVA_SERVICES__) {
    return g.__NOVA_SERVICES__;
  }

  // 2. Initialize App exactly once
  const existingApps = getApps();
  const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);

  // 3. Initialize Firestore with environment-aware settings
  let db: Firestore;
  
  if (typeof window !== 'undefined') {
    // Client-side: Force Long Polling for proxy stability in dev/studio environments
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
      });
    } catch (e) {
      // If already initialized (common during hydration/HMR), get existing instance
      db = getFirestore(app);
    }
  } else {
    // Server-side: Use standard initialization for SSR performance
    db = getFirestore(app);
  }

  // 4. Initialize Auth
  const auth = getAuth(app);

  const services: FirebaseServices = { app, db, auth };
  
  // Cache services globally
  g.__NOVA_SERVICES__ = services;

  return services;
}


'use client';

/**
 * NOVA FIREBASE CORE & SECURITY SYNC
 * 
 * Target Project: studio-9674030533-5f5ae
 * Admin Identity: 07858833838@novafashion.iq
 * Security Policy: Admin-Only Full Write / Public Read (Idempotent Architecture)
 * Rules Sync Trigger: 2026.03.04.v46 (STABLE_CONNECTION_INIT)
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// منع تكرار التهيئة باستخدام Singleton Pattern
let initializedServices: {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} | null = null;

export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} {
  // إذا تم التهيئة مسبقاً، قم بإرجاع الخدمات الحالية فوراً
  if (initializedServices) {
    return initializedServices;
  }

  // Initialize Firebase App
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // Initialize Auth
  const auth = getAuth(app);
  
  /**
   * Initialize Firestore with Long Polling.
   * يتم استخدام initializeFirestore فقط إذا لم تكن هناك نسخة مسبقة لتجنب "Internal Assertion Failed"
   */
  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      // نكتفي بـ force long polling لضمان الاستقرار في بيئة Studio
    });
  } catch (e) {
    // في حال فشل initializeFirestore (مثلاً بسبب تهيئة مسبقة مخفية)، نستخدم getFirestore
    db = getFirestore(app);
  }

  initializedServices = { app, auth, db };
  return initializedServices;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

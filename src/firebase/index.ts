
'use client';

/**
 * NOVA FIREBASE CORE - ATOMIC STABLE (v85)
 * الحل النهائي والقطعي لمشكلة Assertion Failed (ID: ca9)
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let firestore: Firestore;
let firebaseAuth: Auth;

if (typeof window !== 'undefined') {
  const g = globalThis as any;
  
  // 1. تثبيت التطبيق
  if (!g.__NOVA_APP__) {
    g.__NOVA_APP__ = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  firebaseApp = g.__NOVA_APP__;

  // 2. تثبيت Firestore لمرة واحدة فقط وبدون تكرار الإعدادات
  if (!g.__NOVA_DB__) {
    try {
      g.__NOVA_DB__ = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      g.__NOVA_DB__ = getFirestore(firebaseApp);
    }
  }
  firestore = g.__NOVA_DB__;

  // 3. تثبيت Auth
  if (!g.__NOVA_AUTH__) {
    g.__NOVA_AUTH__ = getAuth(firebaseApp);
  }
  firebaseAuth = g.__NOVA_AUTH__;
}

export function initializeFirebase() {
  return { app: firebaseApp, db: firestore, auth: firebaseAuth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

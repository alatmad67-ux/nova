
'use client';

/**
 * NOVA FIREBASE CORE - STRICT SINGLETON v11.1.0
 * الحل النهائي والمستقر لمشكلة Assertion Failed (ID: ca9 / b815)
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// استخدام globalThis لضمان بقاء النسخة واحدة فقط حتى مع الـ HMR
const g = globalThis as any;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { app: null as any, db: null as any, auth: null as any };
  }

  // 1. تهيئة تطبيق Firebase كـ Singleton
  if (!g.__NOVA_APP__) {
    const existingApps = getApps();
    g.__NOVA_APP__ = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  }
  const app = g.__NOVA_APP__;

  // 2. تهيئة Firestore كـ Singleton صارم
  // نستخدم initializeFirestore مرة واحدة فقط لضبط الإعدادات، ثم نستخدم النسخة المخزنة
  if (!g.__NOVA_DB__) {
    g.__NOVA_DB__ = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
  const db = g.__NOVA_DB__;

  // 3. تهيئة Auth كـ Singleton
  if (!g.__NOVA_AUTH__) {
    g.__NOVA_AUTH__ = getAuth(app);
  }
  const auth = g.__NOVA_AUTH__;

  return { app, db, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

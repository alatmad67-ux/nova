
'use client';

/**
 * NOVA FIREBASE CORE - ATOMIC STABLE (v84)
 * حل نهائي لمشكلة Assertion Failed (ID: ca9)
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
 * استخدام Singleton مع حماية مطلقة ضد إعادة التهيئة
 */
function getNovaServices(): NovaFirebaseServices {
  if (typeof window === 'undefined') {
    return {} as any;
  }

  const anyGlobal = (globalThis as any);

  // إذا كانت الخدمات موجودة مسبقاً، لا تقم بأي فعل، فقط أرجعها
  if (anyGlobal.__NOVA_SERVICES__) {
    return anyGlobal.__NOVA_SERVICES__;
  }

  // 1. تهيئة التطبيق
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // 2. تهيئة Firestore مرة واحدة فقط وبدون تعقيدات
  let db: Firestore;
  if (!anyGlobal.__NOVA_DB__) {
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
      anyGlobal.__NOVA_DB__ = db;
    } catch (e) {
      db = getFirestore(app);
      anyGlobal.__NOVA_DB__ = db;
    }
  } else {
    db = anyGlobal.__NOVA_DB__;
  }

  // 3. تهيئة Auth
  const auth = getAuth(app);

  const services = { app, auth, db };
  anyGlobal.__NOVA_SERVICES__ = services;

  return services;
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

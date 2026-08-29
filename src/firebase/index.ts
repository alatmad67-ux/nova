
'use client';

/**
 * تهيئة Firebase وتصدير الخدمات لمتجر NOVA
 * 
 * ملاحظة أمان هامة:
 * المجموعات (products, categories, settings) يجب أن تكون عامة القراءة.
 * المجموعات (orders, admins) يجب أن تكون محمية وخاصة بالإدارة.
 * تم تحديث هذا الملف لتنشيط إعادة نشر Security Rules.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';

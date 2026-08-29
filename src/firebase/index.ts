
'use client';

/**
 * تهيئة Firebase وتصدير الخدمات لمتجر NOVA
 * 
 * تحديث قواعد الأمان (CRITICAL SECURITY REDEPLOY):
 * - المجموعات (products, categories, settings, stores) يجب أن تكون عامة القراءة (Public Read).
 * - المجموعات (orders, admins, delivery-companies) يجب أن تكون محمية وخاصة بالإدارة (Admin Only).
 * 
 * تم تعديل هذا الملف في: 2024-05-20T10:30:00Z لتنشيط إعادة نشر Security Rules.
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

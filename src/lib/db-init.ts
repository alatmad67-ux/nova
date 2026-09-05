'use client';

import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  serverTimestamp,
  query,
  limit,
  where
} from 'firebase/firestore';

/**
 * Atomic and Idempotent Database Initialization for NOVA (v87)
 * Ensures setup logic runs exactly once and fails silently if unauthorized.
 */
export async function initializeDatabase(db: Firestore | null, storeId: string) {
  if (!db || !storeId) return false;

  const g = globalThis as any;
  
  // Strict prevention of concurrent execution
  if (g.__NOVA_DB_INITIALIZED__) return true;
  if (g.__NOVA_DB_INITIALIZING__) return false;

  g.__NOVA_DB_INITIALIZING__ = true;

  try {
    const settingsRef = doc(db, 'settings', 'general');
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, {
        storeName: 'NOVA Official',
        storeId,
        whatsapp: '9647858833838',
        lowStockThreshold: 5,
        deliveryFees: { 'بغداد': 5000, 'البصرة': 7000, 'أربيل': 7000 },
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    g.__NOVA_DB_INITIALIZED__ = true;
    return true;
  } catch (error: any) {
    // If it's a permission error during initial auth transition, we defer silently
    return false;
  } finally {
    g.__NOVA_DB_INITIALIZING__ = false;
  }
}
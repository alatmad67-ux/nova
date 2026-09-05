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
 * True Idempotent Database Initialization for NOVA
 * Ensures setup logic runs exactly once per session.
 */
export async function initializeDatabase(db: Firestore, storeId: string) {
  const g = globalThis as any;
  
  // Strict prevention of concurrent or duplicate execution
  if (g.__NOVA_DB_INITIALIZED__) return true;
  if (g.__NOVA_DB_INITIALIZING__) return false;

  g.__NOVA_DB_INITIALIZING__ = true;

  try {
    // 1. Settings Check
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
      });
    }

    // 2. Sliders Check
    const slidersCol = collection(db, 'sliders');
    const slidersSnap = await getDocs(query(slidersCol, where('storeId', '==', storeId), limit(1)));
    if (slidersSnap.empty) {
      await setDoc(doc(slidersCol), {
        title: 'أناقتكِ تبدأ من هنا',
        subtitle: 'اكتشفي أحدث تشكيلات الأزياء للموسم الجديد',
        image: 'https://picsum.photos/seed/nova-init/1200/800',
        order: 1,
        isActive: true,
        storeId,
        createdAt: serverTimestamp()
      });
    }

    g.__NOVA_DB_INITIALIZED__ = true;
    return true;
  } catch (error) {
    console.warn('Database initialization deferred:', error);
    return false;
  } finally {
    g.__NOVA_DB_INITIALIZING__ = false;
  }
}

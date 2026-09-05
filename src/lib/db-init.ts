
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
 * وظيفة تهيئة قاعدة البيانات الملكية لنوفا (True Idempotent DB Initialization)
 * تضمن عدم تشغيل عمليات التحقق أكثر من مرة واحدة في الجلسة.
 */
export async function initializeDatabase(db: Firestore, storeId: string) {
  const g = globalThis as any;
  
  // منع التشغيل المتكرر بسبب React Renders
  if (g.__NOVA_DB_INITIALIZED__) return true;

  try {
    console.log('Initiating Secure DB Setup for:', storeId);

    // 1. تهيئة الإعدادات (Settings)
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

    // 2. تهيئة السلايدر (Sliders)
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

    // 3. تهيئة الأقسام (Categories)
    const catCol = collection(db, 'categories');
    const catSnap = await getDocs(query(catCol, where('storeId', '==', storeId), limit(1)));
    if (catSnap.empty) {
      const defaultCats = [
        { name: 'فساتين سهرة', slug: 'evening-dresses', order: 1 },
        { name: 'أطقم كلاسيك', slug: 'classic-sets', order: 2 }
      ];
      for (const cat of defaultCats) {
        await setDoc(doc(catCol), {
          ...cat,
          storeId,
          isActive: true,
          image: `https://picsum.photos/seed/${cat.slug}/800/1000`,
          createdAt: serverTimestamp()
        });
      }
    }

    // 4. تهيئة شركات التوصيل (Delivery Companies)
    const deliveryCol = collection(db, 'delivery-companies');
    const deliverySnap = await getDocs(query(deliveryCol, where('storeId', '==', storeId), limit(1)));
    if (deliverySnap.empty) {
      await setDoc(doc(deliveryCol), {
        name: 'النور اللوجستية',
        phone: '0770 000 0000',
        isActive: true,
        storeId,
        createdAt: serverTimestamp()
      });
    }

    g.__NOVA_DB_INITIALIZED__ = true;
    console.log('Database Architecture is Verified and Ready.');
    return true;
  } catch (error) {
    console.error('Database Verification Failed:', error);
    return false;
  }
}

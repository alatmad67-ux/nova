
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
  limit
} from 'firebase/firestore';

/**
 * وظيفة تهيئة قاعدة البيانات (Idempotent DB Initialization)
 * تقوم بإنشاء المجموعات والوثائق الأساسية إذا لم تكن موجودة.
 * لا تقوم بمسح أو تبديل أي بيانات حالية.
 */
export async function initializeDatabase(db: Firestore, storeId: string) {
  try {
    console.log('Starting DB Initialization for:', storeId);

    // 1. تهيئة إعدادات المتجر العامة (Settings)
    const settingsRef = doc(db, 'settings', 'general');
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      console.log('Initializing general settings...');
      await setDoc(settingsRef, {
        storeName: 'NOVA',
        storeId: storeId,
        lowStockThreshold: 5,
        whatsapp: '9647858833838',
        deliveryFees: {
          'بغداد': 5000,
          'البصرة': 7000,
          'أربيل': 7000
        },
        updatedAt: serverTimestamp()
      });
    }

    // 2. تهيئة السلايدر (Sliders) - إضافة شريحة ترحيبية إذا كانت المجموعة فارغة
    const sliderCol = collection(db, 'sliders');
    const sliderSnap = await getDocs(query(sliderCol, limit(1)));
    
    if (sliderSnap.empty) {
      console.log('Initializing sliders collection...');
      await setDoc(doc(sliderCol), {
        title: 'أناقتكِ تبدأ من هنا',
        subtitle: 'اكتشفي أحدث تشكيلات الأزياء النسائية للموسم الجديد',
        image: 'https://picsum.photos/seed/nova-init/1200/800',
        order: 1,
        isActive: true,
        storeId: storeId,
        createdAt: serverTimestamp()
      });
    }

    // 3. تهيئة الأقسام (Categories) - إضافة أقسام افتراضية إذا كانت فارغة
    const catCol = collection(db, 'categories');
    const catSnap = await getDocs(query(catCol, limit(1)));
    
    if (catSnap.empty) {
      console.log('Initializing categories collection...');
      const defaultCats = [
        { name: 'فساتين', slug: 'dresses', order: 1 },
        { name: 'أطقم', slug: 'sets', order: 2 },
        { name: 'تنانير', slug: 'skirts', order: 3 }
      ];
      
      for (const cat of defaultCats) {
        await setDoc(doc(catCol), {
          ...cat,
          storeId: storeId,
          isActive: true,
          image: `https://picsum.photos/seed/${cat.slug}/800/1000`,
          createdAt: serverTimestamp()
        });
      }
    }

    console.log('DB Initialization complete.');
    return true;
  } catch (error) {
    console.error('DB Initialization failed:', error);
    return false;
  }
}

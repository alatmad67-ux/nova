import { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import ProductClient from './ProductClient';
import { BottomNav } from '@/components/layout/BottomNav';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * جلب بيانات المنتج بشكل ذكي (Smart Fetch):
 * 1. يحاول الجلب بالمعرف المباشر (ID).
 * 2. إذا لم يجد، يحاول البحث باستخدام حقل slug.
 */
async function getProductData(id: string) {
  try {
    const { db } = initializeFirebase();
    if (!db) return null;
    
    // محاولة 1: الجلب بالمعرف المباشر (Document ID)
    const productRef = doc(db, 'products', id);
    const snap = await getDoc(productRef);
    
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    // محاولة 2: البحث باستخدام الـ Slug إذا لم يكن المعرف هو الـ ID
    const slugQuery = query(
      collection(db, 'products'),
      where('slug', '==', id),
      limit(1)
    );
    const querySnap = await getDocs(slugQuery);
    
    if (!querySnap.empty) {
      const doc = querySnap.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (error) {
    console.error("Firestore SSR Fetch Error:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product: any = await getProductData(id);

  if (!product) {
    return { title: 'منتج غير موجود | NOVA' };
  }

  const images = product.images || [];
  const ogImage = images.length > 0 ? images[0] : 'https://c.top4top.io/p_39007qwdb0.png';
  
  // بناء الرابط المفضل للمشاركة
  const canonicalPath = `/product/${product.slug || product.id}`;

  return {
    title: `${product.name} | NOVA`,
    description: product.description?.slice(0, 160) || 'أزياء نسائية فاخرة من متجر NOVA الرسمي',
    openGraph: {
      title: product.name,
      description: product.description,
      url: canonicalPath,
      siteName: 'NOVA Official Store',
      images: [{ url: ogImage, width: 800, height: 1000 }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [ogImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductData(id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background dark:bg-black font-arabic">
        <h2 className="text-2xl font-black text-primary dark:text-zinc-100 mb-4">المنتج غير متوفر حالياً</h2>
        <p className="text-primary/40 dark:text-zinc-500 font-bold mb-8">عذراً، الرابط قد يكون قديماً أو القطعة نفدت من المخزن. يرجى العودة للرئيسية.</p>
        <BottomNav />
      </div>
    );
  }

  return <ProductClient product={product} />;
}

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
  if (!id) return null;

  try {
    const services = initializeFirebase();
    const db = services.db;
    
    if (!db) {
      console.error("CRITICAL: Firestore DB is undefined after initialization");
      return null;
    }
    
    // محاولة 1: الجلب بالمعرف المباشر (Document ID)
    const productRef = doc(db, 'products', id);
    const snap = await getDoc(productRef);
    
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    // محاولة 2: البحث باستخدام الـ Slug
    // نقوم بالبحث في كافة المنتجات عن حقل slug يطابق المعرف الممرر
    const productsCol = collection(db, 'products');
    const slugQuery = query(
      productsCol,
      where('slug', '==', id),
      limit(1)
    );
    const querySnap = await getDocs(slugQuery);
    
    if (!querySnap.empty) {
      const foundDoc = querySnap.docs[0];
      return { id: foundDoc.id, ...foundDoc.data() };
    }

    console.warn(`Product not found for identifier: ${id}`);
    return null;
  } catch (error) {
    console.error("CRITICAL: Firestore SSR Fetch Error:", error);
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
        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
           <svg className="h-10 w-10 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>
        <h2 className="text-2xl font-black text-primary dark:text-zinc-100 mb-4">هذا الرابط غير متاح حالياً</h2>
        <p className="text-primary/40 dark:text-zinc-500 font-bold mb-8 max-w-xs">عذراً، قد يكون المنتج قد تم حذفه أو أن هناك مشكلة مؤقتة في الاتصال بخادم NOVA.</p>
        <BottomNav />
      </div>
    );
  }

  return <ProductClient product={product} />;
}

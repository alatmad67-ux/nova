
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

// Mock data for a single product (in a real app, this would be fetched from Firestore)
const PRODUCT_DATA = {
  id: '1',
  name: 'سماعات الرأس اللاسلكية برو - الإصدار البلاتيني مع خاصية إلغاء الضوضاء',
  price: '125,000',
  originalPrice: '150,000',
  discount: '20%',
  rating: 4.8,
  reviewsCount: 124,
  description: 'اختبر جودة صوت لا مثيل لها مع سماعات الرأس اللاسلكية برو. تتميز بتقنية إلغاء الضوضاء النشطة المتقدمة، وعمر بطارية يصل إلى 40 ساعة، وتصميم مريح مثالي للاستخدام الطويل. تم ضبطها بدقة لتقديم صوت نقي وباس عميق.',
  images: [
    PlaceHolderImages.find(p => p.id === 'prod-1')?.imageUrl || '',
    PlaceHolderImages.find(p => p.id === 'prod-2')?.imageUrl || '',
    PlaceHolderImages.find(p => p.id === 'hero-1')?.imageUrl || '',
  ],
  specs: [
    { label: 'العلامة التجارية', value: 'Nahrain Tech' },
    { label: 'نوع الاتصال', value: 'بلوتوث 5.2' },
    { label: 'عمر البطارية', value: '40 ساعة' },
    { label: 'الشحن السريع', value: '10 دقائق لـ 3 ساعات' },
    { label: 'إلغاء الضوضاء', value: 'نشط (ANC)' }
  ],
  features: [
    'تصميم مريح وقابل للطي',
    'ميكروفونات مدمجة للمكالمات الواضحة',
    'متوافق مع جميع أنظمة التشغيل',
    'ضمان لمدة عام كامل'
  ]
};

const RELATED_PRODUCTS = [
  {
    id: '2',
    name: 'ساعة ذكية الإصدار السابع',
    category: 'إلكترونيات',
    price: '85,000',
    rating: 4.5,
    reviews: 89,
    image: PlaceHolderImages.find(p => p.id === 'prod-2')?.imageUrl || '',
    badge: 'جديد'
  },
  {
    id: '3',
    name: 'نظارات شمسية كلاسيكية',
    category: 'أزياء',
    price: '45,000',
    rating: 4.2,
    reviews: 45,
    image: PlaceHolderImages.find(p => p.id === 'prod-3')?.imageUrl || '',
  },
  {
    id: '4',
    name: 'كمبيوتر محمول للألعاب',
    category: 'كمبيوتر',
    price: '1,450,000',
    originalPrice: '1,600,000',
    rating: 4.9,
    reviews: 56,
    image: PlaceHolderImages.find(p => p.id === 'prod-4')?.imageUrl || '',
    badge: 'الأكثر مبيعاً'
  }
];

export default function ProductPage() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleWhatsAppOrder = () => {
    const message = `مرحباً، أود طلب المنتج: ${PRODUCT_DATA.name} (ID: ${id})`;
    window.open(`https://wa.me/9647701234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
          <Link href="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft className="h-3 w-3" />
          <Link href="/categories" className="hover:text-primary">إلكترونيات</Link>
          <ChevronLeft className="h-3 w-3" />
          <span className="text-slate-900 font-medium truncate max-w-[200px]">{PRODUCT_DATA.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-premium group">
              <Image
                src={PRODUCT_DATA.images[activeImage]}
                alt={PRODUCT_DATA.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur border-none shadow-sm hover:bg-white text-slate-600 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur border-none shadow-sm hover:bg-white text-slate-600">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
              {PRODUCT_DATA.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                    activeImage === idx ? "border-primary shadow-lg" : "border-slate-100 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none mb-4 font-bold text-xs">
                {PRODUCT_DATA.discount} خصم
              </Badge>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                {PRODUCT_DATA.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-2 py-1 rounded-lg font-bold text-sm">
                  <Star className="h-4 w-4 fill-current" />
                  {PRODUCT_DATA.rating}
                </div>
                <span className="text-slate-400 text-sm">({PRODUCT_DATA.reviewsCount} تقييم)</span>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-green-600 text-sm font-bold">متوفر في المخزن</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl mb-8">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-black text-slate-900">{PRODUCT_DATA.price}</span>
                <span className="text-sm font-bold text-slate-500">د.ع</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 line-through text-lg">{PRODUCT_DATA.originalPrice} د.ع</span>
                <Badge variant="destructive" className="bg-red-500 text-white border-none rounded-lg text-[10px] font-bold">وفر {parseInt(PRODUCT_DATA.originalPrice.replace(',','')) - parseInt(PRODUCT_DATA.price.replace(',',''))} د.ع</Badge>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700 min-w-[60px]">الكمية:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-slate-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-slate-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <Button size="lg" className="h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                <ShoppingBag className="ml-2 h-5 w-5" />
                أضف للسلة
              </Button>
              <Button 
                onClick={handleWhatsAppOrder}
                variant="outline" 
                size="lg" 
                className="h-14 rounded-2xl text-lg font-black border-2 border-green-500 text-green-600 hover:bg-green-50 gap-2 hover:scale-[1.02] transition-transform"
              >
                <MessageCircle className="h-6 w-6 fill-green-600 text-white" />
                اطلب عبر واتساب
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-8">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-600">ضمان سنة</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-orange-50 rounded-2xl">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-600">توصيل سريع</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-green-50 rounded-2xl">
                  <RotateCcw className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-600">إرجاع خلال 14 يوم</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Info Tabs */}
        <section className="mt-20">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-slate-100 rounded-none h-14 p-0 gap-8">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-lg px-0"
              >
                الوصف
              </TabsTrigger>
              <TabsTrigger 
                value="specs" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-lg px-0"
              >
                المواصفات
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-lg px-0"
              >
                المراجعات ({PRODUCT_DATA.reviewsCount})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="py-10">
              <div className="max-w-3xl">
                <p className="text-slate-600 leading-relaxed text-lg mb-8">
                  {PRODUCT_DATA.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRODUCT_DATA.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specs" className="py-10">
              <div className="max-w-xl border border-slate-100 rounded-3xl overflow-hidden">
                {PRODUCT_DATA.specs.map((spec, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-4", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                    <span className="text-slate-500 font-medium">{spec.label}</span>
                    <span className="text-slate-900 font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="py-10">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/3 bg-slate-50 p-8 rounded-[2rem] h-fit">
                  <div className="text-center mb-6">
                    <span className="text-6xl font-black text-slate-900">{PRODUCT_DATA.rating}</span>
                    <div className="flex justify-center gap-1 my-3 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("h-6 w-6", s <= 4 ? "fill-current" : "text-slate-200")} />
                      ))}
                    </div>
                    <p className="text-slate-500 text-sm">بناءً على {PRODUCT_DATA.reviewsCount} تقييم</p>
                  </div>
                  <Button className="w-full rounded-xl font-bold">أضف تقييمك</Button>
                </div>
                
                <div className="flex-1 space-y-8">
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="border-b border-slate-100 pb-8 last:border-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200" />
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">أحمد محمد</h5>
                            <span className="text-[10px] text-slate-400">منذ يومين</span>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 fill-current" />)}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        المنتج رائع جداً والتوصيل كان سريع جداً إلى البصرة. السماعات صوتها نقي جداً وتعمل بشكل ممتاز مع الآيفون. أنصح بها بشدة.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        <section className="mt-24 mb-12">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900">منتجات قد تعجبك</h3>
            <Link href="/categories" className="text-primary font-bold hover:underline">مشاهدة الكل</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {RELATED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

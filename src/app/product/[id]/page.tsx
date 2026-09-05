
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useCart } from '@/providers/cart-provider';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const docRef = useMemo(() => (db && id) ? doc(db, 'products', id as string) : null, [db, id]);
  const { data: product, loading } = useDoc(docRef);
  
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [qty, setQuantity] = useState(1);

  const isFav = favorites.includes(id as string);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-black text-primary animate-pulse">
      <Sparkles className="h-10 w-10 mb-4" />
      جاري جلب سحر NOVA...
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-arabic p-6 text-center">
      <h2 className="text-2xl font-black text-primary mb-4">المنتج غير موجود</h2>
      <p className="text-primary/40 font-bold mb-8">عذراً، يبدو أن هذه القطعة لم تعد متوفرة في مجموعتنا الحالية.</p>
      <Button onClick={() => router.push('/shop')} className="rounded-full bg-primary text-white px-10 h-14 font-black">العودة للمتجر</Button>
    </div>
  );

  const images = product.images || ['https://picsum.photos/seed/placeholder/800/1000'];
  const price = product.price || 0;
  const originalPrice = product.originalPrice || 0;
  const variants = product.variants || [];

  const availableColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[];
  const availableSizes = selectedColor 
    ? variants.filter((v: any) => v.color === selectedColor).map((v: any) => v.size).filter(Boolean)
    : Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))) as string[];

  const handleAddToCart = () => {
    if ((availableColors.length > 0 && !selectedColor) || (availableSizes.length > 0 && !selectedSize)) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار اللون والقياس أولاً" });
      return;
    }
    
    const currentVariant = variants.find((v: any) => 
      v.color === selectedColor && v.size === selectedSize
    );

    addToCart({
      id: product.id,
      name: product.name || 'منتج نوفا',
      price: price,
      image: images[0],
      variant: {
        color: selectedColor || 'عام',
        size: selectedSize || 'واحد',
        sku: currentVariant?.sku || `${product.id}-${selectedColor || 'any'}-${selectedSize || 'any'}`
      },
      quantity: qty
    });

    toast({ title: "تمت الإضافة", description: `تمت إضافة ${qty} قطع إلى حقيبتكِ ✨` });
  };

  const DetailSection = ({ title, content }: { title: string, content?: string }) => {
    if (!content) return null;
    return (
      <div className="space-y-3">
        <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{title}</Label>
        <p className="text-xs font-bold text-primary/60 leading-relaxed bg-accent/30 p-4 rounded-2xl border border-border/20">
          {content}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32">
      <header className="h-16 flex items-center px-6 justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/30">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-primary shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xs font-black text-primary truncate max-w-[180px]">{product.name}</span>
        <button onClick={() => toggleFavorite(product.id)} className={cn("h-9 w-9 rounded-full bg-accent flex items-center justify-center shadow-sm", isFav ? "text-primary" : "text-primary/20")}>
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>
      </header>
      
      <main className="flex-grow">
        {/* Adjusted Image Size for Mobile Focus */}
        <div className="relative aspect-square md:aspect-[3/2] w-full overflow-hidden bg-accent border-b border-border/10">
          <Image
            src={images[activeImage]}
            alt={product.name || 'Product'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_: any, i: number) => (
              <div key={i} className={cn("h-1 rounded-full transition-all", activeImage === i ? "w-6 bg-primary" : "w-1.5 bg-white/50")} />
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 px-5 py-3 overflow-x-auto no-scrollbar">
           {images.map((img: string, i: number) => (
             <button key={i} onClick={() => setActiveImage(i)} className={cn("h-14 w-11 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all", activeImage === i ? "border-primary" : "border-transparent")}>
               <Image src={img} alt="thumb" width={56} height={56} className="object-cover h-full w-full" />
             </button>
           ))}
        </div>

        <div className="px-6 py-2 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3 text-secondary" />
              <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{product.categoryName}</span>
            </div>
            <h1 className="text-xl font-black text-primary leading-tight">{product.name}</h1>
            
            <div className="mt-3 flex items-center justify-between">
               <div className="flex items-baseline gap-1.5">
                 <span className="text-2xl font-black text-primary">{price.toLocaleString()}</span>
                 <span className="text-[10px] font-bold text-primary/40">د.ع</span>
               </div>
               {originalPrice > price && (
                 <Badge className="bg-secondary text-white font-black text-[9px] h-6 px-2">خصم {Math.round(((originalPrice - price) / originalPrice) * 100)}%</Badge>
               )}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Variants */}
          {availableColors.length > 0 && (
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest">الألوان</Label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(c => (
                  <button 
                   key={c} 
                   onClick={() => { setSelectedColor(c); setSelectedSize(null); }}
                   className={cn(
                     "px-4 py-2 rounded-xl border-2 font-black text-[10px] transition-all", 
                     selectedColor === c ? "border-primary bg-primary text-white" : "border-border text-primary/40 bg-white"
                   )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest">القياس</Label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s: any) => (
                  <button 
                   key={s} 
                   onClick={() => setSelectedSize(s)}
                   className={cn(
                     "h-10 w-10 rounded-xl border-2 flex items-center justify-center font-black text-[10px] transition-all", 
                     selectedSize === s ? "border-primary bg-primary text-white" : "border-border text-primary/40 bg-white"
                   )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Details Sections */}
          <div className="space-y-5">
            <div className="space-y-2">
               <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest">الوصف</Label>
               <div className="relative">
                  <p className={cn(
                    "text-xs font-bold text-primary/60 leading-relaxed whitespace-pre-line",
                    !isDescExpanded && "line-clamp-3"
                  )}>
                    {product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}
                  </p>
                  {product.description?.length > 100 && (
                    <button 
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="mt-1 text-[10px] font-black text-secondary flex items-center gap-1 hover:underline"
                    >
                      {isDescExpanded ? (
                        <>إغلاق <ChevronUp className="h-2.5 w-2.5" /></>
                      ) : (
                        <>عرض المزيد <ChevronDown className="h-2.5 w-2.5" /></>
                      )}
                    </button>
                  )}
               </div>
            </div>

            <DetailSection title="المكونات" content={product.ingredients} />
            <DetailSection title="طريقة الاستخدام" content={product.howToUse} />
            <DetailSection title="المواصفات التقنية" content={product.specifications} />
            <DetailSection title="خامة القماش" content={product.material} />
          </div>

          {/* Trust Features */}
          <div className="grid grid-cols-3 gap-2.5 pt-4">
             {[
               { icon: Truck, label: 'توصيل سريع' },
               { icon: ShieldCheck, label: 'جودة ملكية' },
               { icon: RotateCcw, label: 'إرجاع سهل' },
             ].map((f, i) => (
               <div key={i} className="bg-accent/30 rounded-xl p-3 flex flex-col items-center gap-1.5 border border-border/20">
                 <f.icon className="h-4 w-4 text-secondary" />
                 <span className="text-[8px] font-black text-primary/40 text-center">{f.label}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* Integrated Action Bar with Quantity Selector */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-border/30 z-40">
         <div className="container mx-auto max-w-lg flex items-center gap-3">
            
            {/* Quantity Controls */}
            <div className="flex items-center bg-accent/50 rounded-2xl p-1 border border-border/20 h-14">
              <button 
                onClick={() => setQuantity(Math.max(1, qty - 1))}
                className="h-12 w-10 flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-black text-primary text-sm">{qty}</span>
              <button 
                onClick={() => setQuantity(qty + 1)}
                className="h-12 w-10 flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button 
              onClick={handleAddToCart} 
              className="flex-1 h-14 rounded-2xl bg-primary text-white text-md font-black shadow-lg shadow-primary/20 gap-3 active:scale-95 transition-all"
            >
                <ShoppingBag className="h-5 w-5" />
                أضف للسلة
            </Button>
            
            <button 
              onClick={() => window.open(`https://wa.me/9647858833838?text=أود الاستفسار عن ${product.name}`, '_blank')}
              className="h-14 w-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500 shadow-sm active:scale-95 transition-all"
            >
               <MessageCircle className="h-7 w-7" />
            </button>

         </div>
      </div>
    </div>
  );
}

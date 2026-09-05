
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  MessageCircle,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
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

  const isFav = favorites.includes(id as string);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-black text-primary animate-pulse">
      <Sparkles className="h-10 w-10 mb-4" />
      جاري جلب سحر NOVA...
    </div>
  );
  
  if (!product) return <div className="min-h-screen bg-background flex items-center justify-center font-black">المنتج غير موجود</div>;

  const currentVariant = product.variants?.find((v: any) => 
    v.color === selectedColor && v.size === selectedSize
  );

  const availableColors = Array.from(new Set(product.variants?.map((v: any) => v.color) || [])) as string[];
  const availableSizes = selectedColor 
    ? product.variants?.filter((v: any) => v.color === selectedColor).map((v: any) => v.size)
    : Array.from(new Set(product.variants?.map((v: any) => v.size) || []));

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار اللون والقياس أولاً" });
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      variant: {
        color: selectedColor,
        size: selectedSize,
        sku: currentVariant?.sku || `${product.id}-${selectedColor}-${selectedSize}`
      },
      quantity: 1
    });

    toast({ title: "تمت الإضافة", description: "القطعة الآن في حقيبة تسوقكِ ✨" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32">
      {/* Dynamic Header */}
      <header className="h-20 flex items-center px-6 justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/30">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary shadow-sm">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span className="text-sm font-black text-primary truncate max-w-[200px]">{product.name}</span>
        <button onClick={() => toggleFavorite(product.id)} className={cn("h-10 w-10 rounded-full bg-accent flex items-center justify-center shadow-sm", isFav ? "text-primary" : "text-primary/20")}>
          <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
        </button>
      </header>
      
      <main className="flex-grow">
        {/* Image Gallery */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-accent">
          <Image
            src={product.images[activeImage] || 'https://picsum.photos/seed/placeholder/800/1000'}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_: any, i: number) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all", activeImage === i ? "w-8 bg-primary" : "w-2 bg-white/50")} />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3 px-5 py-4 overflow-x-auto no-scrollbar">
           {product.images.map((img: string, i: number) => (
             <button key={i} onClick={() => setActiveImage(i)} className={cn("h-16 w-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all", activeImage === i ? "border-primary" : "border-transparent")}>
               <Image src={img} alt="thumb" width={64} height={64} className="object-cover h-full w-full" />
             </button>
           ))}
        </div>

        <div className="px-6 py-4 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{product.categoryName}</span>
            </div>
            <h1 className="text-2xl font-black text-primary leading-tight">{product.name}</h1>
            
            <div className="mt-4 flex items-center justify-between">
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-primary">{product.price.toLocaleString()}</span>
                 <span className="text-xs font-bold text-primary/40">د.ع</span>
               </div>
               {product.originalPrice && (
                 <Badge className="bg-secondary text-white font-black">خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</Badge>
               )}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Options */}
          <div className="space-y-6">
             <div className="space-y-3">
               <Label className="text-xs font-black text-primary/40 uppercase">اللون المتاح</Label>
               <div className="flex flex-wrap gap-2">
                 {availableColors.map(c => (
                   <button 
                    key={c} 
                    onClick={() => setSelectedColor(c)}
                    className={cn("px-5 py-2.5 rounded-2xl border-2 font-bold text-xs transition-all", selectedColor === c ? "border-primary bg-primary/5 text-primary" : "border-border text-primary/40")}
                   >
                     {c}
                   </button>
                 ))}
               </div>
             </div>

             <div className="space-y-3">
               <Label className="text-xs font-black text-primary/40 uppercase">القياس</Label>
               <div className="flex flex-wrap gap-2">
                 {availableSizes.map((s: any) => (
                   <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)}
                    className={cn("h-12 w-12 rounded-2xl border-2 flex items-center justify-center font-black text-xs transition-all", selectedSize === s ? "border-primary bg-primary/5 text-primary" : "border-border text-primary/40")}
                   >
                     {s}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <div className="space-y-4">
             <Label className="text-xs font-black text-primary/40 uppercase">الوصف</Label>
             <p className="text-sm font-bold text-primary/60 leading-relaxed">{product.description}</p>
          </div>

          {/* Trust Flags */}
          <div className="grid grid-cols-3 gap-3 pt-6">
             {[
               { icon: Truck, label: 'توصيل سريع' },
               { icon: ShieldCheck, label: 'جودة ملكية' },
               { icon: RotateCcw, label: 'إرجاع سهل' },
             ].map((f, i) => (
               <div key={i} className="bg-accent/30 rounded-2xl p-4 flex flex-col items-center gap-2 border border-border/30">
                 <f.icon className="h-5 w-5 text-secondary" />
                 <span className="text-[9px] font-black text-primary/40">{f.label}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* Action Bar */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-border/30 flex gap-3 z-40">
         <Button onClick={handleAddToCart} className="flex-[2] h-16 rounded-3xl bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 gap-3">
            <ShoppingBag className="h-6 w-6" />
            أضف للسلة
         </Button>
         <Button variant="outline" onClick={() => window.open(`https://wa.me/9647858833838?text=أود الاستفسار عن ${product.name}`, '_blank')} className="flex-1 h-16 rounded-3xl border-border bg-white text-green-500 hover:bg-green-50">
            <MessageCircle className="h-8 w-8" />
         </Button>
      </div>

      <BottomNav />
    </div>
  );
}

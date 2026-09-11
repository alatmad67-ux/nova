
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useCart } from '@/providers/cart-provider';
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';

export default function ProductClient({ product }: { product: any }) {
  const router = useRouter();
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [qty, setQuantity] = useState(1);

  const isFav = favorites.includes(product.id);
  const images = product.images || ['https://picsum.photos/seed/placeholder/800/1000'];
  const price = product.price || 0;
  const originalPrice = product.originalPrice || 0;
  const variants = product.variants || [];

  const availableColors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))) as string[];
  const availableSizes = selectedColor 
    ? variants.filter((v: any) => v.color === selectedColor).map((v: any) => v.size).filter(Boolean)
    : Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))) as string[];

  const validateSelection = () => {
    if ((availableColors.length > 0 && !selectedColor) || (availableSizes.length > 0 && !selectedSize)) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار اللون والقياس أولاً" });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    
    const currentVariant = variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);

    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      image: images[0],
      variant: {
        color: selectedColor || 'عام',
        size: selectedSize || 'واحد',
        sku: currentVariant?.sku || `${product.id}-${selectedColor || 'any'}-${selectedSize || 'any'}`
      },
      quantity: qty
    });

    toast({ title: "تمت الإضافة", description: "تمت إضافة القطعة إلى حقيبتكِ ✨" });
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    
    const params = new URLSearchParams({
      productId: product.id,
      color: selectedColor || 'عام',
      size: selectedSize || 'واحد',
      qty: qty.toString()
    });
    
    router.push(`/checkout/fast?${params.toString()}`);
  };

  const DetailSection = ({ title, content }: { title: string, content?: string }) => {
    if (!content) return null;
    return (
      <div className="space-y-3">
        <Label className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">{title}</Label>
        <p className="text-xs font-bold text-primary/60 dark:text-zinc-400 leading-relaxed bg-accent/30 dark:bg-zinc-900/50 p-4 rounded-2xl border border-border/20 dark:border-zinc-800">
          {content}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-40">
      <header className="h-16 flex items-center px-6 justify-between sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-border/30 dark:border-zinc-800">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300 shadow-sm">
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="text-xs font-black text-primary dark:text-zinc-100 truncate max-w-[180px]">{product.name}</span>
        <button onClick={() => toggleFavorite(product.id)} className={cn("h-9 w-9 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center shadow-sm", isFav ? "text-primary" : "text-primary/20 dark:text-zinc-600")}>
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>
      </header>
      
      <main className="flex-grow">
        <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden bg-white dark:bg-zinc-900 border-b border-border/10 dark:border-zinc-800">
          <Image src={images[activeImage]} alt={product.name} fill className="object-contain p-4" priority />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_: any, i: number) => (
              <div key={i} className={cn("h-1 rounded-full transition-all", activeImage === i ? "w-6 bg-primary" : "w-1.5 bg-primary/20 dark:bg-zinc-700")} />
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 px-5 py-3 overflow-x-auto no-scrollbar bg-white dark:bg-[#050505]">
           {images.map((img: string, i: number) => (
             <button key={i} onClick={() => setActiveImage(i)} className={cn("h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all bg-[#FAF8F5] dark:bg-zinc-800 relative", activeImage === i ? "border-primary" : "border-transparent")}>
               <Image src={img} alt="thumb" fill className="object-contain p-1" />
             </button>
           ))}
        </div>

        <div className="px-6 py-4 space-y-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3 text-secondary" />
              <span className="text-[9px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">{product.categoryName}</span>
            </div>
            <h1 className="text-xl font-black text-primary dark:text-zinc-100 leading-tight">{product.name}</h1>
            <div className="mt-3 flex items-center justify-between">
               <div className="flex items-baseline gap-1.5">
                 <span className="text-2xl font-black text-primary dark:text-zinc-100">{price.toLocaleString()}</span>
                 <span className="text-[10px] font-bold text-primary/40 dark:text-zinc-500">د.ع</span>
               </div>
               {originalPrice > price && (
                 <Badge className="bg-secondary text-white font-black text-[9px] h-6 px-2">خصم {Math.round(((originalPrice - price) / originalPrice) * 100)}%</Badge>
               )}
            </div>
          </div>

          <div className="h-px bg-border/50 dark:bg-zinc-800" />

          {availableColors.length > 0 && (
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">الألوان</Label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(c => (
                  <button key={c} onClick={() => { setSelectedColor(c); setSelectedSize(null); }} className={cn("px-4 py-2 rounded-xl border-2 font-black text-[10px] transition-all", selectedColor === c ? "border-primary bg-primary text-white" : "border-border dark:border-zinc-800 text-primary/40 dark:text-zinc-500 bg-white dark:bg-zinc-900")}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">القياس</Label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s: any) => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={cn("h-10 w-10 rounded-xl border-2 flex items-center justify-center font-black text-[10px] transition-all", selectedSize === s ? "border-primary bg-primary text-white" : "border-border dark:border-zinc-800 text-primary/40 dark:text-zinc-500 bg-white dark:bg-zinc-900")}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
               <Label className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">الوصف</Label>
               <p className={cn("text-xs font-bold text-primary/60 dark:text-zinc-400 leading-relaxed", !isDescExpanded && "line-clamp-3")}>{product.description}</p>
               {product.description?.length > 100 && (
                 <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="mt-1 text-[10px] font-black text-secondary">{isDescExpanded ? "إغلاق" : "عرض المزيد"}</button>
               )}
            </div>
            <DetailSection title="المكونات" content={product.ingredients} />
            <DetailSection title="طريقة الاستخدام" content={product.howToUse} />
            <DetailSection title="خامة القماش" content={product.material} />
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-4">
             {[{ icon: Truck, label: 'توصيل سريع' }, { icon: ShieldCheck, label: 'جودة ملكية' }, { icon: RotateCcw, label: 'إرجاع سهل' }].map((f, i) => (
               <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-3 flex flex-col items-center gap-1.5 border border-border/20 dark:border-zinc-800 shadow-sm">
                 <f.icon className="h-4 w-4 text-secondary" />
                 <span className="text-[8px] font-black text-primary/40 dark:text-zinc-500 text-center">{f.label}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-border/30 dark:border-zinc-800 z-50 pb-safe shadow-2xl">
         <div className="container mx-auto max-w-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-accent/50 dark:bg-zinc-800 rounded-2xl p-1 h-14">
                <button onClick={() => setQuantity(Math.max(1, qty - 1))} className="h-12 w-10 flex items-center justify-center text-primary/40"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-black text-primary dark:text-zinc-100 text-sm">{qty}</span>
                <button onClick={() => setQuantity(qty + 1)} className="h-12 w-10 flex items-center justify-center text-primary/40"><Plus className="h-4 w-4" /></button>
              </div>
              <Button onClick={handleAddToCart} variant="outline" className="flex-1 h-14 rounded-2xl border-primary/20 text-primary font-black gap-3">
                  <ShoppingBag className="h-5 w-5" /> أضف للسلة
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleBuyNow} className="flex-1 h-14 rounded-2xl bg-primary text-white text-md font-black shadow-lg shadow-primary/20 gap-3">
                  <Zap className="h-5 w-5 fill-current text-secondary" /> اشترِ الآن
              </Button>
              <button onClick={() => window.open(`https://wa.me/9647858833838?text=أود الاستفسار عن ${product.name}`, '_blank')} className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 flex items-center justify-center text-green-500 shadow-sm"><MessageCircle className="h-7 w-7" /></button>
            </div>
         </div>
      </div>
    </div>
  );
}

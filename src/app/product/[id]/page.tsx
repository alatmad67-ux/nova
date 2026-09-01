
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Check,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { useCart } from '@/providers/cart-provider';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';

export default function ProductPage() {
  const { id } = useParams();
  const db = useFirestore();
  const docRef = useMemo(() => id ? doc(db, 'products', id as string) : null, [db, id]);
  const { data: product, loading } = useDoc(docRef);
  
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const isFav = favorites.includes(id as string);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <span className="font-bold">جاري تحميل سحر NOVA...</span>
      </div>
    </div>
  );
  
  if (!product) return <div className="min-h-screen bg-background flex items-center justify-center">المنتج غير موجود</div>;

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
    if (!currentVariant || currentVariant.stock === 0) {
      toast({ variant: "destructive", title: "نفد المخزون", description: "عذراً، هذا الخيار غير متوفر حالياً" });
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
        sku: currentVariant.sku || `${product.id}-${selectedColor}-${selectedSize}`
      },
      quantity
    });

    toast({ title: "تمت الإضافة", description: "تمت إضافة المنتج إلى سلة المشتريات بنجاح" });
  };

  const handleWhatsAppOrder = () => {
    const text = `مرحباً NOVA، أود الاستفسار عن:
المنتج: ${product.name}
اللون: ${selectedColor || 'لم يتم الاختيار'}
القياس: ${selectedSize || 'لم يتم الاختيار'}
السعر: ${product.price.toLocaleString()} د.ع`;
    window.open(`https://wa.me/9647858833838?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-accent border border-border shadow-premium group">
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <Button 
                  onClick={() => toggleFavorite(product.id)}
                  variant="outline" size="icon" 
                  className={cn(
                    "rounded-full border-none shadow-xl transition-all",
                    isFav ? "bg-primary text-white" : "bg-white/80 backdrop-blur-sm text-primary hover:bg-primary hover:text-white"
                  )}
                >
                  <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm border-none shadow-xl text-primary hover:bg-primary hover:text-white">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar justify-center md:justify-start">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative h-24 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                    activeImage === idx ? "border-primary scale-105 shadow-lg shadow-primary/10" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span className="text-xs font-black text-primary tracking-[0.3em] uppercase">{product.categoryName}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight mb-6">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-1.5 text-secondary">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-black text-lg text-primary">5.0</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className={cn(
                  "text-sm font-bold",
                  (currentVariant?.stock > 0 || !selectedColor) ? "text-green-600" : "text-red-500"
                )}>
                  {(!selectedColor || !selectedSize) ? "يرجى اختيار اللون والقياس" : currentVariant?.stock > 0 ? "متوفر الآن" : "نفد من المخزن"}
                </span>
              </div>
            </div>

            <div className="bg-accent p-8 rounded-[2.5rem] border border-border/50 mb-10 shadow-sm">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-black text-primary">{product.price.toLocaleString()}</span>
                <span className="text-sm font-bold text-primary/40">د.ع</span>
              </div>
              {product.originalPrice && (
                <div className="flex items-center gap-3">
                  <span className="text-primary/20 line-through text-xl">{product.originalPrice.toLocaleString()} د.ع</span>
                  <Badge className="bg-secondary text-white font-black rounded-lg">خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</Badge>
                </div>
              )}
            </div>

            {/* Selection Options */}
            <div className="space-y-8 mb-12">
              <div className="space-y-4">
                <label className="text-sm font-black text-primary/60 tracking-widest block uppercase">اللون المتوفر</label>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-6 py-3 rounded-2xl border-2 transition-all font-bold text-sm",
                        selectedColor === color 
                          ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" 
                          : "border-border bg-white text-primary/40 hover:border-primary/30"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-primary/60 tracking-widest block uppercase">القياس</label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes?.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "w-14 h-14 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center",
                        selectedSize === size 
                          ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" 
                          : "border-border bg-white text-primary/40 hover:border-primary/30"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <Button 
                onClick={handleAddToCart}
                size="lg" 
                className="h-16 rounded-2xl text-xl font-black bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                <ShoppingBag className="ml-2 h-6 w-6" />
                أضف للسلة
              </Button>
              <Button 
                onClick={handleWhatsAppOrder}
                variant="outline" 
                size="lg" 
                className="h-16 rounded-2xl text-lg font-black border-2 border-primary text-primary hover:bg-primary hover:text-white gap-2 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="h-6 w-6" />
                استفسار سريع
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-10">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-accent rounded-3xl border border-border/50">
                  <ShieldCheck className="h-6 w-6 text-secondary" />
                </div>
                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">جودة ملكية</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-accent rounded-3xl border border-border/50">
                  <Truck className="h-6 w-6 text-secondary" />
                </div>
                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">توصيل سريع</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-accent rounded-3xl border border-border/50">
                  <RotateCcw className="h-6 w-6 text-secondary" />
                </div>
                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">إرجاع سهل</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Tabs */}
        <section className="mt-24">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-16 p-0 gap-12">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-xl px-0 text-primary/40 data-[state=active]:text-primary"
              >
                تفاصيل القطعة
              </TabsTrigger>
              <TabsTrigger 
                value="shipping" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-xl px-0 text-primary/40 data-[state=active]:text-primary"
              >
                التوصيل والإرجاع
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="py-12">
              <div className="max-w-4xl space-y-8">
                <p className="text-primary/60 leading-relaxed text-lg font-medium">
                  {product.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['أقمشة عالمية فاخرة', 'تصاميم حصرية لنوفا', 'خياطة يدوية دقيقة', 'ألوان ثابتة وجودة مضمونة'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 bg-accent p-4 rounded-2xl border border-border/50">
                      <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-secondary" />
                      </div>
                      <span className="text-primary/80 font-bold">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shipping" className="py-12 text-primary/60 text-lg font-medium">
              يتم التوصيل خلال 24-48 ساعة داخل بغداد، و 3-5 أيام لكافة المحافظات العراقية. سياسة الإرجاع تضمن لكِ حق الاستبدال خلال 3 أيام من الاستلام في حال وجود أي ملاحظات على الجودة.
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

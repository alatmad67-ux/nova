
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useCart } from '@/providers/cart-provider';

const NAV_ITEMS = [
  { label: 'الرئيسية', icon: Home, href: '/' },
  { label: 'المنتجات', icon: Grid, href: '/shop' },
  { label: 'السلة', icon: ShoppingBag, href: '/cart' },
  { label: 'المفضلة', icon: Heart, href: '/wishlist' },
  { label: 'حسابي', icon: User, href: '/account' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // We reverse the array for display to match the screenshot (Home on right, Account on left for RTL)
  const displayItems = [...NAV_ITEMS].reverse();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] h-20 bg-white/95 backdrop-blur-xl border-t border-primary/5 md:hidden pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      <div className="grid h-full grid-cols-5 items-center justify-items-center">
        {displayItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 relative px-2 py-1",
                isActive ? "text-primary scale-110" : "text-primary/30"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-6 w-6 transition-all")} strokeWidth={isActive ? 2.5 : 2} />
                {item.label === 'السلة' && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-lg border border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-black", isActive ? "opacity-100" : "opacity-60")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

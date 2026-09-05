
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

  // In RTL layout (dir="rtl"), the first item in the grid appears on the right.
  // We want Home on the right, so we keep the array as is.
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] h-20 bg-white border-t border-primary/5 md:hidden pb-safe shadow-xl">
      <div className="grid h-full grid-cols-5 items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                isActive ? "text-primary" : "text-primary/30"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-6 w-6")} strokeWidth={isActive ? 2.5 : 2} />
                {item.label === 'السلة' && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-md border border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-black")}>
                {item.label}
              </span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-0.5 shadow-sm" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

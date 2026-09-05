
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: 'الرئيسية', icon: Home, href: '/' },
  { label: 'المنتجات', icon: Grid, href: '/shop' },
  { label: 'السلة', icon: ShoppingBag, href: '/cart' },
  { label: 'المفضلة', icon: Heart, href: '/wishlist' },
  { label: 'حسابي', icon: User, href: '/account' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] h-20 bg-white/90 backdrop-blur-2xl border-t border-border/30 md:hidden pb-safe">
      <div className="grid h-full grid-cols-5 items-center justify-items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 relative px-2 py-1",
                isActive ? "text-primary" : "text-primary/30"
              )}
            >
              <Icon className={cn("h-6 w-6 transition-all", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

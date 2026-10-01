"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Heart, User, Package } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useCart } from '@/providers/cart-provider';

const NAV_ITEMS = [
  { label: 'الرئيسية', icon: Home, href: '/' },
  { label: 'الأقسام', icon: Grid, href: '/categories' },
  { label: 'المفضلة', icon: Heart, href: '/wishlist' },
  { label: 'الطلبات', icon: Package, href: '/account/orders' },
  { label: 'حسابي', icon: User, href: '/account' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { favorites } = useCart();
  const favCount = favorites.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] h-24 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-primary/5 dark:border-zinc-800 md:hidden pb-safe shadow-2xl rounded-t-[3rem]">
      <div className="grid h-full grid-cols-5 items-center px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all relative",
                isActive ? "text-secondary scale-110" : "text-primary/20 dark:text-zinc-600 hover:text-primary/40 dark:hover:text-zinc-400"
              )}
            >
              <div className="relative p-1">
                <Icon className={cn("h-6 w-6")} strokeWidth={isActive ? 3 : 2} />
                {item.label === 'المفضلة' && favCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-secondary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900">
                    {favCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[9px] font-black tracking-tight", isActive ? "opacity-100" : "opacity-0 h-0")}>
                {item.label}
              </span>
              {isActive && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-secondary shadow-sm" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

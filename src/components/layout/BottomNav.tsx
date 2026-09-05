
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, User, Heart, ShoppingBag } from 'lucide-react';
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: 'الرئيسية', icon: Home, href: '/' },
  { label: 'الأقسام', icon: Grid, href: '/categories' },
  { label: 'بحث', icon: Search, href: '/search' },
  { label: 'المفضلة', icon: Heart, href: '/wishlist' },
  { label: 'حسابي', icon: User, href: '/account' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] h-20 bg-white/90 backdrop-blur-2xl border-t border-border/50 md:hidden pb-safe animate-in slide-in-from-bottom-full duration-500">
      <div className="grid h-full grid-cols-5 items-center justify-items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 relative px-4 py-2",
                isActive ? "text-primary" : "text-primary/20 hover:text-primary/40"
              )}
            >
              <Icon className={cn("h-6 w-6 transition-all duration-500", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300", 
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 h-1 w-8 bg-primary rounded-b-full shadow-lg shadow-primary/20" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, User, Heart } from 'lucide-react';
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: 'الرئيسية', icon: Home, href: '/' },
  { label: 'الأقسام', icon: Grid, href: '/categories' },
  { label: 'بحث', icon: Search, href: '/search' },
  { label: 'المفضلة', icon: Heart, href: '/wishlist' },
  { label: 'حسابي', icon: User, href: '/admin/login' }, // Redirecting to admin for now as requested
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white/80 backdrop-blur-xl border-t border-border/40 md:hidden animate-in fade-in slide-in-from-bottom-5">
      <div className="grid h-full grid-cols-5 items-center justify-items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 relative px-4",
                isActive ? "text-primary" : "text-primary/30 hover:text-primary/60"
              )}
            >
              <Icon className={cn("h-6 w-6 transition-transform duration-300", isActive && "scale-110")} />
              <span className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "opacity-100" : "opacity-0")}>{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-2 h-1 w-4 rounded-full bg-secondary shadow-lg shadow-secondary/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

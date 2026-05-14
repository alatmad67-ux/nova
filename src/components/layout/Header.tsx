"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, Bell, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4 md:gap-10">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden text-slate-600 h-9 w-9">
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center">
              <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">النهرين<span className="text-primary">.</span></span>
            </Link>
          </div>

          {/* Search Bar - Responsive */}
          <div className="hidden flex-1 max-w-2xl md:flex">
            <div className="relative w-full group">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="search"
                placeholder="ابحث عن الماركات، المنتجات، والأقسام..."
                className="w-full h-11 pr-12 pl-4 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:bg-white transition-all rounded-xl text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-1 md:gap-4">
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-slate-600 rounded-full hover:bg-slate-50">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-600 rounded-full hover:bg-slate-50">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-slate-900 rounded-full hover:bg-slate-50">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary text-white flex items-center justify-center rounded-full text-[9px] font-bold border-2 border-white">
                  3
                </span>
              </Button>
            </Link>

            <div className="hidden md:block h-6 w-px bg-slate-200 mx-1" />

            <Button variant="ghost" className="hidden lg:flex gap-2 text-slate-700 font-bold hover:bg-slate-50 rounded-xl px-4">
              <User className="h-5 w-5 text-slate-400" />
              تسجيل الدخول
            </Button>
            
            <Button size="icon" variant="ghost" className="lg:hidden text-slate-700">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search - Visible only on mobile below header */}
        <div className="pb-4 md:hidden">
          <div className="relative group">
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              type="search"
              placeholder="عن ماذا تبحث اليوم؟"
              className="w-full h-10 pr-11 bg-slate-100 border-none rounded-xl text-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

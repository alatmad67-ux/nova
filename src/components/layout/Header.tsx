
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-24 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="md:hidden text-primary">
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo NOVA */}
          <Link href="/" className="flex flex-col items-center group">
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-3xl md:text-5xl font-bold tracking-[0.2em] gold-text">NOVA</span>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="text-[10px] md:text-xs font-light tracking-[0.5em] text-white/60 uppercase -mt-1 group-hover:text-primary transition-colors">Women Fashion</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden flex-1 max-w-md lg:flex mx-8">
            <div className="relative w-full group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="ابحثي عن قطعتك المفضلة..."
                className="w-full h-11 pr-12 bg-white/5 border-white/10 focus:border-primary/50 text-white rounded-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-primary">
                <User className="h-6 w-6" />
              </Button>
            </Link>
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-white/80 hover:text-primary">
                <ShoppingBag className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-black flex items-center justify-center rounded-full text-[10px] font-bold">
                  0
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

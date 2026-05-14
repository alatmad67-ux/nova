
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary tracking-tight">النهرين</span>
              <span className="hidden text-xl font-light text-muted-foreground md:inline-block">Nahrain</span>
            </Link>
          </div>

          {/* Search Bar - Responsive */}
          <div className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ابحث عن منتجاتك المفضلة..."
                className="w-full pr-10 pl-4 bg-secondary/50 focus:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]" variant="default">3</Badge>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="default" className="hidden md:flex bg-primary hover:bg-primary/90">
              تسجيل الدخول
            </Button>
          </div>
        </div>

        {/* Mobile Search - Visible only on mobile below header */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="عن ماذا تبحث اليوم؟"
              className="w-full pr-10 bg-secondary/50 rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

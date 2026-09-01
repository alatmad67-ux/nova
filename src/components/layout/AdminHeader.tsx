
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { LogOut, LayoutGrid, ShoppingBag, Package, Settings, Image as ImageIcon } from 'lucide-react';
import { useAuth, useDoc, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc } from 'firebase/firestore';

export function AdminHeader() {
  const auth = useAuth();
  const router = useRouter();
  const db = useFirestore();
  const settingsRef = useMemo(() => doc(db, 'settings', 'general'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  return (
    <header className="h-20 bg-white border-b border-border flex items-center px-8 justify-between sticky top-0 z-50">
      <Link href="/admin/dashboard" className="flex items-center gap-4 group">
        {settings?.logo ? (
          <div className="relative h-10 w-24">
            <Image src={settings.logo} alt="NOVA" fill className="object-contain" />
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-xl font-black text-primary tracking-widest">NOVA</span>
            <span className="text-[8px] block text-secondary font-bold uppercase tracking-[0.2em] -mt-1">Control Panel</span>
          </div>
        )}
      </Link>

      <nav className="hidden lg:flex items-center gap-8">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-xs font-bold text-primary/60 hover:text-primary transition-colors">
          <LayoutGrid className="h-4 w-4" /> لوحة التحكم
        </Link>
        <Link href="/admin/products" className="flex items-center gap-2 text-xs font-bold text-primary/60 hover:text-primary transition-colors">
          <ShoppingBag className="h-4 w-4" /> المنتجات
        </Link>
        <Link href="/admin/orders" className="flex items-center gap-2 text-xs font-bold text-primary/60 hover:text-primary transition-colors">
          <Package className="h-4 w-4" /> الطلبات
        </Link>
        <Link href="/admin/slider" className="flex items-center gap-2 text-xs font-bold text-primary/60 hover:text-primary transition-colors">
          <ImageIcon className="h-4 w-4" /> السلايدر
        </Link>
        <Link href="/admin/settings" className="flex items-center gap-2 text-xs font-bold text-primary/60 hover:text-primary transition-colors">
          <Settings className="h-4 w-4" /> الإعدادات
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <button 
          onClick={handleLogout}
          className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary/60 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

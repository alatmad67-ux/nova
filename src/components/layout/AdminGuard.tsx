
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

const ADMIN_PHONE = '07858833838';
const ADMIN_EMAIL = `${ADMIN_PHONE}@novafashion.iq`;

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/admin/login');
      }
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري التحقق من الصلاحيات...</div>;
  
  if (!user || user.email !== ADMIN_EMAIL) return null;

  return <>{children}</>;
}

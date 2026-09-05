
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

// الثوابت الموحدة للمديرة
const ADMIN_EMAIL_1 = '07858833838@novafashion.iq';
const ADMIN_EMAIL_2 = '+9647858833838@nova-auth.local';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      const email = user?.email?.toLowerCase() || '';
      if (!user || (email !== ADMIN_EMAIL_1 && email !== ADMIN_EMAIL_2)) {
        console.warn('Unauthorized access attempt to admin area');
        router.push('/admin/login');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary font-arabic">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
        <p className="text-sm font-black tracking-widest uppercase animate-pulse">جاري التحقق من هوية NOVA...</p>
      </div>
    );
  }
  
  if (!isAuthorized) return null;

  return <>{children}</>;
}

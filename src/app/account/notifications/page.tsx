
"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  Bell, 
  ChevronLeft, 
  Clock, 
  ShoppingBag, 
  Sparkles,
  Info,
  CheckCircle2,
  Package
} from 'lucide-react';
import { STORE_ID } from '@/lib/constants';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function NotificationsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();

  const notifyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('storeId', '==', STORE_ID),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: notifications, loading } = useCollection(notifyQuery);

  const handleRead = async (id: string) => {
    if (!db) return;
    updateDoc(doc(db, 'notifications', id), { isRead: true });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-5 w-5 text-blue-500" />;
      case 'promo': return <Sparkles className="h-5 w-5 text-secondary" />;
      case 'alert': return <Info className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-primary/40" />;
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center animate-pulse font-black text-primary">جاري تحميل تنبيهات NOVA...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32" dir="rtl">
      <header className="h-20 flex items-center px-6 justify-between bg-white sticky top-0 z-40 border-b border-border/50">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">الإشعارات</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-5 py-6 space-y-4 max-w-lg">
        {notifications && notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <div 
              key={notif.id} 
              onClick={() => handleRead(notif.id)}
              className={cn(
                "p-5 rounded-[2rem] border transition-all flex gap-4",
                notif.isRead ? "bg-white border-border/50 opacity-60" : "bg-primary/5 border-primary/10 shadow-sm"
              )}
            >
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-black text-primary">{notif.title}</h4>
                  {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-primary/60 font-bold leading-relaxed">{notif.body}</p>
                <div className="flex items-center gap-1.5 text-[9px] text-primary/30 font-black mt-3">
                  <Clock className="h-3 w-3" />
                  {notif.createdAt?.seconds ? format(new Date(notif.createdAt.seconds * 1000), 'PPP', { locale: ar }) : ''}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-20 text-primary">
            <Bell className="h-16 w-16 mx-auto mb-4" />
            <p className="font-black">لا توجد إشعارات جديدة</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

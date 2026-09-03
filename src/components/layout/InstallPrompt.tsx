
"use client";

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

/**
 * مكون إشعار تثبيت المتجر على الهاتف.
 * يظهر بجمالية عالية ويستخدم شعار المتجر المرفوع في الإعدادات.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const db = useFirestore();
  const settingsRef = doc(db, 'settings', 'general');
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    // التحقق مما إذا كان التطبيق مثبتاً بالفعل
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // إظهار الإشعار بعد 4 ثوانٍ من دخول المتجر
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-96 animate-in slide-in-from-bottom-10 duration-1000">
      <div className="bg-white/95 backdrop-blur-xl border-2 border-primary/10 rounded-[2.5rem] p-6 shadow-2xl shadow-primary/20 relative overflow-hidden group">
        {/* تأثيرات خلفية فنية */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-all" />
        
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 left-4 p-1 text-primary/20 hover:text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-accent flex-shrink-0 border border-primary/10 shadow-sm p-1">
            <div className="relative h-full w-full rounded-xl overflow-hidden">
              {settings?.logo ? (
                <Image src={settings.logo} alt="NOVA" fill className="object-contain" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-white font-black text-xl">N</div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3 w-3 text-secondary" />
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">متجر NOVA الرسمي</span>
            </div>
            <h4 className="text-sm font-black text-primary">ثبتي متجرنا على هاتفكِ الآن</h4>
            <p className="text-[10px] text-primary/60 font-medium mt-0.5 leading-tight">للوصول السريع لأحدث المجموعات والاستلام الفوري للتحديثات</p>
          </div>
        </div>

        <Button 
          onClick={handleInstall}
          className="w-full mt-6 h-14 rounded-2xl bg-primary text-white font-black hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 gap-3 border-b-4 border-primary-foreground/10"
        >
          <Download className="h-5 w-5" />
          تثبيت تطبيق NOVA
        </Button>
      </div>
    </div>
  );
}

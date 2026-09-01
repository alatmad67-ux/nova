
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Avoid throwing in development as it can cause unmount/remount loops
      // that crash the Firestore SDK internal state.
      console.error('Firestore Permission Error:', error);
      
      toast({
        variant: "destructive",
        title: "خطأ في الصلاحيات",
        description: "عذراً، حدث خطأ في الوصول للبيانات. يرجى التحقق من تسجيل الدخول.",
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}

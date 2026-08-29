
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, we let the global error handler show the detailed error screen.
      // In production, we show a toast.
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في الصلاحيات",
          description: "عذراً، ليس لديك الصلاحية الكافية لإتمام هذه العملية.",
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}

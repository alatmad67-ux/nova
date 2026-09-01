
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Avoid logging errors to console in a way that triggers multiple overlays
      console.error('Firestore Permission Context:', error.context);
      
      // We only show toast for real errors, and avoid confusing the user with login requirements
      // unless they are explicitly trying to access admin routes.
      const is_admin_route = window.location.pathname.startsWith('/admin');

      if (is_admin_route) {
        toast({
          variant: "destructive",
          title: "خطأ في الصلاحيات",
          description: "يرجى تسجيل الدخول كمدير للوصول لهذه الصفحة.",
        });
      } else {
        // For public storefront, we just log and wait for rules to sync.
        // Avoid showing "please login" to customers.
        console.warn('Public access syncing...');
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}

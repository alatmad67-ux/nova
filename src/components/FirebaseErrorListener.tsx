
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // We only show toast for real errors, and avoid confusing the user with login requirements
      // unless they are explicitly trying to access admin routes.
      const is_admin_route = window.location.pathname.startsWith('/admin');

      if (is_admin_route) {
        toast({
          variant: "destructive",
          title: "خطأ في الصلاحيات",
          description: "يرجى تسجيل الدخول كمدير للوصول لهذه الصفحة.",
        });
      }
      // For public storefront, we suppress the console error to avoid dev overlays.
      // The rules will eventually sync and the data will appear.
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}

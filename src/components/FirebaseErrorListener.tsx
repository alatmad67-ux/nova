
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

export function FirebaseErrorListener() {
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Check if we are on an admin route
      const is_admin_route = window.location.pathname.startsWith('/admin');

      if (is_admin_route) {
        if (!user) {
          toast({
            variant: "destructive",
            title: "تنبيه الأمان",
            description: "يرجى تسجيل الدخول كمسؤولة للوصول لهذه الصفحة.",
          });
        } else if (user.email !== '07858833838@novafashion.iq') {
          toast({
            variant: "destructive",
            title: "صلاحيات محدودة",
            description: "هذا الحساب لا يمتلك صلاحيات إدارية في NOVA.",
          });
        } else {
          // If user is correct but still getting error, it's likely a rules sync lag or query issue
          console.warn('Firestore Permission Denied for Admin. Possible causes: Indexing or Rule Sync Lag.', error.context);
        }
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast, user]);

  return null;
}

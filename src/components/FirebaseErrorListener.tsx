
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL_1 = '07858833838@novafashion.iq';
const ADMIN_EMAIL_2 = '+9647858833838@nova-auth.local';

export function FirebaseErrorListener() {
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      const is_admin_route = window.location.pathname.startsWith('/admin');
      const email = user?.email?.toLowerCase() || '';
      const isAdmin = email === ADMIN_EMAIL_1 || email === ADMIN_EMAIL_2;

      if (is_admin_route) {
        if (!user) {
          toast({
            variant: "destructive",
            title: "تنبيه الأمان",
            description: "يرجى تسجيل الدخول كمسؤولة للوصول لهذه الصفحة.",
          });
          router.push('/admin/login');
        } else if (!isAdmin) {
          toast({
            variant: "destructive",
            title: "صلاحيات محدودة",
            description: "هذا الحساب لا يمتلك صلاحيات إدارية في NOVA.",
          });
          router.push('/');
        }
      } else {
        // Customer routes permission errors
        if (!user) {
          toast({
            title: "انتهت الجلسة",
            description: "يرجى تسجيل الدخول لمتابعة التسوق وإدارة حسابكِ.",
          });
        } else {
          console.warn('Firestore Permission Denied for User:', error.context);
        }
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast, user, router]);

  return null;
}

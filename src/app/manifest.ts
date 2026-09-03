
import { MetadataRoute } from 'next';

/**
 * ملف التعريف الخاص بتطبيق الويب (PWA)
 * يقوم بتحديد اسم التطبيق وأيقوناته وسلوكه عند التثبيت على الهاتف.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'نوفا للأزياء النسائية - NOVA',
    short_name: 'نوفا',
    description: 'متجر نوفا للأزياء النسائية الفاخرة - تصاميم حصرية تناسب ذوقكِ الرفيع في العراق',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4c1d95',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: 'https://picsum.photos/seed/nova-icon/192/192', // Placeholder icon if settings fail
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/nova-icon/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

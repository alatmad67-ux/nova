
import { MetadataRoute } from 'next';

/**
 * ملف Manifest ديناميكي لمتجر NOVA.
 * يحاول جلب شعار المتجر من الإعدادات أو استخدام شعار افتراضي.
 */
export default function manifest(): MetadataRoute.Manifest {
  // ملاحظة: الأيقونات في الـ PWA يفضل أن تكون ثابتة في مجلد public لضمان العمل بدون إنترنت
  // ولكن سنقوم بضبط المسارات لتكون جاهزة لاستقبال شعار المتجر
  return {
    name: 'نوفا للأزياء النسائية - NOVA',
    short_name: 'NOVA',
    description: 'متجر نوفا للأزياء النسائية الفاخرة - تصاميم حصرية في العراق',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4c1d95',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      {
        src: 'https://res.cloudinary.com/nova-fashion/image/upload/v1/nova-assets/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'https://res.cloudinary.com/nova-fashion/image/upload/v1/nova-assets/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  };
}

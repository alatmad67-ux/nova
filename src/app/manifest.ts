
import { MetadataRoute } from 'next';

/**
 * ملف Manifest ديناميكي لمتجر NOVA.
 * تم تحديثه لضمان ظهور الأيقونة الصحيحة على كافة الأنظمة بما فيها iOS.
 */
export default function manifest(): MetadataRoute.Manifest {
  // استخدام الرابط المباشر المعتمد للشعار
  const logoUrl = 'https://c.top4top.io/p_39007qwdb0.png';

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
        src: logoUrl,
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: logoUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  };
}

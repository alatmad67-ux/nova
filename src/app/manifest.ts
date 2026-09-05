
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
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
        src: 'https://picsum.photos/seed/nova-icon-192/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'https://picsum.photos/seed/nova-icon-512/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  };
}

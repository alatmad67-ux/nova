
'use server';

import cloudinary from '@/lib/cloudinary';

/**
 * أكشن رفع الصور الحقيقي لمتجر NOVA.
 * يتم استخدامه في لوحة التحكم لرفع صور المنتجات والسلايدر واللوغو.
 */
export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('لم يتم اختيار ملف');

  // التحقق من وجود الإعدادات
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    throw new Error('إعدادات Cloudinary غير مكتملة في السيرفر');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nova-official-store',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return result.secure_url;
  } catch (error: any) {
    console.error('Final Upload Crash:', error);
    throw new Error(error.message || 'فشل في رفع الصورة، يرجى التحقق من الاتصال');
  }
}

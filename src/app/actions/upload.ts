
'use server';

import cloudinary from '@/lib/cloudinary';

/**
 * أكشن رفع الصور الحقيقي لمتجر NOVA.
 * تم تعديله لإلغاء الصور العشوائية وفرض الرفع الحقيقي.
 */
export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('لم يتم اختيار ملف');

  // التأكد من أن مفاتيح Cloudinary موجودة
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('إعدادات Cloudinary مفقودة من السيرفر. يرجى التأكد من ضبط الـ Environment Variables.');
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
          fetch_format: 'auto',
          // ضمان استلام الرابط بصيغة HTTPS
          secure: true 
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error Details:', error);
            reject(new Error(`فشل الرفع لـ Cloudinary: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return result.secure_url;
  } catch (error: any) {
    console.error('Upload Action Crash:', error);
    throw new Error(error.message || 'فشل في رفع الصورة، يرجى التحقق من اتصالك وحجم الملف');
  }
}

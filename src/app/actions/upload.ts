
'use server';

import cloudinary from '@/lib/cloudinary';

/**
 * أكشن رفع الصور الحقيقي لمتجر NOVA.
 * تم تحسينه لإعطاء تفاصيل دقيقة للخطأ.
 */
export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('لم يتم اختيار ملف');

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
          secure: true 
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Error:', error);
            reject(new Error(error.message || 'فشل الرفع لـ Cloudinary'));
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return result.secure_url;
  } catch (error: any) {
    console.error('Upload Error:', error);
    throw new Error(error.message || 'حدث خطأ أثناء محاولة رفع الصورة');
  }
}

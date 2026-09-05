
'use server';

import cloudinary from '@/lib/cloudinary';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('لم يتم اختيار ملف');

  // التحقق من وجود إعدادات Cloudinary
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.error('Cloudinary configuration is missing');
    // في حال عدم وجود الإعدادات، سنقوم بإرجاع صورة عشوائية مؤقتاً لكي لا يتوقف العمل
    return `https://picsum.photos/seed/${Math.random()}/800/1000`;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nova-fashion',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Error:', error);
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
    console.error('Upload Action Crash:', error);
    throw new Error(error.message || 'فشل في رفع الصورة للسيرفر');
  }
}

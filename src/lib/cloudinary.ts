
import { v2 as cloudinary } from 'cloudinary';

// تهيئة Cloudinary باستخدام البيانات الحقيقية
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'vntzf8g6',
  api_key: process.env.CLOUDINARY_API_KEY || '219673996356591',
  api_secret: process.env.CLOUDINARY_API_SECRET || '-JPPnCPsM-Uus9_iluJhTIWh3Xg',
  secure: true,
});

export default cloudinary;

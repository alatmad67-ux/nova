
"use client";

import React, { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadButtonProps {
  onUploadComplete: (url: string) => void;
  className?: string;
  label?: string;
}

export function ImageUploadButton({ onUploadComplete, className, label = "رفع صورة" }: ImageUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // فحص حجم الملف (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        variant: "destructive", 
        title: "الملف كبير جداً", 
        description: "يرجى اختيار صورة بحجم أقل من 10 ميجابايت" 
      });
      return;
    }

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // استدعاء الأكشن الحقيقي
      const url = await uploadImage(formData);
      
      // إذا نجح، نقوم بتحديث الواجهة بالرابط الحقيقي
      onUploadComplete(url);
      toast({ title: "تم الرفع بنجاح ✨", description: "الصورة الآن محفوظة في حساب NOVA" });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast({ 
        variant: "destructive", 
        title: "فشل الرفع الحقيقي", 
        description: err.message || "يرجى التحقق من إعدادات Cloudinary في السيرفر" 
      });
    } finally {
      setIsUploading(false);
      // مسح المدخل لتمكين اختيار نفس الملف مرة أخرى
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className={cn("w-full h-full min-h-[120px] flex flex-col gap-2", className)}>
      <input
        type="file"
        id={inputId}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full h-full border-2 border-dashed rounded-[2rem] flex flex-col gap-3 transition-all bg-white shadow-sm",
          isUploading ? "border-primary animate-pulse bg-primary/5" : "border-primary/10 hover:border-primary/30 hover:bg-primary/5",
          error ? "border-red-200 bg-red-50" : ""
        )}
        disabled={isUploading}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-black text-primary">جاري الرفع للحساب...</span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-primary/40" />
            <span className="text-xs font-black text-primary/60">{label}</span>
          </>
        )}
      </Button>
      
      {error && (
        <div className="flex items-start gap-1 text-[9px] text-red-500 font-bold px-2 leading-tight">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}


"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';
import { toast } from '@/hooks/use-toast';

interface ImageUploadButtonProps {
  onUploadComplete: (url: string) => void;
  className?: string;
  label?: string;
}

export function ImageUploadButton({ onUploadComplete, className, label = "رفع صورة" }: ImageUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const url = await uploadImage(formData) as string;
      onUploadComplete(url);
      toast({ title: "تم الرفع", description: "تم رفع الصورة بنجاح إلى السحابة" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل رفع الصورة" });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        id="image-upload-input"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-full border-dashed border-white/10 text-white/40 rounded-2xl flex flex-col gap-2 hover:bg-white/5"
        disabled={isUploading}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-[10px] font-bold">جاري الرفع...</span>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6" />
            <span className="text-[10px] font-bold">{label}</span>
          </>
        )}
      </Button>
    </div>
  );
}

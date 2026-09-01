
"use client";

import React, { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
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
  const inputId = useId(); // Generate a unique ID for each instance

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const url = await uploadImage(formData) as string;
      onUploadComplete(url);
      toast({ title: "تم الرفع", description: "تم رفع الصورة بنجاح" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل رفع الصورة" });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={cn("w-full h-full min-h-[100px]", className)}>
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
        className="w-full h-full border-2 border-dashed border-primary/20 text-primary/40 rounded-2xl flex flex-col gap-3 hover:bg-primary/5 hover:border-primary/40 transition-all bg-white"
        disabled={isUploading}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-black">جاري الرفع...</span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8" />
            <span className="text-xs font-black">{label}</span>
          </>
        )}
      </Button>
    </div>
  );
}

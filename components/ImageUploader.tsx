
import React, { useState, useRef, useCallback } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon, XCircleIcon } from './Icons';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageSelect: (file: ImageFile | null) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // remove the `data:mimeType;base64,` prefix
        resolve(result.split(',')[1]);
    }
    reader.onerror = (error) => reject(error);
  });


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("File size exceeds 4MB. Please choose a smaller file.");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setPreview(URL.createObjectURL(file));
        onImageSelect({ base64, mimeType: file.type });
      } catch (error) {
        console.error("Error converting file to base64", error);
        alert("There was an error processing your file.");
      }
    }
  }, [onImageSelect]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-purple-500', 'bg-gray-700/50');
    const file = event.dataTransfer.files?.[0];
     if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("File size exceeds 4MB. Please choose a smaller file.");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setPreview(URL.createObjectURL(file));
        onImageSelect({ base64, mimeType: file.type });
        if (fileInputRef.current) {
            fileInputRef.current.files = event.dataTransfer.files;
        }
      } catch (error) {
        console.error("Error converting file to base64", error);
        alert("There was an error processing your file.");
      }
    }
  }, [onImageSelect]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-purple-500', 'bg-gray-700/50');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-purple-500', 'bg-gray-700/50');
  };
  
  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div
        className="relative aspect-square w-full bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center text-center p-4 cursor-pointer hover:border-gray-500 transition-all duration-200"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          id={id}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="object-contain h-full w-full rounded-md" />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-gray-900/50 rounded-full text-white hover:bg-red-600/70 transition-colors"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <UploadIcon className="w-10 h-10 mb-2" />
            <span className="font-semibold">Click to upload</span>
            <span className="text-xs mt-1">or drag and drop</span>
            <span className="text-xs mt-2 text-gray-600">PNG, JPG, WEBP up to 4MB</span>
          </div>
        )}
      </div>
    </div>
  );
};

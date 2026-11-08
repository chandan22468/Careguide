import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadService } from "../../services/uploadService.ts";

interface ImageUploaderProps {
  photoUrls: string[];
  photoFileIds: string[];
  onChange: (urls: string[], fileIds: string[]) => void;
  maxPhotos?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  photoUrls,
  photoFileIds,
  onChange,
  maxPhotos = 3,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photoUrls.length >= maxPhotos) {
      setUploadError(`Maximum ${maxPhotos} photos allowed per entry.`);
      return;
    }

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadService.uploadImage(file);
      onChange([...photoUrls, result.url], [...photoFileIds, result.fileId]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (indexToRemove: number) => {
    const fileId = photoFileIds[indexToRemove];
    if (fileId) {
      try {
        await uploadService.deleteImage(fileId);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Could not delete the uploaded image.");
        return;
      }
    }
    onChange(
      photoUrls.filter((_, idx) => idx !== indexToRemove),
      photoFileIds.filter((_, idx) => idx !== indexToRemove)
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#17211D]">
          Progress Photos (Optional, up to {maxPhotos})
        </label>
        <span className="text-[11px] text-[#75817A]">
          {photoUrls.length}/{maxPhotos} attached
        </span>
      </div>

      {uploadError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {uploadError}
        </p>
      )}

      {/* Grid of uploaded thumbnails + add button */}
      <div className="flex flex-wrap gap-3">
        {photoUrls.map((url, idx) => (
          <div
            key={url + idx}
            className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#E7EBE7] group bg-[#F8F9F6]"
          >
            <img
              src={url}
              alt={`Progress thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => void handleRemove(idx)}
              type="button"
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
              title="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {photoUrls.length < maxPhotos && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#E7EBE7] hover:border-[#183C32]/40 bg-[#F8F9F6] flex flex-col items-center justify-center text-[#75817A] hover:text-[#183C32] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#183C32]" />
            ) : (
              <>
                <UploadCloud className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
